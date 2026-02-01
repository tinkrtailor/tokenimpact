"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Available ad slot IDs */
export type AdSlotId = "top-banner" | "results-bottom" | "sidebar";

/** Slot dimension configuration */
interface SlotDimensions {
  mobile: { width: number; height: number } | null;
  desktop: { width: number; height: number };
}

/** A-ADS size format string */
type AAdsSize = `${number}x${number}`;

/** Dimension configurations per slot */
const SLOT_DIMENSIONS: Record<AdSlotId, SlotDimensions> = {
  "top-banner": {
    mobile: { width: 320, height: 50 },
    desktop: { width: 728, height: 90 },
  },
  "results-bottom": {
    mobile: { width: 320, height: 100 },
    desktop: { width: 728, height: 90 },
  },
  sidebar: {
    mobile: null, // Hidden on mobile
    desktop: { width: 300, height: 250 },
  },
};

/** A-ADS size mappings for each slot */
const AADS_SIZES: Record<AdSlotId, { mobile: AAdsSize | null; desktop: AAdsSize }> = {
  "top-banner": {
    mobile: "320x50",
    desktop: "728x90",
  },
  "results-bottom": {
    mobile: "320x100",
    desktop: "728x90",
  },
  sidebar: {
    mobile: null,
    desktop: "300x250",
  },
};

/** Per-slot environment variable names (fallback to global) */
const SLOT_ENV_IDS: Record<AdSlotId, string> = {
  "top-banner": "NEXT_PUBLIC_AADS_SITE_ID_TOP_BANNER",
  "results-bottom": "NEXT_PUBLIC_AADS_SITE_ID_RESULTS_BOTTOM",
  sidebar: "NEXT_PUBLIC_AADS_SITE_ID_SIDEBAR",
};

/** Per-slot + per-size environment variable names (preferred) */
const SLOT_SIZE_ENV_IDS: Record<
  AdSlotId,
  { mobile?: string; desktop?: string }
> = {
  "top-banner": {
    mobile: "NEXT_PUBLIC_AADS_SITE_ID_TOP_BANNER_MOBILE",
    desktop: "NEXT_PUBLIC_AADS_SITE_ID_TOP_BANNER_DESKTOP",
  },
  "results-bottom": {
    mobile: "NEXT_PUBLIC_AADS_SITE_ID_RESULTS_BOTTOM_MOBILE",
    desktop: "NEXT_PUBLIC_AADS_SITE_ID_RESULTS_BOTTOM_DESKTOP",
  },
  sidebar: {
    desktop: "NEXT_PUBLIC_AADS_SITE_ID_SIDEBAR_DESKTOP",
  },
};

/** Get A-ADS publisher site IDs from environment */
const getAAdsSiteIds = (
  slotId: AdSlotId
): { mobile?: string; desktop?: string } => {
  const slotEnv = SLOT_ENV_IDS[slotId];
  const sizeEnv = SLOT_SIZE_ENV_IDS[slotId];
  const globalId = process.env.NEXT_PUBLIC_AADS_SITE_ID;
  const slotFallback = process.env[slotEnv] ?? globalId;

  return {
    mobile: sizeEnv.mobile ? process.env[sizeEnv.mobile] ?? slotFallback : undefined,
    desktop: sizeEnv.desktop ? process.env[sizeEnv.desktop] ?? slotFallback : undefined,
  };
};

export interface AdSlotProps {
  /** The slot ID determining size and placement */
  slotId: AdSlotId;
  /** Additional class names */
  className?: string;
  /** Whether to show a fallback placeholder (for testing) */
  showPlaceholder?: boolean;
}

/**
 * Ad slot component for display advertising.
 *
 * Features:
 * - Responsive sizing per slot configuration
 * - Lazy loading via IntersectionObserver
 * - "Advertisement" label for transparency
 * - Hidden on mobile for sidebar slot
 * - Placeholder rendering until ad network integration
 *
 * Slot sizes:
 * - top-banner: 320x50 (mobile) / 728x90 (desktop)
 * - results-bottom: 320x100 (mobile) / 728x90 (desktop)
 * - sidebar: hidden (mobile) / 300x250 (desktop)
 */
