"use client";

import { useState, useCallback, useMemo, forwardRef, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import type { SymbolInfo, ExchangeId } from "@/lib/exchanges/types";

const RECENT_SYMBOLS_KEY = "tokenimpact_recent_symbols";
const MAX_RECENT = 5;

interface ExchangeBadgeProps {
  exchange: ExchangeId;
  available: boolean;
}

function ExchangeBadge({ exchange, available }: ExchangeBadgeProps) {
  const labels: Record<ExchangeId, string> = {
    binance: "BN",
    coinbase: "CB",
    kraken: "KR",
  };

  return (
    <Badge
      variant={available ? "secondary" : "outline"}
      className={cn(
        "text-[10px] px-1 py-0 h-4 font-mono",
        available
          ? "bg-secondary text-secondary-foreground"
          : "text-muted-foreground/40 border-muted/40"
      )}
    >
      {labels[exchange]}
    </Badge>
  );
}

interface SymbolOptionProps {
  symbol: SymbolInfo;
  isSelected: boolean;
}

function SymbolOption({ symbol, isSelected }: SymbolOptionProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <Check
          className={cn(
            "h-4 w-4",
            isSelected ? "opacity-100" : "opacity-0"
          )}
        />
        <span className="font-medium">{symbol.symbol}</span>
      </div>
      <div className="flex items-center gap-1">
        <ExchangeBadge exchange="binance" available={symbol.exchanges.binance} />
        <ExchangeBadge exchange="coinbase" available={symbol.exchanges.coinbase} />
        <ExchangeBadge exchange="kraken" available={symbol.exchanges.kraken} />
      </div>
    </div>
  );
}

export interface PairSelectorProps {
  symbols: SymbolInfo[];
  value: string | null;
  onChange: (symbol: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Error message to display */
  error?: string;
  /** HTML id attribute for label association */
  id?: string;
  className?: string;
}

/**
 * Pair selector component for choosing trading pairs.
 *
 * Features:
 * - Searchable dropdown with keyboard navigation
 * - Shows exchange availability badges (BN, CB, KR)
 * - Recently used symbols at top (persisted in localStorage)
 * - Common pairs (BTC, ETH) prioritized
 */
const PairSelector = forwardRef<HTMLButtonElement, PairSelectorProps>(
  (
    {
      symbols,
      value,
      onChange,
      disabled = false,
      placeholder = "Select pair...",
      error,
      id,
      className,
    },
    ref
  ) => {
    const hasError = Boolean(error);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [recentSymbols, setRecentSymbols] = useState<string[]>([]);

    // Load recent symbols from localStorage on mount
    useEffect(() => {
      try {
        const stored = localStorage.getItem(RECENT_SYMBOLS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as unknown;
          if (Array.isArray(parsed) && parsed.every((s) => typeof s === "string")) {
            setRecentSymbols(parsed);
          }
        }
      } catch {
        // Ignore localStorage errors
      }
    }, []);

    // Save a symbol to recent history
    const addToRecent = useCallback((symbol: string) => {
      setRecentSymbols((prev) => {
        const filtered = prev.filter((s) => s !== symbol);
        const updated = [symbol, ...filtered].slice(0, MAX_RECENT);
        try {
          localStorage.setItem(RECENT_SYMBOLS_KEY, JSON.stringify(updated));
        } catch {
          // Ignore localStorage errors
        }
        return updated;
      });
    }, []);

    // Handle symbol selection
    const handleSelect = useCallback(
      (symbolValue: string) => {
        onChange(symbolValue);
        addToRecent(symbolValue);
        setOpen(false);
        setSearch("");
      },
      [onChange, addToRecent]
    );

    // Filter symbols based on search
    const filteredSymbols = useMemo(() => {
      if (!search) return symbols;
      const upperSearch = search.toUpperCase();
      return symbols.filter(
        (s) =>
          s.base.includes(upperSearch) ||
          s.quote.includes(upperSearch) ||
          s.symbol.includes(upperSearch)
      );
    }, [symbols, search]);

    // Get recent symbols that exist in the catalog and match search
    const recentMatches = useMemo(() => {
      const recentSet = new Set(recentSymbols);
      return filteredSymbols.filter((s) => recentSet.has(s.symbol));
    }, [filteredSymbols, recentSymbols]);

    // Get non-recent symbols
    const nonRecentSymbols = useMemo(() => {
      const recentSet = new Set(recentSymbols);
      return filteredSymbols.filter((s) => !recentSet.has(s.symbol));
    }, [filteredSymbols, recentSymbols]);

    // Find the selected symbol info
    const selectedSymbol = useMemo(() => {
      if (!value) return null;
      return symbols.find((s) => s.symbol === value) ?? null;
    }, [symbols, value]);

    return (
      <div className="space-y-1.5">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              id={id}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-label="Select trading pair"
              aria-invalid={hasError}
              aria-describedby={hasError ? `${id}-error` : undefined}
              disabled={disabled}
              className={cn(
                "w-full justify-between bg-card hover:bg-secondary/50",
                !value && "text-muted-foreground",
                hasError && "border-destructive focus-visible:ring-destructive",
                className
              )}
            >
              <span className="truncate">
                {selectedSymbol ? selectedSymbol.symbol : placeholder}
              </span>
              <ChevronDown
                className={cn(
                  "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200",
                  open && "rotate-180"
                )}
              />
            </Button>
          </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Search pairs..."
                value={search}
                onValueChange={setSearch}
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <CommandList className="max-h-[300px]">
              <CommandEmpty>No trading pairs found.</CommandEmpty>

              {/* Recent symbols section */}
              {recentMatches.length > 0 && (
                <CommandGroup heading="Recent">
                  {recentMatches.map((symbol) => (
                    <CommandItem
                      key={`recent-${symbol.symbol}`}
                      value={symbol.symbol}
                      onSelect={handleSelect}
                      className="cursor-pointer"
                    >
                      <SymbolOption
                        symbol={symbol}
                        isSelected={value === symbol.symbol}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* All symbols section */}
              {nonRecentSymbols.length > 0 && (
                <CommandGroup heading={recentMatches.length > 0 ? "All pairs" : undefined}>
                  {nonRecentSymbols.map((symbol) => (
                    <CommandItem
                      key={symbol.symbol}
                      value={symbol.symbol}
                      onSelect={handleSelect}
                      className="cursor-pointer"
                    >
                      <SymbolOption
                        symbol={symbol}
                        isSelected={value === symbol.symbol}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {/* Error message */}
      {hasError && (
        <p
          id={id ? `${id}-error` : "pair-selector-error"}
          className="text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
    );
  }
);

PairSelector.displayName = "PairSelector";

export { PairSelector };
