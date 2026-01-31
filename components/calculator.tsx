"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useQueryStates, parseAsString, parseAsStringLiteral } from "nuqs";
import { Copy, Check, Loader2 } from "lucide-react";
import { PairSelector } from "@/components/pair-selector";
import { DirectionToggle } from "@/components/direction-toggle";
import { QuantityInput } from "@/components/quantity-input";
import { ExchangeCard } from "@/components/exchange-card";
import { ResultsTable } from "@/components/results-table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Side } from "@/lib/calculations";
import type { QuoteResponse, SymbolInfo, ExchangeId } from "@/lib/exchanges/types";
import { cn } from "@/lib/utils";

/** URL state schema for nuqs */
const urlStateSchema = {
  s: parseAsString,
  side: parseAsStringLiteral(["buy", "sell"] as const).withDefault("buy"),
  qty: parseAsString,
};

export interface CalculatorProps {
  /** Initial symbols from server */
  initialSymbols: SymbolInfo[];
  /** Additional class name */
  className?: string;
}

/**
 * Main calculator component combining all UI elements.
 *
 * Features:
 * - Symbol selector with search and exchange badges
 * - Direction toggle (BUY/SELL)
 * - Quantity input with presets
 * - Results display (cards on mobile, table on desktop)
 * - URL state persistence with nuqs
 * - Copy Link functionality
 */
