"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useQueryStates, parseAsString, parseAsStringLiteral } from "nuqs";
import { Copy, Check, Loader2, AlertTriangle } from "lucide-react";
import { PairSelector } from "@/components/pair-selector";
import { DirectionToggle } from "@/components/direction-toggle";
import { QuantityInput } from "@/components/quantity-input";
import { ExchangeCard } from "@/components/exchange-card";
import { ResultsTable } from "@/components/results-table";
import { ExchangeCardSkeleton } from "@/components/exchange-card-skeleton";
import { ResultsTableSkeleton } from "@/components/results-table-skeleton";
import { EmptyState } from "@/components/empty-state";
import { AdSlot } from "@/components/ad-slot";
import { Button } from "@/components/ui/button";
import type { Side } from "@/lib/calculations";
import type { QuoteResponse, SymbolInfo, ExchangeId } from "@/lib/exchanges/types";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { trackEvent, reportError } from "@/lib/analytics";

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
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Validation error states
  const [symbolError, setSymbolError] = useState<string | null>(null);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Refs for focusing on errors
  const pairSelectorRef = useRef<HTMLButtonElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);

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

  // Calculate savings for best exchange vs worst
  const savingsAmount = useMemo(() => {
    if (!quoteResult || !quoteResult.best) return 0;
    const okResults = quoteResult.results.filter((r) => r.status === "ok" && r.totalCost);
    if (okResults.length < 2) return 0;

    const costs = okResults.map((r) => parseFloat(r.totalCost ?? "0"));
    const bestCost = Math.min(...costs);
    const worstCost = Math.max(...costs);

    // For buys, savings = worst - best; for sells, savings = best - worst
    return side === "BUY" ? worstCost - bestCost : bestCost - worstCost;
  }, [quoteResult, side]);

  // Sync URL params to state on initial load or external URL changes (back/forward navigation)
  // Note: We intentionally exclude symbol, quantity, side from deps to prevent circular updates.
  // This effect only runs when URL params change, not when local state changes.
  useEffect(() => {
    if (urlParams.s) {
      // Validate symbol exists in catalog
      const validSymbol = initialSymbols.find(
        (s) => s.symbol === urlParams.s
      );
      if (validSymbol) {
        setSymbol((current) => current !== urlParams.s ? urlParams.s : current);
      }
    }
    if (urlParams.qty) {
      // Validate quantity is positive number
      const num = parseFloat(urlParams.qty);
      if (!isNaN(num) && num > 0) {
        setQuantity((current) => current !== urlParams.qty ? urlParams.qty! : current);
      }
    }
    if (urlParams.side) {
      const newSide = urlParams.side === "sell" ? "SELL" : "BUY";
      setSide((current) => current !== newSide ? newSide : current);
    }
  }, [urlParams.s, urlParams.qty, urlParams.side, initialSymbols]);

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
    // Clear symbol error when user selects a symbol
    if (newSymbol) {
      setSymbolError(null);
    }
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
    // Clear quantity error if new value is valid
    if (hasAttemptedSubmit) {
      const num = parseFloat(newQuantity);
      if (!isNaN(num) && num > 0) {
        setQuantityError(null);
      }
    }
  }, [hasAttemptedSubmit]);

  /**
   * Validates the quantity input and returns an error message or null.
   * Error messages per specs/errors.md:
   * - Empty quantity: "Enter a quantity"
   * - Invalid quantity: "Enter a valid number"
   * - Zero quantity: "Quantity must be greater than 0"
   * - Negative quantity: "Quantity must be positive"
   */
  const validateQuantity = useCallback((qty: string): string | null => {
    if (!qty || qty.trim() === "") {
      return "Enter a quantity";
    }
    const num = parseFloat(qty);
    if (isNaN(num)) {
      return "Enter a valid number";
    }
    if (num < 0) {
      return "Quantity must be positive";
    }
    if (num === 0) {
      return "Quantity must be greater than 0";
    }
    return null;
  }, []);

  /**
   * Validates the symbol selection and returns an error message or null.
   * Error messages per specs/errors.md:
   * - Empty symbol: "Select a trading pair"
   */
  const validateSymbol = useCallback((sym: string | null): string | null => {
    if (!sym) {
      return "Select a trading pair";
    }
    return null;
  }, []);

  // Validate inputs when they change (only after first submit attempt)
  useEffect(() => {
    if (!hasAttemptedSubmit) return;
    setSymbolError(validateSymbol(symbol));
  }, [symbol, hasAttemptedSubmit, validateSymbol]);

  useEffect(() => {
    if (!hasAttemptedSubmit) return;
    setQuantityError(validateQuantity(quantity));
  }, [quantity, hasAttemptedSubmit, validateQuantity]);

  // Check if form is valid for comparison
  const canCompare = useMemo(() => {
    if (!symbol) return false;
    if (!quantity) return false;
    const num = parseFloat(quantity);
    return !isNaN(num) && num > 0;
  }, [symbol, quantity]);

  // Fetch quotes from API
  const handleCompare = useCallback(async () => {
    // Mark that user has attempted to submit
    setHasAttemptedSubmit(true);

    // Validate inputs
    const symError = validateSymbol(symbol);
    const qtyError = validateQuantity(quantity);

    setSymbolError(symError);
    setQuantityError(qtyError);

    // If there are validation errors, focus on the first error field
    if (symError) {
      pairSelectorRef.current?.focus();
      return;
    }
    if (qtyError) {
      quantityInputRef.current?.focus();
      return;
    }

    if (!symbol) return;

    setIsLoading(true);
    setError(null);

    // Track quote request
    trackEvent("quote_requested", { symbol, side, quantity });

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

      const quoteData = data as QuoteResponse;
      setQuoteResult(quoteData);
      setFetchedAt(Date.now());
      setIsStale(false);

      // Track successful quote
      const successCount = quoteData.results.filter((r) => r.status === "ok").length;
      trackEvent("quote_succeeded", {
        symbol,
        side,
        quantity,
        exchangeCount: successCount
      });

      // Show toast for exchange warnings (timeout, error, unavailable)
      const slowExchanges = quoteData.results
        .filter((r) => r.status === "timeout")
        .map((r) => r.exchange);
      const errorExchanges = quoteData.results
        .filter((r) => r.status === "error" || r.status === "unavailable")
        .map((r) => r.exchange);

      // Track exchange timeouts
      slowExchanges.forEach((exchange) => {
        trackEvent("exchange_timeout", { exchange, symbol });
      });

      if (slowExchanges.length > 0) {
        toast({
          variant: "warning",
          description: `${slowExchanges.join(", ")} ${slowExchanges.length === 1 ? "is" : "are"} slow to respond`,
        });
      } else if (errorExchanges.length > 0 && errorExchanges.length < quoteData.results.length) {
        toast({
          variant: "warning",
          description: `${errorExchanges.join(", ")} unavailable`,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setQuoteResult(null);
      setFetchedAt(null);
      setIsStale(false);

      // Track and report error
      trackEvent("quote_failed", { symbol, side, quantity });
      reportError(err, { symbol, side, quantity });
    } finally {
      setIsLoading(false);
    }
  }, [symbol, side, quantity, validateSymbol, validateQuantity]);

  // Track stale data (>5s old) with interval
  useEffect(() => {
    if (!fetchedAt || !quoteResult) {
      setIsStale(false);
      return;
    }

    // Check immediately if already stale
    const checkStale = () => {
      const age = Date.now() - fetchedAt;
      setIsStale(age > 5000);
    };

    checkStale();

    // Check every second
    const interval = setInterval(checkStale, 1000);

    return () => clearInterval(interval);
  }, [fetchedAt, quoteResult]);

  // Track last auto-fetched params to prevent duplicate fetches
  const lastAutoFetchParams = useRef<string | null>(null);

  // Auto-fetch when URL has valid params (initial load or quick-start)
  useEffect(() => {
    // Create a key for current params
    const paramsKey = urlParams.s && urlParams.qty
      ? `${urlParams.s}:${urlParams.side}:${urlParams.qty}`
      : null;

    // Skip if no params, already fetched these params, or currently loading
    if (!paramsKey || lastAutoFetchParams.current === paramsKey || isLoading) {
      return;
    }

    // Skip if we already have results (user manually compared)
    if (quoteResult && !urlParams.s) {
      return;
    }

    // Sync URL params to state and trigger fetch
    if (urlParams.s && urlParams.qty && canCompare) {
      lastAutoFetchParams.current = paramsKey;
      void handleCompare();
    }
  }, [urlParams.s, urlParams.side, urlParams.qty, canCompare, quoteResult, isLoading, handleCompare]);

  // Handle Copy Link
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      trackEvent("copy_link", { path: window.location.pathname + window.location.search });
    } catch {
      // Fallback for browsers without clipboard API
      setError("Failed to copy link");
    }
  }, []);

  // Handle trade click tracking
  const handleTradeClick = useCallback((exchange: ExchangeId) => {
    trackEvent("affiliate_click", {
      exchange,
      symbol: symbol ?? undefined,
      side,
      quantity: quantity || undefined,
    });
  }, [symbol, side, quantity]);

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
            ref={pairSelectorRef}
            id="symbol-selector"
            symbols={initialSymbols}
            value={symbol}
            onChange={handleSymbolChange}
            disabled={isLoading}
            error={symbolError ?? undefined}
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
            ref={quantityInputRef}
            id="quantity-input"
            value={quantity}
            onChange={handleQuantityChange}
            baseAsset={baseAsset}
            disabled={isLoading}
            presets={[1, 10, 100, 1000]}
            error={quantityError ?? undefined}
          />
        </div>

        {/* Compare Button */}
        <div className="lg:flex-shrink-0">
          <Button
            onClick={handleCompare}
            disabled={isLoading}
            className="w-full lg:w-auto"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
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
        {/* Full-page Error State */}
        {error && (
          <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
            <AlertTriangle
              className="h-12 w-12 text-amber-500 mb-4"
              aria-hidden="true"
            />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Unable to fetch prices
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {error}
            </p>
            <Button onClick={handleCompare} className="gap-2">
              <Loader2 className={cn("h-4 w-4", isLoading ? "animate-spin" : "hidden")} />
              {isLoading ? "Retrying..." : "Try Again"}
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <>
            {/* Mobile: Skeleton Cards */}
            <div className="space-y-4 lg:hidden">
              {[1, 2, 3].map((i) => (
                <ExchangeCardSkeleton key={i} />
              ))}
            </div>

            {/* Desktop: Skeleton Table */}
            <div className="hidden lg:block rounded-lg border overflow-hidden">
              <ResultsTableSkeleton rows={3} />
            </div>
          </>
        )}

        {/* Results */}
        {quoteResult && !isLoading && (
          <>
            {/* Screen reader announcement for results */}
            <div className="sr-only" role="status" aria-live="polite">
              {quoteResult.best
                ? `Results loaded. Best exchange is ${quoteResult.best}.`
                : "Results loaded."}
            </div>

            {/* Header with Stale Warning and Copy Link */}
            <div className="flex items-center justify-between mb-4 gap-4">
              {/* Stale Data Warning */}
              {isStale && (
                <div className="flex items-center gap-2 text-amber-500 text-sm">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  <span>Data may be stale. Click Compare to refresh.</span>
                </div>
              )}
              {!isStale && <div />}

              {/* Copy Link Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="gap-2 flex-shrink-0"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
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
                  savingsAmount={quote.exchange === quoteResult.best ? savingsAmount : undefined}
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
          <EmptyState
            onPairSelect={() => {
              // Focus quantity input after pair selection
              setTimeout(() => {
                quantityInputRef.current?.focus();
              }, 100);
            }}
          />
        )}

        {/* Results Bottom Ad (shown after results) */}
        {quoteResult && !isLoading && (
          <div className="mt-8 flex justify-center">
            <AdSlot slotId="results-bottom" />
          </div>
        )}
      </div>
    </div>
  );
}
