/**
 * Kraken API client for Token Impact.
 *
 * Fetches orderbook and volume data from Kraken's public REST API.
 * Implements request queuing to respect Kraken's slow rate limits (1 req/sec).
 *
 * @see https://docs.kraken.com/rest/
 */

import { toExchangeSymbol } from '../symbols';
import type { ExchangeClient, ExchangeData } from './types';

/** Kraken REST API base URL */
const KRAKEN_API_BASE = 'https://api.kraken.com';

/** Maximum retry attempts for rate limit errors */
const MAX_RETRIES = 3;

/** Base delay for exponential backoff (ms) */
const BASE_DELAY_MS = 1000;

/** Request timeout (ms) */
const REQUEST_TIMEOUT_MS = 5000;

/** Minimum interval between Kraken requests (ms) - Kraken allows 1 req/sec */
const MIN_REQUEST_INTERVAL_MS = 1100;

/**
 * Kraken API response wrapper.
 * All Kraken responses follow this format with error array and result object.
 */
interface KrakenResponse<T> {
  error: string[];
  result: T;
}

/**
 * Kraken orderbook entry format.
 * [price, volume, timestamp]
 */
type KrakenOrderbookEntry = [string, string, number];

/**
 * Kraken Depth API response format.
 * The result contains a dynamic key based on the pair name.
 */
interface KrakenDepthResult {
  [pair: string]: {
    bids: KrakenOrderbookEntry[];
    asks: KrakenOrderbookEntry[];
  };
}

/**
 * Kraken Ticker API response format.
 * The result contains a dynamic key based on the pair name.
 */
interface KrakenTickerResult {
  [pair: string]: {
    /** Ask: [price, whole_lot_volume, lot_volume] */
    a: [string, string, string];
    /** Bid: [price, whole_lot_volume, lot_volume] */
    b: [string, string, string];
    /** Last trade closed: [price, lot_volume] */
    c: [string, string];
    /** Volume: [today, last_24_hours] */
    v: [string, string];
    /** Volume weighted average price: [today, last_24_hours] */
    p: [string, string];
    /** Number of trades: [today, last_24_hours] */
    t: [number, number];
    /** Low: [today, last_24_hours] */
    l: [string, string];
    /** High: [today, last_24_hours] */
    h: [string, string];
    /** Today's opening price */
    o: string;
  };
}

/**
 * Custom error for Kraken API failures.
 */
class KrakenApiError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
    public readonly isRateLimited: boolean = false
  ) {
    super(message);
    this.name = 'KrakenApiError';
  }
}

/**
 * Request queue for rate limiting.
 * Ensures minimum interval between Kraken API requests.
 */
class RequestQueue {
  private lastRequestTime = 0;
  private queue: Array<() => void> = [];
  private processing = false;

  /**
   * Adds a request to the queue and processes when ready.
   */
  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      void this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
        await delay(MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest);
      }

      const task = this.queue.shift();
      if (task) {
        this.lastRequestTime = Date.now();
        await task();
      }
    }

    this.processing = false;
  }
}

// Global request queue for Kraken API
const requestQueue = new RequestQueue();

/**
 * Delays execution for the specified duration.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Performs a fetch request with timeout and error handling.
 */
async function fetchWithTimeout<T>(
  url: string,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      // Check for rate limiting (HTTP 429)
      if (response.status === 429) {
        throw new KrakenApiError(
          `Rate limited: ${response.status}`,
          response.status,
          true
        );
      }

      throw new KrakenApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    const data = (await response.json()) as KrakenResponse<T>;

    // Check for Kraken API-level errors
    if (data.error && data.error.length > 0) {
      const errorMsg = data.error.join(', ');

      // Check for rate limit errors in Kraken's error format
      if (
        errorMsg.includes('Rate limit exceeded') ||
        errorMsg.includes('EAPI:Rate limit')
      ) {
        throw new KrakenApiError(errorMsg, undefined, true);
      }

      throw new KrakenApiError(`Kraken API error: ${errorMsg}`);
    }

    return data.result;
  } catch (error) {
    if (error instanceof KrakenApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new KrakenApiError('Request timeout', undefined, false);
    }

    throw new KrakenApiError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Executes a fetch with exponential backoff retry on rate limits.
 * Uses the request queue to prevent rate limit violations.
 */
async function fetchWithRetry<T>(
  url: string,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Use queue to respect rate limits
      return await requestQueue.enqueue(() => fetchWithTimeout<T>(url));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Only retry on rate limit errors
      if (error instanceof KrakenApiError && error.isRateLimited) {
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt);
        await delay(delayMs);
        continue;
      }

      // Don't retry on other errors
      throw error;
    }
  }

  throw lastError ?? new KrakenApiError('Max retries exceeded');
}

