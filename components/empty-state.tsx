"use client";

import { QuickStartButtons } from "@/components/quick-start-buttons";
import { PopularPairs } from "@/components/popular-pairs";

interface EmptyStateProps {
  /** Callback to focus quantity input after pair selection */
  onPairSelect?: () => void;
}

/**
 * Empty state for calculator - shown when no results.
 * Composes educational blurb, quick-start buttons, and popular pairs.
 */
export function EmptyState({ onPairSelect }: EmptyStateProps) {
  return (
    <div className="py-10 space-y-8">
      {/* Educational blurb */}
      <div className="text-center max-w-md mx-auto">
        <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-3 tracking-tight">
          What is Price Impact?
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          When you trade large amounts, your order consumes liquidity from the
          order book and moves the price. Compare how much slippage you&apos;ll
          experience across different exchanges.
        </p>
      </div>

      {/* Quick-start buttons */}
      <QuickStartButtons className="text-center" />

      {/* Popular pairs */}
      <PopularPairs className="text-center" onPairSelect={onPairSelect} />
    </div>
  );
}
