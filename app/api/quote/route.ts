/**
 * GET /api/quote endpoint for Token Impact.
 *
 * Calculates price impact for a trade across exchanges.
 * Returns comparison data with the 'best' exchange identified.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  calculatePriceImpact,
  type Orderbook,
  type OrderbookLevel,
  type Side,
} from '@/lib/calculations';
import {
  fetchAllExchanges,
  fetchExchanges,
  getAffiliateUrl,
  type ExchangeFetchResult,
  type ExchangeId,
} from '@/lib/exchanges';
import {
  parseQuoteRequest,
  createErrorResponse,
  formatValidationErrors,
  ErrorCode,
} from '@/lib/validation';
import type { ExchangeQuote, QuoteResponse } from '@/lib/exchanges/types';

/**
 * Formats a number to a fixed decimal string.
 * Uses 2 decimal places for most values, more precision for very small numbers.
 */
function formatNumber(value: number, minDecimals = 2): string {
  if (value === 0) return '0.00';
  if (Math.abs(value) < 0.01) {
    return value.toPrecision(4);
  }
  return value.toFixed(minDecimals);
}

/** Threshold for stale data in milliseconds (5 seconds per specs/core.md) */
const STALE_THRESHOLD_MS = 5000;

/**
 * Converts raw orderbook data to the format expected by calculatePriceImpact.
 */
function convertOrderbook(raw: {
  bids: Array<[number, number]>;
  asks: Array<[number, number]>;
  timestamp: number;
}): Orderbook {
  const bids: OrderbookLevel[] = raw.bids.map(([price, quantity]) => ({
    price,
    quantity,
  }));
  const asks: OrderbookLevel[] = raw.asks.map(([price, quantity]) => ({
    price,
    quantity,
  }));

  return {
    bids,
    asks,
    timestamp: raw.timestamp,
  };
}

/**
 * Determines if orderbook data is stale (>5s old) per specs/core.md.
 * @param orderbookTimestamp - Timestamp of the orderbook data
 * @returns true if data is older than STALE_THRESHOLD_MS
 */
function isDataStale(orderbookTimestamp: number): boolean {
  const now = Date.now();
  return now - orderbookTimestamp > STALE_THRESHOLD_MS;
}

/**
 * Processes a successful exchange result into an ExchangeQuote.
 */
function processSuccessfulResult(
  result: ExchangeFetchResult & { success: true },
  side: Side,
  quantity: number
): ExchangeQuote {
  const { data } = result;
  const orderbook = convertOrderbook(data.orderbook);

  const impactResult = calculatePriceImpact({
    side,
    quantity,
    orderbook,
    volume24h: data.volume24h,
  });

  // Check if orderbook data is stale (>5s old) per specs/core.md
  const stale = isDataStale(data.orderbook.timestamp);

  return {
    exchange: data.exchange,
    status: 'ok',
    midPrice: formatNumber(impactResult.midPrice),
    bestBid: formatNumber(impactResult.bestBid),
    bestAsk: formatNumber(impactResult.bestAsk),
    avgFillPrice: formatNumber(impactResult.avgFillPrice),
    totalCost: formatNumber(impactResult.totalCost),
    priceImpact: formatNumber(impactResult.priceImpact, 3),
    volumePct:
      impactResult.volumePct !== null
        ? formatNumber(impactResult.volumePct, 2)
        : undefined,
    depthConsumed: impactResult.depthConsumed,
    fillable: impactResult.fillable,
    shortfall: impactResult.shortfall > 0 ? formatNumber(impactResult.shortfall) : undefined,
    affiliateUrl: getAffiliateUrl(data.exchange),
    stale,
  };
}

/**
 * Processes a failed exchange result into an ExchangeQuote.
 */
function processFailedResult(
  result: ExchangeFetchResult & { success: false }
): ExchangeQuote {
  return {
    exchange: result.exchange,
    status: result.status,
    error: result.error,
  };
}

/**
 * Determines the best exchange based on side.
 * For BUY: lowest totalCost is best
 * For SELL: highest totalCost (proceeds) is best
 */
function determineBestExchange(
  quotes: ExchangeQuote[],
  side: Side
): ExchangeId | null {
  const successfulQuotes = quotes.filter(
    (q) => q.status === 'ok' && q.fillable && q.totalCost !== undefined
  );

  if (successfulQuotes.length === 0) {
    return null;
  }

  if (side === 'BUY') {
    // For BUY: lowest cost is best
    const best = successfulQuotes.reduce((prev, curr) => {
      const prevCost = parseFloat(prev.totalCost ?? '0');
      const currCost = parseFloat(curr.totalCost ?? '0');
      return currCost < prevCost ? curr : prev;
    });
    return best.exchange;
  } else {
    // For SELL: highest proceeds is best
    const best = successfulQuotes.reduce((prev, curr) => {
      const prevProceeds = parseFloat(prev.totalCost ?? '0');
      const currProceeds = parseFloat(curr.totalCost ?? '0');
      return currProceeds > prevProceeds ? curr : prev;
    });
    return best.exchange;
  }
}

/**
 * GET /api/quote
 *
 * Query Parameters:
 * - symbol: Normalized symbol (e.g., "BTC-USD") - required
 * - side: "BUY" or "SELL" - required
 * - quantity: Base asset amount - required
 * - exchanges: Comma-separated list of exchanges (optional, default: all)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;

  // Extract query parameters
  const params = {
    symbol: searchParams.get('symbol') ?? undefined,
    side: searchParams.get('side') ?? undefined,
    quantity: searchParams.get('quantity') ?? undefined,
    exchanges: searchParams.get('exchanges') ?? undefined,
  };

  // Validate request parameters
  const validation = parseQuoteRequest(params);

  if (!validation.success) {
    const errorMessage = formatValidationErrors(validation.error);
    return NextResponse.json(
      createErrorResponse(ErrorCode.VALIDATION, errorMessage, {
        issues: validation.error.issues,
      }),
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const { symbol, side, quantity, exchanges } = validation.data;
  const numericQuantity = parseFloat(quantity);

  // Fetch exchange data
  const aggregatedData = exchanges
    ? await fetchExchanges(symbol, exchanges)
    : await fetchAllExchanges(symbol);

  // If all exchanges failed, return 500
  if (aggregatedData.successCount === 0 && aggregatedData.results.length > 0) {
    const errors = aggregatedData.results
      .filter((r): r is ExchangeFetchResult & { success: false } => !r.success)
      .map((r) => `${r.exchange}: ${r.error}`)
      .join('; ');

    return NextResponse.json(
      createErrorResponse(
        ErrorCode.EXCHANGE_ERROR,
        'All exchanges failed to respond',
        { errors }
      ),
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  // Process results into quotes
  const quotes: ExchangeQuote[] = aggregatedData.results.map((result) => {
    if (result.success) {
      return processSuccessfulResult(result, side, numericQuantity);
    } else {
      return processFailedResult(result);
    }
  });

  // Determine best exchange
  const best = determineBestExchange(quotes, side);

  // Build response
  const response: QuoteResponse = {
    symbol,
    side,
    quantity,
    timestamp: aggregatedData.timestamp,
    results: quotes,
    best,
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
    },
  });
}
