/**
 * Zod validation schemas for API request/response validation.
 *
 * All API inputs are validated with these schemas to ensure
 * type safety at system boundaries per specs/api.md.
 */

import { z } from 'zod';

// =============================================================================
// Error Codes (from specs/errors.md)
// =============================================================================

/**
 * Internal error codes for logging/debugging.
 */
export const ErrorCode = {
  /** Input validation failed */
  VALIDATION: 'E_VALIDATION',
  /** Symbol not in catalog */
  SYMBOL_NOT_FOUND: 'E_SYMBOL_NOT_FOUND',
  /** Exchange API timeout */
  EXCHANGE_TIMEOUT: 'E_EXCHANGE_TIMEOUT',
  /** Exchange API error */
  EXCHANGE_ERROR: 'E_EXCHANGE_ERROR',
  /** Exchange rate limited */
  EXCHANGE_RATE_LIMIT: 'E_EXCHANGE_RATE_LIMIT',
  /** Client rate limited */
  RATE_LIMITED: 'E_RATE_LIMITED',
  /** Network request failed */
  NETWORK: 'E_NETWORK',
  /** Response parse error */
  PARSE: 'E_PARSE',
  /** Unexpected error */
  UNKNOWN: 'E_UNKNOWN',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// =============================================================================
// Common Schemas
// =============================================================================

/**
 * Valid exchange identifiers.
 */
export const ExchangeIdSchema = z.enum(['binance', 'coinbase', 'kraken']);

/**
 * Trade side - BUY or SELL.
 */
export const SideSchema = z.enum(['BUY', 'SELL']);

/**
 * Exchange status for API responses.
 */
export const ExchangeStatusSchema = z.enum([
  'ok',
  'error',
  'timeout',
  'unavailable',
]);

/**
 * Normalized symbol format: BASE-QUOTE (e.g., "BTC-USD").
 * Must be uppercase letters with exactly one hyphen separator.
 */
export const NormalizedSymbolSchema = z
  .string()
  .min(3, 'Symbol is required')
  .regex(
    /^[A-Z0-9]+-[A-Z0-9]+$/,
    'Symbol must be in format BASE-QUOTE (e.g., BTC-USD)'
  );

/**
 * Quantity must be a positive number (as string for precision).
 */
export const QuantitySchema = z
  .string()
  .min(1, 'Enter a quantity')
  .refine((val) => !isNaN(Number(val)), {
    message: 'Enter a valid number',
  })
  .refine((val) => Number(val) > 0, {
    message: 'Quantity must be greater than 0',
  })
  .refine((val) => Number(val) !== Infinity, {
    message: 'Enter a valid number',
  });

// =============================================================================
// Request Schemas
// =============================================================================

/**
 * GET /api/quote query parameters.
 */
export const QuoteRequestSchema = z.object({
  /** Normalized symbol (e.g., "BTC-USD") */
  symbol: NormalizedSymbolSchema,
  /** Trade side: BUY or SELL */
  side: SideSchema,
  /** Quantity in base asset (as string for precision) */
  quantity: QuantitySchema,
  /** Optional: comma-separated list of exchanges to query */
  exchanges: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      return val.split(',').map((e) => e.trim().toLowerCase());
    })
    .pipe(z.array(ExchangeIdSchema).optional()),
});

export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;

/**
 * GET /api/symbols query parameters.
 */
export const SymbolsRequestSchema = z.object({
  /** Filter by quote currency (e.g., "USD") */
  quote: z
    .string()
    .optional()
    .transform((val) => val?.toUpperCase()),
  /** Filter by exchange availability */
  exchange: ExchangeIdSchema.optional(),
  /** Search base or quote (case-insensitive) */
  search: z.string().optional(),
  /** Max results (default: 100) */
  limit: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 100;
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1) return 100;
      return Math.min(num, 500); // Cap at 500
    }),
});

export type SymbolsRequest = z.infer<typeof SymbolsRequestSchema>;

// =============================================================================
// Response Schemas
// =============================================================================

/**
 * Individual exchange quote in response.
 */
export const ExchangeQuoteSchema = z.object({
  exchange: ExchangeIdSchema,
  status: ExchangeStatusSchema,
  error: z.string().optional(),
  midPrice: z.string().optional(),
  bestBid: z.string().optional(),
  bestAsk: z.string().optional(),
  avgFillPrice: z.string().optional(),
  totalCost: z.string().optional(),
  priceImpact: z.string().optional(),
  volumePct: z.string().optional(),
  depthConsumed: z.number().int().nonnegative().optional(),
  fillable: z.boolean().optional(),
  shortfall: z.string().optional(),
  affiliateUrl: z.string().url().optional(),
});

export type ExchangeQuoteResponse = z.infer<typeof ExchangeQuoteSchema>;

/**
 * Full /api/quote response.
 */
export const QuoteResponseSchema = z.object({
  symbol: z.string(),
  side: SideSchema,
  quantity: z.string(),
  timestamp: z.number(),
  results: z.array(ExchangeQuoteSchema),
  best: ExchangeIdSchema.nullable(),
});

export type QuoteResponseType = z.infer<typeof QuoteResponseSchema>;

/**
 * Symbol info with exchange availability.
 */
export const SymbolInfoSchema = z.object({
  symbol: z.string(),
  base: z.string(),
  quote: z.string(),
  exchanges: z.record(ExchangeIdSchema, z.boolean()),
});

export type SymbolInfoType = z.infer<typeof SymbolInfoSchema>;

/**
 * /api/symbols response.
 */
export const SymbolsResponseSchema = z.object({
  symbols: z.array(SymbolInfoSchema),
  total: z.number().int().nonnegative(),
  cached: z.boolean(),
  timestamp: z.number(),
});

export type SymbolsResponseType = z.infer<typeof SymbolsResponseSchema>;

/**
 * Exchange health status.
 */
export const ExchangeHealthSchema = z.object({
  status: z.enum(['ok', 'degraded', 'offline']),
  latency: z.number().int().nonnegative(),
});

/**
 * /api/health response.
 */
export const HealthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded', 'offline']),
  exchanges: z.record(ExchangeIdSchema, ExchangeHealthSchema),
  timestamp: z.number(),
});

export type HealthResponseType = z.infer<typeof HealthResponseSchema>;

/**
 * API error response format.
 */
export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
});

export type ErrorResponseType = z.infer<typeof ErrorResponseSchema>;

// =============================================================================
// Validation Helpers
// =============================================================================

/**
 * Validates quote request parameters and returns parsed values or error.
 * Use this at API boundary for safe parsing.
 */
export function parseQuoteRequest(params: Record<string, string | undefined>) {
  return QuoteRequestSchema.safeParse(params);
}

/**
 * Validates symbols request parameters and returns parsed values or error.
 * Use this at API boundary for safe parsing.
 */
export function parseSymbolsRequest(
  params: Record<string, string | undefined>
) {
  return SymbolsRequestSchema.safeParse(params);
}

/**
 * Creates a standardized error response object.
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ErrorResponseType {
  return {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
}

/**
 * Formats Zod validation errors into a user-friendly message.
 */
export function formatValidationErrors(error: z.ZodError): string {
  const issues = error.issues.map((issue) => {
    const path = issue.path.join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
  return issues.join(', ');
}
