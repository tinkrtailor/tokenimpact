/**
 * Symbol normalization for Token Impact.
 *
 * Provides bidirectional mapping between exchange-native symbols
 * and our normalized format ({BASE}-{QUOTE}).
 *
 * @example
 * normalizeSymbol('BTCUSDT', 'binance') // => 'BTC-USDT'
 * toExchangeSymbol('BTC-USD', 'kraken') // => 'XBTUSDT' or similar
 */

import type { ExchangeId } from './exchanges/types';

/**
 * Kraken uses XBT instead of BTC for Bitcoin.
 * This maps Kraken's asset codes to standard symbols.
 */
const KRAKEN_ASSET_MAP: Record<string, string> = {
  XBT: 'BTC',
  XXBT: 'BTC',
};

/**
 * Reverse map for converting standard symbols to Kraken's format.
 */
const KRAKEN_REVERSE_ASSET_MAP: Record<string, string> = {
  BTC: 'XBT',
};

/**
 * Common quote currencies used to split Binance symbols.
 * Ordered by specificity (longer strings first) to handle cases like USDTUSD.
 */
const BINANCE_QUOTE_CURRENCIES = [
  'USDT',
  'USDC',
  'BUSD',
  'TUSD',
  'FDUSD',
  'USD',
  'EUR',
  'GBP',
  'BTC',
  'ETH',
  'BNB',
  'DAI',
];

/**
 * Quote currencies for Kraken symbol parsing.
 * Includes both standard and Kraken-prefixed versions.
 */
const KRAKEN_QUOTE_CURRENCIES = [
  'ZUSD',
  'ZEUR',
  'ZGBP',
  'USDT',
  'USDC',
  'USD',
  'EUR',
  'GBP',
  'BTC',
  'XBT',
  'ETH',
  'DAI',
];

/**
 * Kraken quote currency normalization (removes Z prefix).
 */
const KRAKEN_QUOTE_MAP: Record<string, string> = {
  ZUSD: 'USD',
  ZEUR: 'EUR',
  ZGBP: 'GBP',
  ZCAD: 'CAD',
  ZJPY: 'JPY',
  ZAUD: 'AUD',
  XBT: 'BTC',
};

/**
 * Converts an exchange-native symbol to our normalized format.
 *
 * @param nativeSymbol - The exchange's native symbol format
 * @param exchange - The exchange the symbol is from
 * @returns Normalized symbol in BASE-QUOTE format, or null if unable to normalize
 *
 * @example
 * normalizeSymbol('BTCUSDT', 'binance') // => 'BTC-USDT'
 * normalizeSymbol('BTC-USD', 'coinbase') // => 'BTC-USD'
 * normalizeSymbol('XXBTZUSD', 'kraken') // => 'BTC-USD'
 */
export function normalizeSymbol(
  nativeSymbol: string,
  exchange: ExchangeId
): string | null {
  if (!nativeSymbol || typeof nativeSymbol !== 'string') {
    return null;
  }

  switch (exchange) {
    case 'binance':
      return normalizeBinanceSymbol(nativeSymbol);
    case 'coinbase':
      return normalizeCoinbaseSymbol(nativeSymbol);
    case 'kraken':
      return normalizeKrakenSymbol(nativeSymbol);
    default: {
      // Exhaustive check
      const _exhaustive: never = exchange;
      return _exhaustive;
    }
  }
}

/**
 * Converts a normalized symbol to an exchange's native format.
 *
 * @param normalizedSymbol - Symbol in BASE-QUOTE format
 * @param exchange - The target exchange
 * @returns Exchange-native symbol, or null if unable to convert
 *
 * @example
 * toExchangeSymbol('BTC-USDT', 'binance') // => 'BTCUSDT'
 * toExchangeSymbol('BTC-USD', 'coinbase') // => 'BTC-USD'
 * toExchangeSymbol('BTC-USD', 'kraken') // => 'XBTUSD'
 */
export function toExchangeSymbol(
  normalizedSymbol: string,
  exchange: ExchangeId
): string | null {
  if (!normalizedSymbol || typeof normalizedSymbol !== 'string') {
    return null;
  }

  const parts = normalizedSymbol.split('-');
  if (parts.length !== 2) {
    return null;
  }

  const [base, quote] = parts;
  if (!base || !quote) {
    return null;
  }

  switch (exchange) {
    case 'binance':
      return toBinanceSymbol(base, quote);
    case 'coinbase':
      return toCoinbaseSymbol(base, quote);
    case 'kraken':
      return toKrakenSymbol(base, quote);
    default: {
      // Exhaustive check
      const _exhaustive: never = exchange;
      return _exhaustive;
    }
  }
}

/**
 * Parses a normalized symbol into its base and quote components.
 *
 * @param normalizedSymbol - Symbol in BASE-QUOTE format
 * @returns Object with base and quote, or null if invalid
 */
