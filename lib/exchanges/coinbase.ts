/**
 * Coinbase API client for Token Impact.
 *
 * Fetches orderbook and volume data from Coinbase's public REST API.
 *
 * @see https://docs.cdp.coinbase.com/exchange/reference
 */

import { toExchangeSymbol } from '../symbols';
import type { ExchangeClient, ExchangeData } from './types';

/** Coinbase REST API base URL */
const COINBASE_API_BASE = 'https://api.exchange.coinbase.com';

/** Maximum retry attempts for rate limit errors */
const MAX_RETRIES = 3;

/** Base delay for exponential backoff (ms) */
const BASE_DELAY_MS = 1000;

/** Request timeout (ms) */
const REQUEST_TIMEOUT_MS = 5000;

/**
 * Coinbase orderbook API response format (level 2).
 * Level 2 provides aggregated orderbook with top 50 price levels.
 */
interface CoinbaseOrderbookResponse {
  bids: Array<[string, string, number]>; // [price, size, num_orders]
  asks: Array<[string, string, number]>; // [price, size, num_orders]
  sequence: number;
  auction_mode: boolean;
  auction?: unknown;
  time: string;
}

/**
 * Coinbase 24hr stats API response format.
 */
interface CoinbaseStatsResponse {
  open: string;
  high: string;
  low: string;
  last: string;
  volume: string; // Base asset volume
  volume_30day: string;
}

/**
 * Custom error for Coinbase API failures.
 */
class CoinbaseApiError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
    public readonly isRateLimited: boolean = false
  ) {
    super(message);
    this.name = 'CoinbaseApiError';
  }
}

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
        throw new CoinbaseApiError(
          `Rate limited: ${response.status}`,
          response.status,
          true
        );
      }

      throw new CoinbaseApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof CoinbaseApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new CoinbaseApiError('Request timeout', undefined, false);
    }

    throw new CoinbaseApiError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Executes a fetch with exponential backoff retry on rate limits.
 */
async function fetchWithRetry<T>(
  url: string,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchWithTimeout<T>(url);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Only retry on rate limit errors
      if (error instanceof CoinbaseApiError && error.isRateLimited) {
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt);
        await delay(delayMs);
        continue;
      }

      // Don't retry on other errors
      throw error;
    }
  }

  throw lastError ?? new CoinbaseApiError('Max retries exceeded');
}

/**
 * Fetches orderbook from Coinbase.
 *
 * @param nativeSymbol - Coinbase symbol (e.g., "BTC-USD")
 * @returns Normalized orderbook data
 */
async function fetchCoinbaseOrderbook(
  nativeSymbol: string
): Promise<ExchangeData['orderbook']> {
  // Level 2 provides aggregated orderbook with top 50 price levels
  const url = `${COINBASE_API_BASE}/products/${encodeURIComponent(nativeSymbol)}/book?level=2`;

  const response = await fetchWithRetry<CoinbaseOrderbookResponse>(url);

  // Convert string prices/quantities to numbers
  // Coinbase format: [price, size, num_orders]
  const bids: Array<[number, number]> = response.bids.map(
    ([price, size]) => [parseFloat(price), parseFloat(size)]
  );

  const asks: Array<[number, number]> = response.asks.map(
    ([price, size]) => [parseFloat(price), parseFloat(size)]
  );

  return {
    bids,
    asks,
    timestamp: Date.now(),
  };
}

/**
 * Fetches 24h volume from Coinbase.
 *
 * @param nativeSymbol - Coinbase symbol (e.g., "BTC-USD")
 * @returns 24h volume in base asset
 */
async function fetchCoinbaseVolume(nativeSymbol: string): Promise<number> {
  const url = `${COINBASE_API_BASE}/products/${encodeURIComponent(nativeSymbol)}/stats`;

  const response = await fetchWithRetry<CoinbaseStatsResponse>(url);

  return parseFloat(response.volume);
}

/**
 * Coinbase exchange client implementation.
 */
export const coinbaseClient: ExchangeClient = {
  id: 'coinbase',

  async fetchOrderbook(symbol: string): Promise<ExchangeData['orderbook']> {
    const nativeSymbol = toExchangeSymbol(symbol, 'coinbase');
    if (!nativeSymbol) {
      throw new CoinbaseApiError(`Unable to convert symbol: ${symbol}`);
    }

    return fetchCoinbaseOrderbook(nativeSymbol);
  },

  async fetchVolume(symbol: string): Promise<number> {
    const nativeSymbol = toExchangeSymbol(symbol, 'coinbase');
    if (!nativeSymbol) {
      throw new CoinbaseApiError(`Unable to convert symbol: ${symbol}`);
    }

    return fetchCoinbaseVolume(nativeSymbol);
  },

  async isSymbolSupported(symbol: string): Promise<boolean> {
    const nativeSymbol = toExchangeSymbol(symbol, 'coinbase');
    if (!nativeSymbol) {
      return false;
    }

    try {
      // Use the stats endpoint as a lightweight check
      const url = `${COINBASE_API_BASE}/products/${encodeURIComponent(nativeSymbol)}/stats`;
      await fetchWithTimeout<CoinbaseStatsResponse>(url);
      return true;
    } catch {
      return false;
    }
  },
};

export { CoinbaseApiError };