export function AdSlot({
  slotId,
  className,
  showPlaceholder = true,
}: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const dimensions = SLOT_DIMENSIONS[slotId];

  // Lazy load using IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px", // Start loading 100px before visible
        threshold: 0,
      }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Mark as loaded once visible (A-ADS iframes load independently)
  useEffect(() => {
    if (!isVisible) return;
    setIsLoaded(true);
  }, [isVisible]);

  // Check if A-ADS is configured
  const aadsSiteIds = getAAdsSiteIds(slotId);
  const hasAds = !!(aadsSiteIds.mobile || aadsSiteIds.desktop);

  // Get A-ADS sizes for current slot
  const aadsSizes = AADS_SIZES[slotId];

  // For sidebar slot, hide on mobile
  const hiddenOnMobile = dimensions.mobile === null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col items-center",
        hiddenOnMobile && "hidden lg:flex",
        className
      )}
      role="complementary"
      aria-label="Advertisement"
    >
      {/* Advertisement label */}
      <span className="text-xs text-muted-foreground/60 uppercase tracking-wide mb-1">
        Advertisement
      </span>

      {/* Ad container with responsive sizing */}
      <div
        className={cn(
          "relative bg-surface/50 border border-border/30 rounded-sm overflow-hidden",
          "transition-opacity duration-300",
          !isLoaded && "opacity-50"
        )}
        style={{
          // Mobile dimensions (or desktop if mobile is null)
          width: dimensions.mobile?.width ?? dimensions.desktop.width,
          height: dimensions.mobile?.height ?? dimensions.desktop.height,
        }}
        data-slot-id={slotId}
      >
        {/* Desktop override styles */}
        <style jsx>{`
          @media (min-width: 1024px) {
            div[data-slot-id="${slotId}"] {
              width: ${dimensions.desktop.width}px !important;
              height: ${dimensions.desktop.height}px !important;
            }
          }
        `}</style>

        {/* A-ADS iframe (when configured) */}
        {hasAds && isVisible && (
          <>
            {/* Mobile iframe */}
            {aadsSizes.mobile && aadsSiteIds.mobile && (
              <iframe
                data-aa={aadsSiteIds.mobile}
                src={`//ad.a-ads.com/${aadsSiteIds.mobile}?size=${aadsSizes.mobile}`}
                className="absolute inset-0 lg:hidden border-0"
                style={{
                  width: dimensions.mobile?.width ?? dimensions.desktop.width,
                  height: dimensions.mobile?.height ?? dimensions.desktop.height,
                }}
                title={`Advertisement - ${slotId}`}
                loading="lazy"
              />
            )}
            {/* Desktop iframe */}
            {aadsSiteIds.desktop && (
              <iframe
                data-aa={aadsSiteIds.desktop}
                src={`//ad.a-ads.com/${aadsSiteIds.desktop}?size=${aadsSizes.desktop}`}
                className={cn(
                  "absolute inset-0 border-0",
                  aadsSizes.mobile ? "hidden lg:block" : ""
                )}
                style={{
                  width: dimensions.desktop.width,
                  height: dimensions.desktop.height,
                }}
                title={`Advertisement - ${slotId}`}
                loading="lazy"
              />
            )}
          </>
        )}

        {/* Placeholder content (shown when A-ADS not configured) */}
        {!hasAds && showPlaceholder && isVisible && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40">
            <span className="text-xs font-mono">
              {slotId}
              <br />
              <span className="lg:hidden">
                {dimensions.mobile?.width}x{dimensions.mobile?.height}
              </span>
              <span className="hidden lg:inline">
                {dimensions.desktop.width}x{dimensions.desktop.height}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdSlot;
