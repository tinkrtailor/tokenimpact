"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  AADS_SIZES,
  SLOT_DIMENSIONS,
  getAAdsSiteIds,
  type AdSlotId,
} from "@/components/ad-slot-config";

export type { AdSlotId };

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
