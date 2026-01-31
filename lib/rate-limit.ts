/**
 * Rate limiting utility for API endpoints.
 *
 * Implements IP-based rate limiting with sliding window algorithm
 * per specs/api.md rate limit requirements:
 * - /symbols: 60 req/min
 * - /quote: 30 req/min
 * - /health: 10 req/min
 *
 * Includes X-RateLimit-* headers in responses.
 */

/**
 * Rate limit configuration per endpoint.
 */
export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

/**
 * Entry tracking request timestamps for an IP.
 */
interface RateLimitEntry {
  /** Timestamps of requests within the window */
  timestamps: number[];
}

/**
 * Result of a rate limit check.
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Maximum requests per window */
  limit: number;
  /** Remaining requests in current window */
  remaining: number;
  /** Unix timestamp when the window resets (seconds) */
  reset: number;
}

/**
 * Rate limit configurations per endpoint path.
 */
export const rateLimitConfigs: Record<string, RateLimitConfig> = {
  '/api/symbols': { limit: 60, windowMs: 60_000 },
  '/api/quote': { limit: 30, windowMs: 60_000 },
  '/api/health': { limit: 10, windowMs: 60_000 },
};

/**
 * In-memory store for rate limit tracking.
 * Key format: "endpoint:ip"
 */
const store = new Map<string, RateLimitEntry>();

/**
 * Cleanup interval for removing expired entries.
 */
const CLEANUP_INTERVAL_MS = 60_000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Starts the cleanup timer if not already running.
 */
function ensureCleanupTimer(): void {
  if (cleanupTimer !== null) return;

  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      // Remove entries with no recent timestamps
      const freshTimestamps = entry.timestamps.filter(
        (ts) => now - ts < 120_000 // Keep 2 minutes of history
      );
      if (freshTimestamps.length === 0) {
        store.delete(key);
      } else {
        entry.timestamps = freshTimestamps;
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // Don't block process exit
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

/**
 * Generates a unique key for rate limiting.
 */
function getKey(endpoint: string, ip: string): string {
  return `${endpoint}:${ip}`;
}

/**
 * Checks rate limit for a given endpoint and IP.
 *
 * Uses a sliding window algorithm:
 * - Keeps timestamps of all requests within the window
 * - Counts requests that fall within the window
 * - Allows request if count < limit
 *
 * @param endpoint - API endpoint path (e.g., "/api/quote")
 * @param ip - Client IP address
 * @returns Rate limit result with allowed status and headers
 */
export function checkRateLimit(endpoint: string, ip: string): RateLimitResult {
  const config = rateLimitConfigs[endpoint];

  // If no config, allow request (no rate limiting)
  if (!config) {
    return {
      allowed: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    };
  }

  ensureCleanupTimer();

  const now = Date.now();
  const windowStart = now - config.windowMs;
  const key = getKey(endpoint, ip);

  // Get or create entry
  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Filter to only timestamps within the window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  // Calculate remaining
  const requestCount = entry.timestamps.length;
  const remaining = Math.max(0, config.limit - requestCount);

  // Calculate reset time (when oldest request in window expires)
  const oldestTimestamp = entry.timestamps[0] ?? now;
  const resetMs = oldestTimestamp + config.windowMs;
  const reset = Math.ceil(resetMs / 1000);

  // Check if allowed
  if (requestCount >= config.limit) {
    return {
      allowed: false,
      limit: config.limit,
      remaining: 0,
      reset,
    };
  }

  // Record this request
  entry.timestamps.push(now);

  return {
    allowed: true,
    limit: config.limit,
    remaining: remaining - 1, // Account for current request
    reset,
  };
}

/**
 * Creates rate limit headers for the response.
 */
export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  };
}

/**
 * Clears all rate limit entries (for testing).
 */
export function clearRateLimitStore(): void {
  store.clear();
}
