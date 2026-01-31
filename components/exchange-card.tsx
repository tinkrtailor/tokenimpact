"use client";

import { forwardRef } from "react";
import type { ExchangeQuote, ExchangeId } from "@/lib/exchanges/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

/** Exchange display names */
const EXCHANGE_NAMES: Record<ExchangeId, string> = {
  binance: "Binance",
  coinbase: "Coinbase",
  kraken: "Kraken",
};

export interface ExchangeCardProps {
  /** Exchange quote data */
  quote: ExchangeQuote;
  /** Whether this is the best exchange for this trade */
  isBest?: boolean;
  /** Trade side (BUY or SELL) for context */
  side: "BUY" | "SELL";
  /** Quote asset for formatting (e.g., "USD") */
  quoteAsset: string;
  /** Click handler for affiliate CTA */
  onTradeClick?: (exchange: ExchangeId) => void;
  /** Additional class names */
  className?: string;
}

/**
 * Formats a number as currency string.
 */
function formatCurrency(value: string | undefined, currency: string): string {
  if (value === undefined) return "—";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return "—";

  // Use locale formatting for thousands separators
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "USDT" ? "USD" : currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Formats a price with appropriate precision.
 */
function formatPrice(value: string | undefined): string {
  if (value === undefined) return "—";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return "—";

  // Use more decimals for small prices
  const decimals = num >= 1 ? 2 : num >= 0.01 ? 4 : 6;
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Formats percentage with sign and precision.
 */
function formatPercent(value: string | undefined): string {
  if (value === undefined) return "—";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return "—";

  // Show 2-4 decimals depending on magnitude
  const absNum = Math.abs(num);
  const decimals = absNum >= 1 ? 2 : absNum >= 0.01 ? 3 : 4;
  const formatted = num.toFixed(decimals);
  return `${formatted}%`;
}

/**
 * Exchange card component for mobile results display.
 *
 * Shows single exchange quote with:
 * - Price impact percentage
 * - Total cost
 * - "BEST" badge for optimal exchange
 * - Affiliate CTA button
 *
 * Unavailable exchanges are shown grayed out with status message.
 */
const ExchangeCard = forwardRef<HTMLDivElement, ExchangeCardProps>(
  ({ quote, isBest = false, side, quoteAsset, onTradeClick, className }, ref) => {
    const isAvailable = quote.status === "ok";
    const exchangeName = EXCHANGE_NAMES[quote.exchange];

    const handleTradeClick = () => {
      if (quote.affiliateUrl) {
        onTradeClick?.(quote.exchange);
        window.open(quote.affiliateUrl, "_blank", "noopener,noreferrer");
      }
    };

    // Determine the label based on side: cost for BUY, proceeds for SELL
    const costLabel = side === "BUY" ? "Total Cost" : "Proceeds";

    return (
      <Card
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          isBest && isAvailable && [
            "ring-2 ring-success/50",
            "shadow-[0_0_20px_-5px_hsl(var(--success)/0.3)]",
          ],
          !isAvailable && "opacity-60",
          className
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              {exchangeName}
            </CardTitle>
            {isBest && isAvailable && (
              <Badge
                variant="secondary"
                className="bg-success text-success-foreground font-semibold uppercase tracking-wide text-xs px-2 py-0.5"
              >
                Best
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-4">
          {isAvailable ? (
            <>
              {/* Price Impact */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Impact</span>
                <span className={cn(
                  "font-mono text-base font-medium",
                  parseFloat(quote.priceImpact ?? "0") > 1
                    ? "text-warning"
                    : "text-foreground"
                )}>
                  {formatPercent(quote.priceImpact)}
                </span>
              </div>

              {/* Total Cost/Proceeds */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{costLabel}</span>
                <span className="font-mono text-base font-medium text-foreground">
                  {formatCurrency(quote.totalCost, quoteAsset)}
                </span>
              </div>

              {/* Average Fill Price */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Fill</span>
                <span className="font-mono text-sm text-muted-foreground">
                  ${formatPrice(quote.avgFillPrice)}
                </span>
              </div>

              {/* Volume Percentage (if available) */}
              {quote.volumePct !== undefined && quote.volumePct !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">of 24h Vol</span>
                  <span className="font-mono text-sm text-muted-foreground">
                    {formatPercent(quote.volumePct)}
                  </span>
                </div>
              )}

              {/* Partial fill warning */}
              {quote.fillable === false && quote.shortfall && (
                <div className="mt-2 rounded bg-warning/10 border border-warning/20 px-3 py-2">
                  <p className="text-xs text-warning">
                    Insufficient liquidity. Shortfall: {quote.shortfall}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="py-2">
              <p className="text-sm text-muted-foreground">
                {quote.status === "timeout"
                  ? "Exchange timed out"
                  : quote.status === "unavailable"
                    ? "Symbol not available"
                    : quote.error ?? "Exchange unavailable"}
              </p>
            </div>
          )}
        </CardContent>

        {isAvailable && quote.affiliateUrl && (
          <CardFooter className="pt-0">
            <Button
              variant={isBest ? "default" : "secondary"}
              className={cn(
                "w-full gap-2",
                isBest && "bg-success hover:bg-success/90 text-success-foreground"
              )}
              onClick={handleTradeClick}
            >
              {isBest ? `Trade on ${exchangeName}` : `Open ${exchangeName}`}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }
);

ExchangeCard.displayName = "ExchangeCard";

export { ExchangeCard };
