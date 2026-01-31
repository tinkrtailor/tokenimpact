/**
 * Symbol catalog for Token Impact.
 *
 * Provides a curated list of trading pairs with exchange availability.
 * This static catalog is used for the /api/symbols endpoint.
 *
 * Per specs/symbols.md:
 * - Common pairs (BTC, ETH, SOL) are prioritized
 * - Stablecoin equivalents are NOT merged (USDT != USD != USDC)
 * - Each entry indicates per-exchange availability
 */

import type { ExchangeId, SymbolInfo } from './exchanges/types';

/**
 * Priority ranking for common base assets.
 * Lower number = higher priority (appears first in results).
 */
const BASE_PRIORITY: Record<string, number> = {
  BTC: 1,
  ETH: 2,
  SOL: 3,
  XRP: 4,
  DOGE: 5,
  ADA: 6,
  AVAX: 7,
  DOT: 8,
  LINK: 9,
  MATIC: 10,
  LTC: 11,
  SHIB: 12,
  UNI: 13,
  ATOM: 14,
  XLM: 15,
};

/**
 * Static symbol catalog with exchange availability.
 *
 * This catalog includes the most commonly traded pairs on major exchanges.
 * Exchange availability is based on typical support patterns:
 * - Binance: Primarily USDT pairs, some USDC and BTC pairs
 * - Coinbase: USD pairs, some USDT and USDC pairs
 * - Kraken: USD pairs, EUR pairs, some USDT pairs
 */
const SYMBOL_CATALOG: SymbolInfo[] = [
  // Major USD pairs (Coinbase + Kraken)
  { symbol: 'BTC-USD', base: 'BTC', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },
  { symbol: 'ETH-USD', base: 'ETH', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },
  { symbol: 'SOL-USD', base: 'SOL', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },
  { symbol: 'XRP-USD', base: 'XRP', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },
  { symbol: 'DOGE-USD', base: 'DOGE', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },
  { symbol: 'ADA-USD', base: 'ADA', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },
  { symbol: 'AVAX-USD', base: 'AVAX', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },
  { symbol: 'DOT-USD', base: 'DOT', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },
  { symbol: 'LINK-USD', base: 'LINK', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },
  { symbol: 'MATIC-USD', base: 'MATIC', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },
  { symbol: 'LTC-USD', base: 'LTC', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },
  { symbol: 'SHIB-USD', base: 'SHIB', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },
  { symbol: 'UNI-USD', base: 'UNI', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },
  { symbol: 'ATOM-USD', base: 'ATOM', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },
  { symbol: 'XLM-USD', base: 'XLM', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },
  { symbol: 'AAVE-USD', base: 'AAVE', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },
  { symbol: 'ALGO-USD', base: 'ALGO', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },
  { symbol: 'APE-USD', base: 'APE', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },
  { symbol: 'ARB-USD', base: 'ARB', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },
  { symbol: 'OP-USD', base: 'OP', quote: 'USD', exchanges: { binance: false, coinbase: true, kraken: true } },

  // Major USDT pairs (Binance)
  { symbol: 'BTC-USDT', base: 'BTC', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'ETH-USDT', base: 'ETH', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'SOL-USDT', base: 'SOL', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'XRP-USDT', base: 'XRP', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'DOGE-USDT', base: 'DOGE', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'ADA-USDT', base: 'ADA', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'AVAX-USDT', base: 'AVAX', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'DOT-USDT', base: 'DOT', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'LINK-USDT', base: 'LINK', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'MATIC-USDT', base: 'MATIC', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'LTC-USDT', base: 'LTC', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'SHIB-USDT', base: 'SHIB', quote: 'USDT', exchanges: { binance: true, coinbase: false, kraken: true } },
  { symbol: 'UNI-USDT', base: 'UNI', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'ATOM-USDT', base: 'ATOM', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'XLM-USDT', base: 'XLM', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'AAVE-USDT', base: 'AAVE', quote: 'USDT', exchanges: { binance: true, coinbase: false, kraken: true } },
  { symbol: 'ALGO-USDT', base: 'ALGO', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'APE-USDT', base: 'APE', quote: 'USDT', exchanges: { binance: true, coinbase: false, kraken: true } },
  { symbol: 'ARB-USDT', base: 'ARB', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'OP-USDT', base: 'OP', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'NEAR-USDT', base: 'NEAR', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'FTM-USDT', base: 'FTM', quote: 'USDT', exchanges: { binance: true, coinbase: false, kraken: true } },
  { symbol: 'SAND-USDT', base: 'SAND', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'MANA-USDT', base: 'MANA', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'CRV-USDT', base: 'CRV', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'PEPE-USDT', base: 'PEPE', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'WIF-USDT', base: 'WIF', quote: 'USDT', exchanges: { binance: true, coinbase: true, kraken: true } },

  // USDC pairs
  { symbol: 'BTC-USDC', base: 'BTC', quote: 'USDC', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'ETH-USDC', base: 'ETH', quote: 'USDC', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'SOL-USDC', base: 'SOL', quote: 'USDC', exchanges: { binance: true, coinbase: true, kraken: true } },

  // EUR pairs (Kraken specialty)
  { symbol: 'BTC-EUR', base: 'BTC', quote: 'EUR', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'ETH-EUR', base: 'ETH', quote: 'EUR', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'SOL-EUR', base: 'SOL', quote: 'EUR', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'XRP-EUR', base: 'XRP', quote: 'EUR', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'DOGE-EUR', base: 'DOGE', quote: 'EUR', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'ADA-EUR', base: 'ADA', quote: 'EUR', exchanges: { binance: true, coinbase: true, kraken: true } },

  // GBP pairs
  { symbol: 'BTC-GBP', base: 'BTC', quote: 'GBP', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'ETH-GBP', base: 'ETH', quote: 'GBP', exchanges: { binance: true, coinbase: true, kraken: true } },

  // BTC pairs (altcoin/BTC trading)
  { symbol: 'ETH-BTC', base: 'ETH', quote: 'BTC', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'SOL-BTC', base: 'SOL', quote: 'BTC', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'XRP-BTC', base: 'XRP', quote: 'BTC', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'DOGE-BTC', base: 'DOGE', quote: 'BTC', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'LINK-BTC', base: 'LINK', quote: 'BTC', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'LTC-BTC', base: 'LTC', quote: 'BTC', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'ADA-BTC', base: 'ADA', quote: 'BTC', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'DOT-BTC', base: 'DOT', quote: 'BTC', exchanges: { binance: true, coinbase: true, kraken: true } },

  // ETH pairs
  { symbol: 'LINK-ETH', base: 'LINK', quote: 'ETH', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'UNI-ETH', base: 'UNI', quote: 'ETH', exchanges: { binance: true, coinbase: true, kraken: true } },
  { symbol: 'AAVE-ETH', base: 'AAVE', quote: 'ETH', exchanges: { binance: true, coinbase: true, kraken: true } },
];

