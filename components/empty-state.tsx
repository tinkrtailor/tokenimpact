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
    <div className="py-8 space-y-6">
      {/* Educational blurb */}
      <div className="text-center max-w-lg mx-auto">
        <h3 className="text-lg font-medium text-foreground mb-2">
          What is Price Impact?
        </h3>
        <p className="text-sm text-muted-foreground">
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
