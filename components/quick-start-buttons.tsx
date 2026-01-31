"use client";

import { useQueryStates, parseAsString, parseAsStringLiteral } from "nuqs";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

/** Quick-start configuration */
const QUICK_STARTS = [
  { label: "Try BTC", symbol: "BTC-USDT", quantity: "1", side: "sell" as const },
  { label: "Try ETH", symbol: "ETH-USDT", quantity: "10", side: "sell" as const },
  { label: "Try SOL", symbol: "SOL-USDT", quantity: "100", side: "sell" as const },
];

/** URL state schema for nuqs */
const urlStateSchema = {
  s: parseAsString,
  side: parseAsStringLiteral(["buy", "sell"] as const).withDefault("buy"),
  qty: parseAsString,
};

interface QuickStartButtonsProps {
  className?: string;
}

/**
 * Quick-start buttons that set URL params and trigger auto-compare.
 * Client component - appears in empty state.
 */
export function QuickStartButtons({ className }: QuickStartButtonsProps) {
  const [, setUrlParams] = useQueryStates(urlStateSchema, {
    history: "replace",
    shallow: false, // Full navigation to trigger auto-fetch
  });

  const handleClick = (config: (typeof QUICK_STARTS)[number]) => {
    trackEvent("quick_start_clicked", {
      symbol: config.symbol,
      quantity: config.quantity,
    });

    void setUrlParams({
      s: config.symbol,
      side: config.side,
      qty: config.quantity,
    });
  };

  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground mb-3">
        Try a quick comparison:
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {QUICK_STARTS.map((config) => (
          <Button
            key={config.symbol}
            variant="outline"
            size="sm"
            onClick={() => handleClick(config)}
          >
            {config.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
