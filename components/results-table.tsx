"use client";

import { forwardRef, useEffect, useMemo, useState } from "react";
import type { ExchangeQuote, ExchangeId } from "@/lib/exchanges/types";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";

/** Exchange display names */
const EXCHANGE_NAMES: Record<ExchangeId, string> = {
  binance: "Binance",
  coinbase: "Coinbase",
  kraken: "Kraken",
};

/** Sortable column keys */
type SortColumn = "exchange" | "midPrice" | "avgFillPrice" | "priceImpact" | "totalCost";

/** Sort direction */
type SortDirection = "asc" | "desc";

export interface ResultsTableProps {
  /** Array of exchange quotes to display */
  quotes: ExchangeQuote[];
  /** ID of the best exchange */
  bestExchange: ExchangeId | null;
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

  const decimals = num >= 1 ? 2 : num >= 0.01 ? 4 : 6;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Formats percentage with appropriate precision.
 */
function formatPercent(value: string | undefined): string {
  if (value === undefined) return "—";
  const num = parseFloat(value);
  if (Number.isNaN(num)) return "—";

  const absNum = Math.abs(num);
  const decimals = absNum >= 1 ? 2 : absNum >= 0.01 ? 3 : 4;
  return `${num.toFixed(decimals)}%`;
}

/**
 * Get numeric value from quote for sorting.
 */
function getSortValue(quote: ExchangeQuote, column: SortColumn): number | string {
  if (quote.status !== "ok") {
    // Push unavailable to bottom regardless of sort
    return Number.MAX_SAFE_INTEGER;
  }

  switch (column) {
    case "exchange":
      return EXCHANGE_NAMES[quote.exchange];
    case "midPrice":
      return parseFloat(quote.midPrice ?? "0");
    case "avgFillPrice":
      return parseFloat(quote.avgFillPrice ?? "0");
    case "priceImpact":
      return parseFloat(quote.priceImpact ?? "0");
    case "totalCost":
      return parseFloat(quote.totalCost ?? "0");
    default:
      return 0;
  }
}

/**
 * Results table component for desktop display.
 *
 * Displays exchange comparison in a sortable table with:
 * - Exchange name with BEST badge
 * - Mid price, average fill, impact, cost columns
 * - Sortable column headers
 * - Best row highlighted
 * - Unavailable exchanges at bottom with gray styling
 */
const ResultsTable = forwardRef<HTMLTableElement, ResultsTableProps>(
  ({ quotes, bestExchange, side, quoteAsset, onTradeClick, className }, ref) => {
    const [sortColumn, setSortColumn] = useState<SortColumn>("totalCost");
    // For BUY: ascending (lowest cost first). For SELL: descending (highest proceeds first)
    const [sortDirection, setSortDirection] = useState<SortDirection>(
      side === "SELL" ? "desc" : "asc"
    );

    // Reset sort direction when side changes (if still on default column)
    useEffect(() => {
      if (sortColumn === "totalCost") {
        setSortDirection(side === "SELL" ? "desc" : "asc");
      }
    }, [side, sortColumn]);

    const handleSort = (column: SortColumn) => {
      if (sortColumn === column) {
        // Toggle direction
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        // New column, default to ascending (except for cost which defaults to asc)
        setSortColumn(column);
        setSortDirection("asc");
      }
    };

    // Sort quotes with unavailable always at bottom
    const sortedQuotes = useMemo(() => {
      const available = quotes.filter((q) => q.status === "ok");
      const unavailable = quotes.filter((q) => q.status !== "ok");

      const sorted = [...available].sort((a, b) => {
        const aVal = getSortValue(a, sortColumn);
        const bVal = getSortValue(b, sortColumn);

        if (typeof aVal === "string" && typeof bVal === "string") {
          const cmp = aVal.localeCompare(bVal);
          return sortDirection === "asc" ? cmp : -cmp;
        }

        const numA = aVal as number;
        const numB = bVal as number;
        const diff = numA - numB;
        return sortDirection === "asc" ? diff : -diff;
      });

      return [...sorted, ...unavailable];
    }, [quotes, sortColumn, sortDirection]);

    const handleTradeClick = (quote: ExchangeQuote) => {
      if (quote.affiliateUrl) {
        onTradeClick?.(quote.exchange);
        window.open(quote.affiliateUrl, "_blank", "noopener,noreferrer");
      }
    };

    const getSortIcon = (column: SortColumn) => {
      if (sortColumn !== column) {
        return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground/50" />;
      }
      return sortDirection === "asc" ? (
        <ArrowUp className="ml-1 h-3.5 w-3.5" />
      ) : (
        <ArrowDown className="ml-1 h-3.5 w-3.5" />
      );
    };

    const costLabel = side === "BUY" ? "Cost" : "Proceeds";

    return (
      <Table ref={ref} className={className}>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[140px]">
              <button
                onClick={() => handleSort("exchange")}
                className="flex items-center hover:text-foreground transition-colors"
                aria-label={`Sort by exchange ${sortColumn === "exchange" ? (sortDirection === "asc" ? "descending" : "ascending") : ""}`}
              >
                Exchange
                {getSortIcon("exchange")}
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button
                onClick={() => handleSort("midPrice")}
                className="flex items-center justify-end w-full hover:text-foreground transition-colors"
                aria-label={`Sort by mid price ${sortColumn === "midPrice" ? (sortDirection === "asc" ? "descending" : "ascending") : ""}`}
              >
                Mid Price
                {getSortIcon("midPrice")}
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button
                onClick={() => handleSort("avgFillPrice")}
                className="flex items-center justify-end w-full hover:text-foreground transition-colors"
                aria-label={`Sort by average fill ${sortColumn === "avgFillPrice" ? (sortDirection === "asc" ? "descending" : "ascending") : ""}`}
              >
                Avg Fill
                {getSortIcon("avgFillPrice")}
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button
                onClick={() => handleSort("priceImpact")}
                className="flex items-center justify-end w-full hover:text-foreground transition-colors"
                aria-label={`Sort by impact ${sortColumn === "priceImpact" ? (sortDirection === "asc" ? "descending" : "ascending") : ""}`}
              >
                Impact
                {getSortIcon("priceImpact")}
              </button>
            </TableHead>
            <TableHead className="text-right">
              <button
                onClick={() => handleSort("totalCost")}
                className="flex items-center justify-end w-full hover:text-foreground transition-colors"
                aria-label={`Sort by ${costLabel.toLowerCase()} ${sortColumn === "totalCost" ? (sortDirection === "asc" ? "descending" : "ascending") : ""}`}
              >
                {costLabel}
                {getSortIcon("totalCost")}
              </button>
            </TableHead>
            <TableHead className="w-[100px] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedQuotes.map((quote) => {
            const isAvailable = quote.status === "ok";
            const isBest = quote.exchange === bestExchange && isAvailable;

            return (
              <TableRow
                key={quote.exchange}
                className={cn(
                  isBest && "bg-success/5 hover:bg-success/10",
                  !isAvailable && "opacity-50"
                )}
                data-state={isBest ? "selected" : undefined}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {isBest && (
                      <Badge
                        variant="secondary"
                        className="bg-success text-success-foreground font-semibold uppercase tracking-wide text-[10px] px-1.5 py-0"
                      >
                        Best
                      </Badge>
                    )}
                    {EXCHANGE_NAMES[quote.exchange]}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {isAvailable ? formatPrice(quote.midPrice) : "—"}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {isAvailable ? formatPrice(quote.avgFillPrice) : "—"}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-mono",
                    isAvailable &&
                      parseFloat(quote.priceImpact ?? "0") > 1 &&
                      "text-warning"
                  )}
                >
                  {isAvailable ? formatPercent(quote.priceImpact) : "—"}
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {isAvailable ? formatCurrency(quote.totalCost, quoteAsset) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {isAvailable && quote.affiliateUrl ? (
                    <Button
                      variant={isBest ? "default" : "ghost"}
                      size="sm"
                      className={cn(
                        "gap-1.5 h-7",
                        isBest &&
                          "bg-success hover:bg-success/90 text-success-foreground"
                      )}
                      onClick={() => handleTradeClick(quote)}
                    >
                      Trade
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {quote.status === "timeout"
                        ? "Timeout"
                        : quote.status === "unavailable"
                          ? "N/A"
                          : "Error"}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }
);

ResultsTable.displayName = "ResultsTable";

export { ResultsTable };
