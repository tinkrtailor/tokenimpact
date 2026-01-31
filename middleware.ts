/**
 * Next.js Middleware for rate limiting API endpoints.
 *
 * Applies IP-based rate limiting per specs/api.md:
 * - /api/symbols: 60 req/min
 * - /api/quote: 30 req/min
 * - /api/health: 10 req/min
 *
 * Returns 429 Too Many Requests when limit exceeded.
 * Includes X-RateLimit-* and X-Request-Id headers in all API responses.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  checkRateLimit,
  createRateLimitHeaders,
  rateLimitConfigs,
} from '@/lib/rate-limit';
import { createErrorResponse, ErrorCode } from '@/lib/validation';

/**
 * Generates a unique request ID for tracing.
 *
 * Uses crypto.randomUUID() which is available in modern runtimes.
 * Falls back to a timestamp-based ID if unavailable.
 */
function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Extracts the client IP address from the request.
 *
 * Checks headers in order of preference:
 * 1. x-forwarded-for (proxied requests)
 * 2. x-real-ip (nginx)
 * 3. Falls back to 'unknown'
 */
function getClientIp(request: NextRequest): string {
  // x-forwarded-for may contain multiple IPs; take the first one
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  // Vercel provides geo.ip but it's not in headers
  // Fall back to unknown for local development
  return 'unknown';
}

/**
 * Matches request pathname to rate limit config key.
 */
function getEndpointKey(pathname: string): string | null {
  // Exact matches for our endpoints
  if (pathname in rateLimitConfigs) {
    return pathname;
  }
  return null;
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Only apply to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Generate unique request ID for tracing
  const requestId = generateRequestId();

  // Check if this endpoint has rate limiting
  const endpointKey = getEndpointKey(pathname);
  if (!endpointKey) {
    // No rate limiting, but still add X-Request-Id
    const response = NextResponse.next();
    response.headers.set('X-Request-Id', requestId);
    return response;
  }

  // Get client IP
  const ip = getClientIp(request);

  // Check rate limit
  const result = checkRateLimit(endpointKey, ip);
  const rateLimitHeaders = createRateLimitHeaders(result);

  if (!result.allowed) {
    // Rate limited - return 429 with X-Request-Id
    const errorBody = createErrorResponse(
      ErrorCode.RATE_LIMITED,
      'Too many requests. Please try again later.',
      {
        retryAfter: result.reset - Math.floor(Date.now() / 1000),
      }
    );

    return NextResponse.json(errorBody, {
      status: 429,
      headers: {
        ...rateLimitHeaders,
        'X-Request-Id': requestId,
        'Retry-After': String(result.reset - Math.floor(Date.now() / 1000)),
        'Cache-Control': 'no-store',
      },
    });
  }

  // Allowed - continue with rate limit headers and X-Request-Id
  const response = NextResponse.next();

  // Add rate limit headers to response
  for (const [key, value] of Object.entries(rateLimitHeaders)) {
    response.headers.set(key, value);
  }

  // Add X-Request-Id header
  response.headers.set('X-Request-Id', requestId);

  return response;
}

/**
 * Matcher config - only run middleware on API routes.
 */
export const config = {
  matcher: ['/api/:path*'],
};