export function Calculator({ initialSymbols, className }: CalculatorProps) {
  // URL state
  const [urlParams, setUrlParams] = useQueryStates(urlStateSchema, {
    history: "replace",
    shallow: true,
  });

  // Local UI state
  const [symbol, setSymbol] = useState<string | null>(urlParams.s);
  const [side, setSide] = useState<Side>(
    urlParams.side === "sell" ? "SELL" : "BUY"
  );
  const [quantity, setQuantity] = useState(urlParams.qty ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [quoteResult, setQuoteResult] = useState<QuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Get base asset for quantity input label
  const baseAsset = useMemo(() => {
    if (!symbol) return undefined;
    const parts = symbol.split("-");
    return parts[0];
  }, [symbol]);

  // Get quote asset for formatting
  const quoteAsset = useMemo(() => {
    if (!symbol) return "USD";
    const parts = symbol.split("-");
    return parts[1] ?? "USD";
  }, [symbol]);

  // Track if initial sync has been done
  const initialSyncDone = useRef(false);

  // Sync URL params to state on initial load
  useEffect(() => {
    if (initialSyncDone.current) return;
    initialSyncDone.current = true;

    if (urlParams.s) {
      // Validate symbol exists in catalog
      const validSymbol = initialSymbols.find(
        (s) => s.symbol === urlParams.s
      );
      if (validSymbol) {
        setSymbol(urlParams.s);
      }
    }
    if (urlParams.qty) {
      // Validate quantity is positive number
      const num = parseFloat(urlParams.qty);
      if (!isNaN(num) && num > 0) {
        setQuantity(urlParams.qty);
      }
    }
  }, [urlParams.s, urlParams.qty, initialSymbols]);

  // Update URL when state changes
  useEffect(() => {
    const newParams: typeof urlParams = {
      s: symbol,
      side: side === "SELL" ? "sell" : "buy",
      qty: quantity || null,
    };
    void setUrlParams(newParams);
  }, [symbol, side, quantity, setUrlParams]);

  // Handle symbol change
  const handleSymbolChange = useCallback((newSymbol: string) => {
    setSymbol(newSymbol);
    setQuoteResult(null);
    setError(null);
  }, []);

  // Handle side change
  const handleSideChange = useCallback((newSide: Side) => {
    setSide(newSide);
    // Clear previous results when side changes
    setQuoteResult(null);
    setError(null);
  }, []);

  // Handle quantity change
  const handleQuantityChange = useCallback((newQuantity: string) => {
    setQuantity(newQuantity);
    // Don't clear results on quantity change to allow easy adjustments
  }, []);

  // Check if form is valid for comparison
  const canCompare = useMemo(() => {
    if (!symbol) return false;
    if (!quantity) return false;
    const num = parseFloat(quantity);
    return !isNaN(num) && num > 0;
  }, [symbol, quantity]);

  // Fetch quotes from API
  const handleCompare = useCallback(async () => {
    if (!canCompare || !symbol) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        symbol,
        side,
        quantity,
      });

      const response = await fetch(`/api/quote?${params.toString()}`);
      const data = (await response.json()) as QuoteResponse | { error: { message: string } };

      if (!response.ok) {
        const errorData = data as { error: { message: string } };
        throw new Error(errorData.error?.message ?? "Failed to fetch quotes");
      }

      setQuoteResult(data as QuoteResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setQuoteResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [canCompare, symbol, side, quantity]);

  // Track if auto-fetch has been done
  const autoFetchDone = useRef(false);

  // Auto-fetch on initial load if URL has valid params
  useEffect(() => {
    if (autoFetchDone.current) return;
    if (urlParams.s && urlParams.qty && canCompare && !quoteResult && !isLoading) {
      autoFetchDone.current = true;
      void handleCompare();
    }
  }, [urlParams.s, urlParams.qty, canCompare, quoteResult, isLoading, handleCompare]);

  // Handle Copy Link
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      setError("Failed to copy link");
    }
  }, []);

  // Handle trade click tracking
  const handleTradeClick = useCallback((exchange: ExchangeId) => {
    // Could add analytics tracking here
    console.log("Trade clicked:", exchange);
  }, []);

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      {/* Controls Section */}
      <div className="space-y-4 lg:space-y-0 lg:flex lg:items-end lg:gap-4">
        {/* Symbol Selector */}
        <div className="flex-1 lg:flex-[2]">
          <label
            htmlFor="symbol-selector"
            className="block text-sm font-medium text-muted-foreground mb-1.5"
          >
            Trading Pair
          </label>
          <PairSelector
            symbols={initialSymbols}
            value={symbol}
            onChange={handleSymbolChange}
            disabled={isLoading}
          />
        </div>

        {/* Direction Toggle */}
        <div className="lg:flex-shrink-0">
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Direction
          </label>
          <DirectionToggle
            value={side}
            onChange={handleSideChange}
            disabled={isLoading}
          />
        </div>

        {/* Quantity Input */}
        <div className="flex-1">
          <label
            htmlFor="quantity-input"
            className="block text-sm font-medium text-muted-foreground mb-1.5"
          >
            Quantity
          </label>
          <QuantityInput
            value={quantity}
            onChange={handleQuantityChange}
            baseAsset={baseAsset}
            disabled={isLoading}
            presets={[1, 10, 100, 1000]}
          />
        </div>

        {/* Compare Button */}
        <div className="lg:flex-shrink-0">
          <Button
            onClick={handleCompare}
            disabled={!canCompare || isLoading}
            className="w-full lg:w-auto"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Comparing...
              </>
            ) : (
              "Compare Prices"
            )}
          </Button>
        </div>
      </div>

      {/* Results Section */}
      <div className="mt-8">
        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCompare}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <>
            {/* Mobile: Skeleton Cards */}
            <div className="space-y-4 lg:hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-full mt-4" />
                </div>
              ))}
            </div>

            {/* Desktop: Skeleton Table */}
            <div className="hidden lg:block">
              <div className="rounded-lg border">
                <div className="p-4 space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Results */}
        {quoteResult && !isLoading && (
          <>
            {/* Copy Link Button */}
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="gap-2"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>

            {/* Mobile: Exchange Cards */}
            <div className="space-y-4 lg:hidden">
              {quoteResult.results.map((quote) => (
                <ExchangeCard
                  key={quote.exchange}
                  quote={quote}
                  isBest={quote.exchange === quoteResult.best}
                  side={side}
                  quoteAsset={quoteAsset}
                  onTradeClick={handleTradeClick}
                />
              ))}
            </div>

            {/* Desktop: Results Table */}
            <div className="hidden lg:block rounded-lg border overflow-hidden">
              <ResultsTable
                quotes={quoteResult.results}
                bestExchange={quoteResult.best}
                side={side}
                quoteAsset={quoteAsset}
                onTradeClick={handleTradeClick}
              />
            </div>
          </>
        )}

        {/* Empty State */}
        {!quoteResult && !isLoading && !error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Select a trading pair, enter a quantity, and click Compare Prices
              to see price impact across exchanges.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