/**
 * Gets the first value from a Kraken result object.
 * Kraken results are keyed by pair name which may differ from the request.
 */
function getFirstResultValue<T>(result: Record<string, T>): T | undefined {
  const keys = Object.keys(result);
  const firstKey = keys[0];
  if (firstKey === undefined) {
    return undefined;
  }
  return result[firstKey];
}

/**
 * Fetches orderbook from Kraken.
 *
 * @param nativeSymbol - Kraken symbol (e.g., "XBTUSD")
 * @returns Normalized orderbook data
 */
async function fetchKrakenOrderbook(
  nativeSymbol: string
): Promise<ExchangeData['orderbook']> {
  const url = `${KRAKEN_API_BASE}/0/public/Depth?pair=${encodeURIComponent(nativeSymbol)}&count=500`;

  const response = await fetchWithRetry<KrakenDepthResult>(url);

  const pairData = getFirstResultValue(response);
  if (!pairData) {
    throw new KrakenApiError(`No orderbook data returned for ${nativeSymbol}`);
  }

  // Convert Kraken format [price, volume, timestamp] to [price, quantity]
  const bids: Array<[number, number]> = pairData.bids.map(
    ([price, volume]) => [parseFloat(price), parseFloat(volume)]
  );

  const asks: Array<[number, number]> = pairData.asks.map(
    ([price, volume]) => [parseFloat(price), parseFloat(volume)]
  );

  return {
    bids,
    asks,
    timestamp: Date.now(),
  };
}

/**
 * Fetches 24h volume from Kraken.
 *
 * @param nativeSymbol - Kraken symbol (e.g., "XBTUSD")
 * @returns 24h volume in base asset
 */
async function fetchKrakenVolume(nativeSymbol: string): Promise<number> {
  const url = `${KRAKEN_API_BASE}/0/public/Ticker?pair=${encodeURIComponent(nativeSymbol)}`;

  const response = await fetchWithRetry<KrakenTickerResult>(url);

  const tickerData = getFirstResultValue(response);
  if (!tickerData) {
    throw new KrakenApiError(`No ticker data returned for ${nativeSymbol}`);
  }

  // Volume is in index 1 (last 24 hours)
  const volume24h = tickerData.v[1];
  if (volume24h === undefined) {
    throw new KrakenApiError(`No 24h volume in ticker for ${nativeSymbol}`);
  }

  return parseFloat(volume24h);
}

/**
 * Kraken exchange client implementation.
 */
export const krakenClient: ExchangeClient = {
  id: 'kraken',

  async fetchOrderbook(symbol: string): Promise<ExchangeData['orderbook']> {
    const nativeSymbol = toExchangeSymbol(symbol, 'kraken');
    if (!nativeSymbol) {
      throw new KrakenApiError(`Unable to convert symbol: ${symbol}`);
    }

    return fetchKrakenOrderbook(nativeSymbol);
  },

  async fetchVolume(symbol: string): Promise<number> {
    const nativeSymbol = toExchangeSymbol(symbol, 'kraken');
    if (!nativeSymbol) {
      throw new KrakenApiError(`Unable to convert symbol: ${symbol}`);
    }

    return fetchKrakenVolume(nativeSymbol);
  },

  async isSymbolSupported(symbol: string): Promise<boolean> {
    const nativeSymbol = toExchangeSymbol(symbol, 'kraken');
    if (!nativeSymbol) {
      return false;
    }

    try {
      // Use the ticker endpoint as a lightweight check
      const url = `${KRAKEN_API_BASE}/0/public/Ticker?pair=${encodeURIComponent(nativeSymbol)}`;
      const response = await requestQueue.enqueue(() =>
        fetchWithTimeout<KrakenTickerResult>(url)
      );

      // Check if we got valid data back
      const tickerData = getFirstResultValue(response);
      return tickerData !== undefined;
    } catch {
      return false;
    }
  },
};

export { KrakenApiError };