/**
 * Gets the priority score for a symbol based on base asset.
 * Lower score = higher priority (BTC pairs first, then ETH, etc.)
 */
function getSymbolPriority(symbol: SymbolInfo): number {
  const basePriority = BASE_PRIORITY[symbol.base] ?? 100;
  // Boost USD pairs slightly over USDT
  const quoteBoost = symbol.quote === 'USD' ? 0 : symbol.quote === 'USDT' ? 0.1 : 0.2;
  return basePriority + quoteBoost;
}

/**
 * Gets the full symbol catalog, sorted by priority.
 */
export function getSymbolCatalog(): SymbolInfo[] {
  return [...SYMBOL_CATALOG].sort((a, b) => getSymbolPriority(a) - getSymbolPriority(b));
}

/**
 * Filters symbols by quote currency.
 */
export function filterByQuote(symbols: SymbolInfo[], quote: string): SymbolInfo[] {
  const upperQuote = quote.toUpperCase();
  return symbols.filter((s) => s.quote === upperQuote);
}

/**
 * Filters symbols by exchange availability.
 */
export function filterByExchange(symbols: SymbolInfo[], exchange: ExchangeId): SymbolInfo[] {
  return symbols.filter((s) => s.exchanges[exchange]);
}

/**
 * Filters symbols by search term (matches base or quote).
 */
export function filterBySearch(symbols: SymbolInfo[], search: string): SymbolInfo[] {
  const upperSearch = search.toUpperCase();
  return symbols.filter(
    (s) =>
      s.base.includes(upperSearch) ||
      s.quote.includes(upperSearch) ||
      s.symbol.includes(upperSearch)
  );
}

/**
 * Checks if a symbol exists in the catalog.
 */
export function isSymbolInCatalog(symbol: string): boolean {
  const upperSymbol = symbol.toUpperCase();
  return SYMBOL_CATALOG.some((s) => s.symbol === upperSymbol);
}

/**
 * Gets a symbol from the catalog by normalized symbol string.
 */
export function getSymbolFromCatalog(symbol: string): SymbolInfo | undefined {
  const upperSymbol = symbol.toUpperCase();
  return SYMBOL_CATALOG.find((s) => s.symbol === upperSymbol);
}
