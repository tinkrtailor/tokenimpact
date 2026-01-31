"use client";

import { forwardRef, useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface QuantityInputProps {
  /** Current quantity value (unformatted number) */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Base asset label to show as suffix (e.g., "BTC") */
  baseAsset?: string;
  /** Quick preset values to show as buttons */
  presets?: number[];
  /** Placeholder text */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
  /** HTML id attribute for label association */
  id?: string;
  /** Additional class name */
  className?: string;
  /** Additional class for presets container (e.g., "lg:hidden" to hide on desktop) */
  presetsClassName?: string;
}

/**
 * Formats a number string with thousand separators.
 * Handles decimal places and preserves trailing zeros during input.
 */
function formatWithThousandSeparators(value: string): string {
  if (!value) return "";

  // Remove existing separators
  const cleanValue = value.replace(/,/g, "");

  // Handle negative sign
  const isNegative = cleanValue.startsWith("-");
  const absValue = isNegative ? cleanValue.slice(1) : cleanValue;

  // Split integer and decimal parts
  const parts = absValue.split(".");
  const integerPart = parts[0] ?? "";
  const decimalPart = parts[1];

  // Format integer part with commas
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Reconstruct the number
  let result = formattedInteger;
  if (decimalPart !== undefined) {
    result += "." + decimalPart;
  } else if (value.endsWith(".")) {
    result += ".";
  }

  return isNegative ? "-" + result : result;
}

/**
 * Parses a formatted value back to a raw number string.
 */
function parseFormattedValue(value: string): string {
  return value.replace(/,/g, "");
}

/**
 * Quantity input component with numeric formatting, base asset label,
 * and quick preset buttons.
 *
 * Features:
 * - Thousand separators (1,000 format)
 * - Base asset label suffix (e.g., "BTC")
 * - Quick preset buttons (1, 10, 100, 1000 by default)
 * - Rejects non-numeric input
 * - Validation for positive numbers
 */
const QuantityInput = forwardRef<HTMLInputElement, QuantityInputProps>(
  (
    {
      value,
      onChange,
      baseAsset,
      presets = [1, 10, 100, 1000],
      placeholder = "Enter amount",
      disabled = false,
      error,
      id,
      className,
      presetsClassName,
    },
    ref
  ) => {
    // Track the display value (formatted)
    const [displayValue, setDisplayValue] = useState(() =>
      formatWithThousandSeparators(value)
    );

    // Sync display value when external value changes
    useEffect(() => {
      setDisplayValue(formatWithThousandSeparators(value));
    }, [value]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Allow empty input
        if (inputValue === "") {
          setDisplayValue("");
          onChange("");
          return;
        }

        // Remove commas for validation
        const rawValue = parseFormattedValue(inputValue);

        // Only allow valid numeric patterns (digits, one decimal point, no leading zeros except 0.x)
        const validPattern = /^(\d+\.?\d*|\.\d*)$/;
        if (!validPattern.test(rawValue)) {
          return; // Reject invalid input
        }

        // Prevent leading zeros (except for "0" or "0.x")
        if (rawValue.length > 1 && rawValue.startsWith("0") && !rawValue.startsWith("0.")) {
          return;
        }

        // Update display with formatting
        setDisplayValue(formatWithThousandSeparators(rawValue));
        onChange(rawValue);
      },
      [onChange]
    );

    const handlePresetClick = useCallback(
      (preset: number) => {
        const stringValue = preset.toString();
        setDisplayValue(formatWithThousandSeparators(stringValue));
        onChange(stringValue);
      },
      [onChange]
    );

    const handleBlur = useCallback(() => {
      // Clean up on blur - remove trailing decimal if no decimals entered
      if (value.endsWith(".")) {
        const cleanValue = value.slice(0, -1);
        setDisplayValue(formatWithThousandSeparators(cleanValue));
        onChange(cleanValue);
      }
    }, [value, onChange]);

    const hasError = Boolean(error);

    return (
      <div className={cn("space-y-2", className)}>
        {/* Input with suffix */}
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : undefined}
            className={cn(
              "pr-16 font-mono",
              hasError && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {baseAsset && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-sm text-muted-foreground font-medium">
                {baseAsset}
              </span>
            </div>
          )}
        </div>

        {/* Error message */}
        {hasError && (
          <p
            id={id ? `${id}-error` : "quantity-error"}
            className="text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Quick preset buttons */}
        {presets.length > 0 && (
          <div className={cn("flex flex-wrap gap-2", presetsClassName)}>
            {presets.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant="outline"
                onClick={() => handlePresetClick(preset)}
                disabled={disabled}
                className="min-w-[3rem] font-mono text-sm"
              >
                {preset.toLocaleString()}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

QuantityInput.displayName = "QuantityInput";

export { QuantityInput, formatWithThousandSeparators, parseFormattedValue };
