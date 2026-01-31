/**
 * Price impact calculation engine for Token Impact.
 *
 * Calculates the true cost of executing a trade across orderbook depth,
 * accounting for slippage beyond the quoted price.
 */

/** A single price level in an orderbook */
export interface OrderbookLevel {
  price: number;
  quantity: number;
}

/** Orderbook with bids and asks */
export interface Orderbook {
  bids: OrderbookLevel[];  // Sorted high to low (best bid first)
  asks: OrderbookLevel[];  // Sorted low to high (best ask first)
  timestamp: number;
}

/** Trade side */
export type Side = 'BUY' | 'SELL';

/** Input for price impact calculation */
export interface PriceImpactInput {
  side: Side;
  quantity: number;
  orderbook: Orderbook;
  volume24h?: number;  // Optional 24h volume for volumePct calculation
}

/** Result of price impact calculation */
export interface PriceImpactResult {
  avgFillPrice: number;
  totalCost: number;
  priceImpact: number;
  midPrice: number;
  bestBid: number;
  bestAsk: number;
  volumePct: number | null;
  depthConsumed: number;
  fillable: boolean;
  shortfall: number;
}

/**
 * Calculates price impact for a trade by walking the orderbook.
 *
 * - BUY orders walk the ask side (lowest to highest price)
 * - SELL orders walk the bid side (highest to lowest price)
 *
 * @param input - The trade parameters and orderbook data
 * @returns Price impact calculation result
 */
export function calculatePriceImpact(input: PriceImpactInput): PriceImpactResult {
  const { side, quantity, orderbook, volume24h } = input;

  // Handle zero quantity - return market data with zero impact
  if (quantity === 0) {
    const bestBid = orderbook.bids[0]?.price ?? 0;
    const bestAsk = orderbook.asks[0]?.price ?? 0;
    const midPrice = bestBid > 0 && bestAsk > 0 ? (bestBid + bestAsk) / 2 : 0;

    return {
      avgFillPrice: midPrice,
      totalCost: 0,
      priceImpact: 0,
      midPrice,
      bestBid,
      bestAsk,
      volumePct: 0,
      depthConsumed: 0,
      fillable: true,
      shortfall: 0,
    };
  }

  // Handle empty orderbook
  const relevantSide = side === 'BUY' ? orderbook.asks : orderbook.bids;
  if (relevantSide.length === 0) {
    const bestBid = orderbook.bids[0]?.price ?? 0;
    const bestAsk = orderbook.asks[0]?.price ?? 0;

    return {
      avgFillPrice: 0,
      totalCost: 0,
      priceImpact: 0,
      midPrice: 0,
      bestBid,
      bestAsk,
      volumePct: null,
      depthConsumed: 0,
      fillable: false,
      shortfall: quantity,
    };
  }

  const bestBid = orderbook.bids[0]?.price ?? 0;
  const bestAsk = orderbook.asks[0]?.price ?? 0;

  // Mid-price requires both bid and ask
  if (bestBid === 0 || bestAsk === 0) {
    return {
      avgFillPrice: 0,
      totalCost: 0,
      priceImpact: 0,
      midPrice: 0,
      bestBid,
      bestAsk,
      volumePct: null,
      depthConsumed: 0,
      fillable: false,
      shortfall: quantity,
    };
  }

  const midPrice = (bestBid + bestAsk) / 2;

  // Walk the orderbook
  let remainingQuantity = quantity;
  let totalCost = 0;
  let depthConsumed = 0;

  // BUY orders consume asks (sorted low to high)
  // SELL orders consume bids (sorted high to low)
  const levels = side === 'BUY' ? orderbook.asks : orderbook.bids;

  for (const level of levels) {
    if (remainingQuantity <= 0) break;

    depthConsumed++;
    const fillQuantity = Math.min(remainingQuantity, level.quantity);

    // For BUY: we pay price * quantity
    // For SELL: we receive price * quantity
    totalCost += level.price * fillQuantity;
    remainingQuantity -= fillQuantity;
  }

  const filledQuantity = quantity - remainingQuantity;
  const fillable = remainingQuantity === 0;
  const shortfall = remainingQuantity;

  // Calculate average fill price (weighted average)
  const avgFillPrice = filledQuantity > 0 ? totalCost / filledQuantity : 0;

  // Price impact formula: ((avgFillPrice - midPrice) / midPrice) * 100
  // For BUY: positive impact means paying more than mid
  // For SELL: we calculate impact as how much less we receive than mid
  let priceImpact = 0;
  if (midPrice > 0 && filledQuantity > 0) {
    if (side === 'BUY') {
      // BUY: positive impact = paying more than mid
      priceImpact = ((avgFillPrice - midPrice) / midPrice) * 100;
    } else {
      // SELL: negative impact = receiving less than mid
      // If avgFillPrice < midPrice, we receive less, so impact should be negative
      priceImpact = ((avgFillPrice - midPrice) / midPrice) * 100;
    }
  }

  // Calculate volume percentage
  const volumePct = volume24h != null && volume24h > 0
    ? (quantity / volume24h) * 100
    : null;

  return {
    avgFillPrice,
    totalCost,
    priceImpact,
    midPrice,
    bestBid,
    bestAsk,
    volumePct,
    depthConsumed,
    fillable,
    shortfall,
  };
}
