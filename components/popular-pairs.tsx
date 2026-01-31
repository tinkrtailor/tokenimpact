"use client";

import { useQueryStates, parseAsString, parseAsStringLiteral } from "nuqs";
import { Badge } from "@/components/ui/badge";
import { trackEvent } from "@/lib/analytics";

/** Popular pairs configuration - static list */
const POPULAR_PAIRS = [
  { symbol: "BTC-USDT", name: "Bitcoin", exchanges: 3 },
  { symbol: "ETH-USDT", name: "Ethereum", exchanges: 3 },
  { symbol: "SOL-USDT", name: "Solana", exchanges: 3 },
  { symbol: "XRP-USDT", name: "Ripple", exchanges: 3 },
];

/** URL state schema for nuqs */
const urlStateSchema = {
  s: parseAsString,
  side: parseAsStringLiteral(["buy", "sell"] as const).withDefault("buy"),
  qty: parseAsString,
};

interface PopularPairsProps {
  className?: string;
  /** Callback when a pair is selected - used to focus quantity input */
  onPairSelect?: () => void;
}

/**
 * Clickable popular pairs grid.
 * Sets symbol only (user enters quantity).
 * Client component - appears in empty state.
 */
export function PopularPairs({ className, onPairSelect }: PopularPairsProps) {
  const [, setUrlParams] = useQueryStates(urlStateSchema, {
    history: "replace",
    shallow: true,
  });

  const handleClick = (symbol: string) => {
    trackEvent("popular_pair_clicked", { symbol });

    void setUrlParams({
      s: symbol,
      side: null, // Keep existing or default
      qty: null, // Clear to let user enter
    });

    onPairSelect?.();
  };

  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground/70 mb-3 uppercase tracking-wider font-medium">
        Popular pairs
      </p>
      <div className="flex flex-wrap justify-center md:grid md:grid-cols-4 gap-2">
        {POPULAR_PAIRS.map((pair) => (
          <button
            key={pair.symbol}
            onClick={() => handleClick(pair.symbol)}
            className="flex-shrink-0 group"
          >
            <Badge
              variant="secondary"
              className="px-4 py-2.5 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
            >
              <span className="font-semibold text-foreground group-hover:text-accent-foreground">
                {pair.symbol.split("-")[0]}
              </span>
              <span className="text-xs text-muted-foreground group-hover:text-accent-foreground/70">
                {pair.exchanges} exchanges
              </span>
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