export function parseNormalizedSymbol(
  normalizedSymbol: string
): { base: string; quote: string } | null {
  if (!normalizedSymbol || typeof normalizedSymbol !== 'string') {
    return null;
  }

  const parts = normalizedSymbol.split('-');
  if (parts.length !== 2) {
    return null;
  }

  const [base, quote] = parts;
  if (!base || !quote) {
    return null;
  }

  return { base, quote };
}

/**
 * Validates that a string is a valid normalized symbol format.
 *
 * @param symbol - The symbol to validate
 * @returns True if the symbol is in valid BASE-QUOTE format
 */
export function isValidNormalizedSymbol(symbol: string): boolean {
  if (!symbol || typeof symbol !== 'string') {
    return false;
  }

  const parts = symbol.split('-');
  if (parts.length !== 2) {
    return false;
  }

  const [base, quote] = parts;
  if (!base || !quote) {
    return false;
  }

  // Both parts should be uppercase alphanumeric
  const validPattern = /^[A-Z0-9]+$/;
  return validPattern.test(base) && validPattern.test(quote);
}

// ============================================================================
// Binance
// ============================================================================

function normalizeBinanceSymbol(symbol: string): string | null {
  const upperSymbol = symbol.toUpperCase();

  // Try to find a quote currency match
  for (const quote of BINANCE_QUOTE_CURRENCIES) {
    if (upperSymbol.endsWith(quote)) {
      const base = upperSymbol.slice(0, -quote.length);
      if (base.length > 0) {
        return `${base}-${quote}`;
      }
    }
  }

  return null;
}

function toBinanceSymbol(base: string, quote: string): string {
  // Binance uses concatenated format: BTCUSDT
  return `${base.toUpperCase()}${quote.toUpperCase()}`;
}

// ============================================================================
// Coinbase
// ============================================================================

function normalizeCoinbaseSymbol(symbol: string): string | null {
  // Coinbase already uses BASE-QUOTE format
  const upperSymbol = symbol.toUpperCase();
  const parts = upperSymbol.split('-');

  if (parts.length !== 2) {
    return null;
  }

  const [base, quote] = parts;
  if (!base || !quote) {
    return null;
  }

  return `${base}-${quote}`;
}

function toCoinbaseSymbol(base: string, quote: string): string {
  // Coinbase uses dash-separated format: BTC-USD
  return `${base.toUpperCase()}-${quote.toUpperCase()}`;
}

// ============================================================================
// Kraken
// ============================================================================

/**
 * Normalizes Kraken's complex symbol format.
 *
 * Kraken uses several conventions:
 * - X prefix for crypto (XXBT = BTC)
 * - Z prefix for fiat (ZUSD = USD)
 * - XBT instead of BTC
 *
 * Examples:
 * - XXBTZUSD => BTC-USD
 * - XETHZUSD => ETH-USD
 * - BTCUSD => BTC-USD (newer format)
 * - XBTUSDT => BTC-USDT
 */
function normalizeKrakenSymbol(symbol: string): string | null {
  const upperSymbol = symbol.toUpperCase();

  // Try different quote currency patterns
  for (const quote of KRAKEN_QUOTE_CURRENCIES) {
    if (upperSymbol.endsWith(quote)) {
      let base = upperSymbol.slice(0, -quote.length);

      // Normalize the quote currency
      const normalizedQuote = KRAKEN_QUOTE_MAP[quote] ?? quote;

      // Handle XBT -> BTC conversion BEFORE stripping X prefix
      // This handles cases like XBTUSD where XBT should become BTC
      const mappedBase = KRAKEN_ASSET_MAP[base];
      if (mappedBase !== undefined) {
        base = mappedBase;
      } else {
        // Handle X prefix for base assets (XXBT, XETH, etc.)
        if (base.startsWith('X') && base.length > 1) {
          base = base.slice(1);
        }
        // Handle XBT -> BTC conversion after stripping X prefix
        // This handles cases like XXBTZUSD where XXBT -> XBT -> BTC
        base = KRAKEN_ASSET_MAP[base] ?? base;
      }

      if (base.length > 0) {
        return `${base}-${normalizedQuote}`;
      }
    }
  }

  // Fallback: try to parse as concatenated symbols for newer Kraken format
  // Some pairs like BTCUSD don't have prefixes
  for (const quote of ['USDT', 'USDC', 'USD', 'EUR', 'GBP']) {
    if (upperSymbol.endsWith(quote)) {
      let base = upperSymbol.slice(0, -quote.length);

      // Handle XBT -> BTC conversion
      base = KRAKEN_ASSET_MAP[base] ?? base;

      if (base.length > 0) {
        return `${base}-${quote}`;
      }
    }
  }

  return null;
}

function toKrakenSymbol(base: string, quote: string): string {
  // Convert BTC to XBT for Kraken
  const krakenBase = KRAKEN_REVERSE_ASSET_MAP[base.toUpperCase()] ?? base.toUpperCase();
  const krakenQuote = quote.toUpperCase();

  // Kraken uses concatenated format for most pairs: XBTUSD
  // Note: For some pairs, Kraken may use different formats (XXBTZUSD),
  // but the simpler format works for API requests
  return `${krakenBase}${krakenQuote}`;
}
