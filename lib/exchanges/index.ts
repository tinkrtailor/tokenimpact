/**
 * Exchange aggregator for Token Impact.
 *
 * Orchestrates parallel fetching from all supported exchanges with
 * timeout handling and partial failure tolerance.
 */

import { toExchangeSymbol } from '../symbols';
import { binanceClient } from './binance';
import { coinbaseClient } from './coinbase';
import { krakenClient } from './kraken';
import type {
  ExchangeClient,
  ExchangeData,
  ExchangeId,
  ExchangeStatus,
} from './types';

/** Individual exchange request timeout (ms) */
const EXCHANGE_TIMEOUT_MS = 5000;

/** All supported exchange clients */
const exchangeClients: Record<ExchangeId, ExchangeClient> = {
  binance: binanceClient,
  coinbase: coinbaseClient,
  kraken: krakenClient,
};

/** Affiliate URLs for each exchange */
const affiliateUrls: Record<ExchangeId, string> = {
  binance: '/go/binance',
  coinbase: '/go/coinbase',
  kraken: '/go/kraken',
};

/**
 * Result from fetching exchange data.
 * Either success with data or failure with error info.
 */
export type ExchangeFetchResult =
  | {
      success: true;
      data: ExchangeData;
    }
  | {
      success: false;
      exchange: ExchangeId;
      status: ExchangeStatus;
      error: string;
    };

/**
 * Aggregated results from all exchanges.
 */
export interface AggregatedExchangeData {
  /** Symbol that was queried */
  symbol: string;
  /** Timestamp of the aggregation */
  timestamp: number;
  /** Results from each exchange */
  results: ExchangeFetchResult[];
  /** Number of exchanges that returned successfully */
  successCount: number;
  /** Number of exchanges that failed */
  failureCount: number;
}

/**
 * Wraps a promise with a timeout.
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param timeoutError - Error message for timeout
 * @returns The promise result or throws on timeout
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError: string
): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(timeoutError));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Fetches data from a single exchange with timeout handling.
 *
 * @param client - Exchange client to use
 * @param symbol - Normalized symbol (e.g., "BTC-USD")
 * @returns Fetch result with success/failure status
 */
async function fetchFromExchange(
  client: ExchangeClient,
  symbol: string
): Promise<ExchangeFetchResult> {
  const exchangeId = client.id;
  const nativeSymbol = toExchangeSymbol(symbol, exchangeId);

  // Check if symbol can be converted for this exchange
  if (!nativeSymbol) {
    return {
      success: false,
      exchange: exchangeId,
      status: 'unavailable',
      error: `Symbol ${symbol} not supported on ${exchangeId}`,
    };
  }

  try {
    // Fetch orderbook and volume in parallel
    const [orderbook, volume24h] = await withTimeout(
      Promise.all([client.fetchOrderbook(symbol), client.fetchVolume(symbol)]),
      EXCHANGE_TIMEOUT_MS,
      `Timeout fetching from ${exchangeId}`
    );

    const data: ExchangeData = {
      exchange: exchangeId,
      symbol,
      nativeSymbol,
      orderbook,
      volume24h,
      status: 'ok',
    };

    return {
      success: true,
      data,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // Determine status based on error type
    let status: ExchangeStatus = 'error';
    if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      status = 'timeout';
    }

    return {
      success: false,
      exchange: exchangeId,
      status,
      error: errorMessage,
    };
  }
}

/**
 * Fetches data from all exchanges in parallel.
 *
 * Uses Promise.allSettled to ensure all exchanges are queried even if some fail.
 * Returns partial results when some exchanges fail - does not fail the entire request.
 *
 * @param symbol - Normalized symbol (e.g., "BTC-USD")
 * @returns Aggregated results from all exchanges
 */
export async function fetchAllExchanges(
  symbol: string
): Promise<AggregatedExchangeData> {
  const clients = Object.values(exchangeClients);

  // Fetch from all exchanges in parallel
  const settledResults = await Promise.allSettled(
    clients.map((client) => fetchFromExchange(client, symbol))
  );

  // Process results
  const results: ExchangeFetchResult[] = settledResults.map(
    (settled, index) => {
      if (settled.status === 'fulfilled') {
        return settled.value;
      }

      // Handle rejected promises (shouldn't happen since fetchFromExchange catches errors)
      const client = clients[index];
      const exchangeId = client?.id ?? 'binance';
      return {
        success: false,
        exchange: exchangeId,
        status: 'error' as ExchangeStatus,
        error: settled.reason instanceof Error ? settled.reason.message : 'Unknown error',
      };
    }
  );

  // Count successes and failures
  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.length - successCount;

  return {
    symbol,
    timestamp: Date.now(),
    results,
    successCount,
    failureCount,
  };
}

/**
 * Fetches data from specific exchanges only.
 *
 * @param symbol - Normalized symbol (e.g., "BTC-USD")
 * @param exchanges - List of exchange IDs to query
 * @returns Aggregated results from specified exchanges
 */
export async function fetchExchanges(
  symbol: string,
  exchanges: ExchangeId[]
): Promise<AggregatedExchangeData> {
  const clients = exchanges
    .map((id) => exchangeClients[id])
    .filter((client): client is ExchangeClient => client !== undefined);

  if (clients.length === 0) {
    return {
      symbol,
      timestamp: Date.now(),
      results: [],
      successCount: 0,
      failureCount: 0,
    };
  }

  // Fetch from selected exchanges in parallel
  const settledResults = await Promise.allSettled(
    clients.map((client) => fetchFromExchange(client, symbol))
  );

  // Process results
  const results: ExchangeFetchResult[] = settledResults.map(
    (settled, index) => {
      if (settled.status === 'fulfilled') {
        return settled.value;
      }

      // Handle rejected promises
      const client = clients[index];
      const exchangeId = client?.id ?? 'binance';
      return {
        success: false,
        exchange: exchangeId,
        status: 'error' as ExchangeStatus,
        error: settled.reason instanceof Error ? settled.reason.message : 'Unknown error',
      };
    }
  );

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.length - successCount;

  return {
    symbol,
    timestamp: Date.now(),
    results,
    successCount,
    failureCount,
  };
}

/**
 * Gets the affiliate URL for an exchange.
 *
 * @param exchange - Exchange ID
 * @returns Affiliate redirect URL
 */
export function getAffiliateUrl(exchange: ExchangeId): string {
  return affiliateUrls[exchange];
}

/**
 * Gets all supported exchange IDs.
 *
 * @returns Array of exchange IDs
 */
export function getSupportedExchanges(): ExchangeId[] {
  return Object.keys(exchangeClients) as ExchangeId[];
}

/**
 * Gets an exchange client by ID.
 *
 * @param exchange - Exchange ID
 * @returns Exchange client or undefined
 */
export function getExchangeClient(
  exchange: ExchangeId
): ExchangeClient | undefined {
  return exchangeClients[exchange];
}

// Re-export types and clients for convenience
export { binanceClient } from './binance';
export { coinbaseClient } from './coinbase';
export { krakenClient } from './kraken';
export type {
  ExchangeClient,
  ExchangeData,
  ExchangeId,
  ExchangeQuote,
  ExchangeStatus,
  NormalizedQuote,
} from './types';
