/**
 * GET /api/symbols endpoint for Token Impact.
 *
 * Returns available trading pairs with exchange availability.
 * Supports filtering by quote currency, exchange, and search term.
 * Cached for 1 hour per specs/api.md.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  getSymbolCatalog,
  filterByQuote,
  filterByExchange,
  filterBySearch,
} from '@/lib/symbol-catalog';
import {
  parseSymbolsRequest,
  createErrorResponse,
  formatValidationErrors,
  ErrorCode,
} from '@/lib/validation';
import type { SymbolsResponse } from '@/lib/exchanges/types';

/** Cache duration in seconds (1 hour) */
const CACHE_MAX_AGE = 3600;

/**
 * In-memory cache for the symbols response.
 * Stores the full catalog and timestamp to avoid recomputing on every request.
 */
let cachedResponse: {
  catalog: ReturnType<typeof getSymbolCatalog>;
  timestamp: number;
} | null = null;

/**
 * Gets the symbol catalog, using cache if available and fresh.
 */
function getCachedCatalog(): { catalog: ReturnType<typeof getSymbolCatalog>; cached: boolean } {
  const now = Date.now();

  // Check if cache is valid (within CACHE_MAX_AGE)
  if (cachedResponse && now - cachedResponse.timestamp < CACHE_MAX_AGE * 1000) {
    return { catalog: cachedResponse.catalog, cached: true };
  }

  // Refresh cache
  const catalog = getSymbolCatalog();
  cachedResponse = { catalog, timestamp: now };
  return { catalog, cached: false };
}

/**
 * GET /api/symbols
 *
 * Query Parameters:
 * - quote: Filter by quote currency (e.g., "USD")
 * - exchange: Filter by exchange availability (e.g., "binance")
 * - search: Search base or quote (case-insensitive)
 * - limit: Max results (default: 100, max: 500)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;

  // Extract query parameters
  const params = {
    quote: searchParams.get('quote') ?? undefined,
    exchange: searchParams.get('exchange') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  };

  // Validate request parameters
  const validation = parseSymbolsRequest(params);

  if (!validation.success) {
    const errorMessage = formatValidationErrors(validation.error);
    return NextResponse.json(
      createErrorResponse(ErrorCode.VALIDATION, errorMessage, {
        issues: validation.error.issues,
      }),
      {
        status: 400,
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json',
        },
      }
    );
  }

  const { quote, exchange, search, limit } = validation.data;

  // Get catalog (from cache if available)
  const { catalog, cached } = getCachedCatalog();
  let filteredSymbols = catalog;

  // Apply filters
  if (quote) {
    filteredSymbols = filterByQuote(filteredSymbols, quote);
  }

  if (exchange) {
    filteredSymbols = filterByExchange(filteredSymbols, exchange);
  }

  if (search) {
    filteredSymbols = filterBySearch(filteredSymbols, search);
  }

  // Get total before applying limit
  const total = filteredSymbols.length;

  // Apply limit
  const limitedSymbols = filteredSymbols.slice(0, limit);

  // Build response
  const response: SymbolsResponse = {
    symbols: limitedSymbols,
    total,
    cached,
    timestamp: Date.now(),
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Cache-Control': `public, max-age=${CACHE_MAX_AGE}`,
      'Content-Type': 'application/json',
    },
  });
}
