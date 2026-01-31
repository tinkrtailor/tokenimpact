/**
 * GET /api/health endpoint.
 *
 * Health check endpoint that pings each exchange and returns
 * connectivity status and latency per specs/api.md.
 *
 * Response format:
 * {
 *   "status": "ok" | "degraded" | "offline",
 *   "exchanges": {
 *     "binance": { "status": "ok", "latency": 45 },
 *     ...
 *   },
 *   "timestamp": 1234567890123
 * }
 *
 * Exchange status:
 * - ok: latency <= 500ms
 * - degraded: latency > 500ms
 * - offline: request failed or timed out
 */

import { NextResponse } from 'next/server';

import type { ExchangeHealth, ExchangeId, HealthResponse } from '@/lib/exchanges/types';

/** Latency threshold for degraded status (ms) */
const DEGRADED_THRESHOLD_MS = 500;

/** Timeout for health check pings (ms) */
const PING_TIMEOUT_MS = 5000;

/** Exchange ping endpoints - using lightweight endpoints for fast checks */
const exchangePingUrls: Record<ExchangeId, string> = {
  binance: 'https://api.binance.com/api/v3/ping',
  coinbase: 'https://api.exchange.coinbase.com/time',
  kraken: 'https://api.kraken.com/0/public/Time',
};

/**
 * Pings an exchange and measures latency.
 *
 * @param exchange - Exchange ID to ping
 * @returns Health status with latency
 */
async function pingExchange(exchange: ExchangeId): Promise<ExchangeHealth> {
  const url = exchangePingUrls[exchange];
  const startTime = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    const latency = Math.round(performance.now() - startTime);

    if (!response.ok) {
      return {
        status: 'offline',
        latency,
      };
    }

    // Determine status based on latency
    const status = latency > DEGRADED_THRESHOLD_MS ? 'degraded' : 'ok';

    return {
      status,
      latency,
    };
  } catch {
    // Request failed (timeout, network error, etc.)
    const latency = Math.round(performance.now() - startTime);

    return {
      status: 'offline',
      latency,
    };
  }
}

/**
 * Determines overall system status based on individual exchange statuses.
 *
 * - ok: All exchanges are ok
 * - degraded: At least one exchange is degraded or offline, but not all offline
 * - offline: All exchanges are offline
 */
function determineOverallStatus(
  exchanges: Record<ExchangeId, ExchangeHealth>
): 'ok' | 'degraded' | 'offline' {
  const statuses = Object.values(exchanges).map((e) => e.status);

  const offlineCount = statuses.filter((s) => s === 'offline').length;
  const degradedCount = statuses.filter((s) => s === 'degraded').length;

  // All offline
  if (offlineCount === statuses.length) {
    return 'offline';
  }

  // Any offline or degraded
  if (offlineCount > 0 || degradedCount > 0) {
    return 'degraded';
  }

  return 'ok';
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const exchangeIds: ExchangeId[] = ['binance', 'coinbase', 'kraken'];

  // Ping all exchanges in parallel
  const healthPromises = exchangeIds.map(async (exchange) => ({
    exchange,
    health: await pingExchange(exchange),
  }));

  const results = await Promise.all(healthPromises);

  // Build exchanges object
  const exchanges = results.reduce(
    (acc, { exchange, health }) => {
      acc[exchange] = health;
      return acc;
    },
    {} as Record<ExchangeId, ExchangeHealth>
  );

  const overallStatus = determineOverallStatus(exchanges);

  const response: HealthResponse = {
    status: overallStatus,
    exchanges,
    timestamp: Date.now(),
  };

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
