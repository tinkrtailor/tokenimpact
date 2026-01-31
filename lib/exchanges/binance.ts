/**
 * Binance API client for Token Impact.
 *
 * Fetches orderbook and volume data from Binance's public REST API.
 *
 * @see https://binance-docs.github.io/apidocs/spot/en/
 */

import { toExchangeSymbol } from '../symbols';
import type { ExchangeClient, ExchangeData } from './types';

/** Binance REST API base URL */
const BINANCE_API_BASE = 'https://api.binance.com';

/** Maximum retry attempts for rate limit errors */
const MAX_RETRIES = 3;

/** Base delay for exponential backoff (ms) */
const BASE_DELAY_MS = 1000;

/** Request timeout (ms) */
const REQUEST_TIMEOUT_MS = 5000;

/**
 * Binance orderbook API response format.
 */
interface BinanceOrderbookResponse {
  lastUpdateId: number;
  bids: Array<[string, string]>; // [price, quantity]
  asks: Array<[string, string]>; // [price, quantity]
}

/**
 * Binance 24hr ticker API response format.
 */
interface BinanceTicker24hrResponse {
  symbol: string;
  volume: string; // Base asset volume
  quoteVolume: string;
  lastPrice: string;
  priceChangePercent: string;
}

/**
 * Custom error for Binance API failures.
 */
class BinanceApiError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
    public readonly isRateLimited: boolean = false
  ) {
    super(message);
    this.name = 'BinanceApiError';
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
      // Check for rate limiting (HTTP 429 or Binance-specific 418)
      if (response.status === 429 || response.status === 418) {
        throw new BinanceApiError(
          `Rate limited: ${response.status}`,
          response.status,
          true
        );
      }

      throw new BinanceApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof BinanceApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new BinanceApiError('Request timeout', undefined, false);
    }

    throw new BinanceApiError(
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
      if (error instanceof BinanceApiError && error.isRateLimited) {
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt);
        await delay(delayMs);
        continue;
      }

      // Don't retry on other errors
      throw error;
    }
  }

  throw lastError ?? new BinanceApiError('Max retries exceeded');
}

/**
 * Fetches orderbook from Binance.
 *
 * @param nativeSymbol - Binance symbol (e.g., "BTCUSDT")
 * @returns Normalized orderbook data
 */
async function fetchBinanceOrderbook(
  nativeSymbol: string
): Promise<ExchangeData['orderbook']> {
  const url = `${BINANCE_API_BASE}/api/v3/depth?symbol=${encodeURIComponent(nativeSymbol)}&limit=500`;

  const response = await fetchWithRetry<BinanceOrderbookResponse>(url);

  // Convert string prices/quantities to numbers
  const bids: Array<[number, number]> = response.bids.map(([price, qty]) => [
    parseFloat(price),
    parseFloat(qty),
  ]);

  const asks: Array<[number, number]> = response.asks.map(([price, qty]) => [
    parseFloat(price),
    parseFloat(qty),
  ]);

  return {
    bids,
    asks,
    timestamp: Date.now(),
  };
}

/**
 * Fetches 24h volume from Binance.
 *
 * @param nativeSymbol - Binance symbol (e.g., "BTCUSDT")
 * @returns 24h volume in base asset
 */
async function fetchBinanceVolume(nativeSymbol: string): Promise<number> {
  const url = `${BINANCE_API_BASE}/api/v3/ticker/24hr?symbol=${encodeURIComponent(nativeSymbol)}`;

  const response = await fetchWithRetry<BinanceTicker24hrResponse>(url);

  return parseFloat(response.volume);
}

/**
 * Binance exchange client implementation.
 */
export const binanceClient: ExchangeClient = {
  id: 'binance',

  async fetchOrderbook(symbol: string): Promise<ExchangeData['orderbook']> {
    const nativeSymbol = toExchangeSymbol(symbol, 'binance');
    if (!nativeSymbol) {
      throw new BinanceApiError(`Unable to convert symbol: ${symbol}`);
    }

    return fetchBinanceOrderbook(nativeSymbol);
  },

  async fetchVolume(symbol: string): Promise<number> {
    const nativeSymbol = toExchangeSymbol(symbol, 'binance');
    if (!nativeSymbol) {
      throw new BinanceApiError(`Unable to convert symbol: ${symbol}`);
    }

    return fetchBinanceVolume(nativeSymbol);
  },

  async isSymbolSupported(symbol: string): Promise<boolean> {
    const nativeSymbol = toExchangeSymbol(symbol, 'binance');
    if (!nativeSymbol) {
      return false;
    }

    try {
      // Use the ticker endpoint as a lightweight check
      const url = `${BINANCE_API_BASE}/api/v3/ticker/24hr?symbol=${encodeURIComponent(nativeSymbol)}`;
      await fetchWithTimeout<BinanceTicker24hrResponse>(url);
      return true;
    } catch {
      return false;
    }
  },
};

export { BinanceApiError };
