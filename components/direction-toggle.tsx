"use client";

import { forwardRef } from "react";
import type { Side } from "@/lib/calculations";
import { cn } from "@/lib/utils";

export interface DirectionToggleProps {
  value: Side;
  onChange: (side: Side) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Direction toggle for selecting BUY or SELL side.
 *
 * - BUY = Electric Cyan (#22d3ee) when selected
 * - SELL = Magenta (#e879f9) when selected
 * - Triggers onChange when toggled
 */
const DirectionToggle = forwardRef<HTMLDivElement, DirectionToggleProps>(
  ({ value, onChange, disabled = false, className }, ref) => {
    const handleKeyDown = (side: Side) => (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!disabled) {
          onChange(side);
        }
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex rounded-md border border-border bg-card p-1",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        role="group"
        aria-label="Trade direction"
      >
        <button
          type="button"
          role="radio"
          aria-checked={value === "BUY"}
          aria-label="Buy"
          disabled={disabled}
          onClick={() => onChange("BUY")}
          onKeyDown={handleKeyDown("BUY")}
          className={cn(
            "relative px-4 py-2 text-sm font-medium rounded transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            value === "BUY"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
            disabled && "pointer-events-none"
          )}
        >
          BUY
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={value === "SELL"}
          aria-label="Sell"
          disabled={disabled}
          onClick={() => onChange("SELL")}
          onKeyDown={handleKeyDown("SELL")}
          className={cn(
            "relative px-4 py-2 text-sm font-medium rounded transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            value === "SELL"
              ? "bg-accent-alt text-accent-alt-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
            disabled && "pointer-events-none"
          )}
        >
          SELL
        </button>
      </div>
    );
  }
);

DirectionToggle.displayName = "DirectionToggle";

export { DirectionToggle };
