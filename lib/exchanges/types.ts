/**
 * Exchange type definitions for Token Impact.
 *
 * These types define the interfaces for exchange data, API responses,
 * and normalized quote formats used throughout the application.
 */

// Re-export core calculation types for convenience
export type { Orderbook, OrderbookLevel, Side } from '../calculations';

/**
 * Supported exchanges in Token Impact.
 */
export type ExchangeId = 'binance' | 'coinbase' | 'kraken';

/**
 * Exchange status indicating the result of an API call.
 */
export type ExchangeStatus = 'ok' | 'error' | 'timeout' | 'unavailable';

/**
 * Raw exchange data before calculation.
 * Contains the orderbook, volume, and metadata from an exchange API.
 */
export interface ExchangeData {
  /** Exchange identifier */
  exchange: ExchangeId;
  /** Normalized symbol (e.g., "BTC-USD") */
  symbol: string;
  /** Exchange-native symbol (e.g., "BTCUSDT" for Binance) */
  nativeSymbol: string;
  /** Raw orderbook data */
  orderbook: {
    bids: Array<[number, number]>; // [price, quantity]
    asks: Array<[number, number]>; // [price, quantity]
    timestamp: number;
  };
  /** 24-hour trading volume in base asset */
  volume24h: number;
  /** Request status */
  status: ExchangeStatus;
}

/**
 * Exchange quote with calculated price impact.
 * Returned from /api/quote endpoint per exchange.
 */
export interface ExchangeQuote {
  /** Exchange identifier */
  exchange: ExchangeId;
  /** Request status */
  status: ExchangeStatus;
  /** Error message if status is not "ok" */
  error?: string;
  /** Mid-point price between best bid and ask */
  midPrice?: string;
  /** Best bid price */
  bestBid?: string;
  /** Best ask price */
  bestAsk?: string;
  /** Weighted average fill price */
  avgFillPrice?: string;
  /** Total cost (buy) or proceeds (sell) in quote currency */
  totalCost?: string;
  /** Price impact as percentage (positive = worse than mid) */
  priceImpact?: string;
  /** Trade size as percentage of 24h volume */
  volumePct?: string;
  /** Number of orderbook levels consumed */
  depthConsumed?: number;
  /** Whether the full quantity can be filled */
  fillable?: boolean;
  /** Unfilled quantity if not fully fillable */
  shortfall?: string;
  /** Affiliate signup URL for the exchange */
  affiliateUrl?: string;
  /** Whether orderbook data is stale (>5s old) per specs/core.md */
  stale?: boolean;
}

/**
 * Normalized quote used internally before serialization.
 * Uses numbers for calculations, converted to strings for API response.
 */
export interface NormalizedQuote {
  /** Exchange identifier */
  exchange: ExchangeId;
  /** Request status */
  status: ExchangeStatus;
  /** Error message if status is not "ok" */
  error?: string;
  /** Mid-point price between best bid and ask */
  midPrice: number;
  /** Best bid price */
  bestBid: number;
  /** Best ask price */
  bestAsk: number;
  /** Weighted average fill price */
  avgFillPrice: number;
  /** Total cost (buy) or proceeds (sell) in quote currency */
  totalCost: number;
  /** Price impact as percentage (positive = worse than mid) */
  priceImpact: number;
  /** Trade size as percentage of 24h volume, null if volume unavailable */
  volumePct: number | null;
  /** Number of orderbook levels consumed */
  depthConsumed: number;
  /** Whether the full quantity can be filled */
  fillable: boolean;
  /** Unfilled quantity if not fully fillable */
  shortfall: number;
  /** Affiliate signup URL for the exchange */
  affiliateUrl: string;
}

/**
 * Full quote response from /api/quote endpoint.
 */
export interface QuoteResponse {
  /** Normalized symbol */
  symbol: string;
  /** Trade side */
  side: 'BUY' | 'SELL';
  /** Requested quantity in base asset */
  quantity: string;
  /** Response timestamp */
  timestamp: number;
  /** Quote results per exchange */
  results: ExchangeQuote[];
  /** Exchange with best price (lowest cost for buy, highest proceeds for sell) */
  best: ExchangeId | null;
}

/**
 * Symbol information with exchange availability.
 */
export interface SymbolInfo {
  /** Normalized symbol (e.g., "BTC-USD") */
  symbol: string;
  /** Base asset (e.g., "BTC") */
  base: string;
  /** Quote asset (e.g., "USD") */
  quote: string;
  /** Exchange availability map */
  exchanges: Record<ExchangeId, boolean>;
}

/**
 * Response from /api/symbols endpoint.
 */
export interface SymbolsResponse {
  /** Available trading symbols */
  symbols: SymbolInfo[];
  /** Total number of symbols (before limit) */
  total: number;
  /** Whether response was served from cache */
  cached: boolean;
  /** Response timestamp */
  timestamp: number;
}

/**
 * Exchange health status.
 */
export interface ExchangeHealth {
  /** Overall exchange status */
  status: 'ok' | 'degraded' | 'offline';
  /** Request latency in milliseconds */
  latency: number;
}

/**
 * Response from /api/health endpoint.
 */
export interface HealthResponse {
  /** Overall system status */
  status: 'ok' | 'degraded' | 'offline';
  /** Per-exchange health status */
  exchanges: Record<ExchangeId, ExchangeHealth>;
  /** Response timestamp */
  timestamp: number;
}

/**
 * API error response format.
 */
export interface ErrorResponse {
  error: {
    /** Error code (e.g., "INVALID_SYMBOL") */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Additional error details */
    details?: Record<string, unknown>;
  };
}

/**
 * Exchange client interface that all exchange implementations must follow.
 */
export interface ExchangeClient {
  /** Exchange identifier */
  id: ExchangeId;

  /**
   * Fetches the orderbook for a trading pair.
   * @param symbol - Normalized symbol (e.g., "BTC-USD")
   * @returns Orderbook with bids and asks
   */
  fetchOrderbook(symbol: string): Promise<ExchangeData['orderbook']>;

  /**
   * Fetches 24h trading volume for a pair.
   * @param symbol - Normalized symbol (e.g., "BTC-USD")
   * @returns Volume in base asset
   */
  fetchVolume(symbol: string): Promise<number>;

  /**
   * Checks if a symbol is supported on this exchange.
   * @param symbol - Normalized symbol (e.g., "BTC-USD")
   * @returns Whether the symbol is tradeable
   */
  isSymbolSupported(symbol: string): Promise<boolean>;
}
