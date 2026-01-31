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

  // Simulate ad loading after visibility
  useEffect(() => {
    if (!isVisible) return;

    // In production, this would trigger ad network script
    // For now, we simulate loading delay
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [isVisible]);

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

        {/* Placeholder content (shown until ad network fills) */}
        {showPlaceholder && isVisible && (
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

        {/*
          Ad network script injection point
          In production, the ad network (AdSense, Coinzilla, etc.)
          would inject ad content here based on slot ID.

          Example for Google AdSense:
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-client="ca-pub-XXXXX"
               data-ad-slot="XXXXX"
               data-ad-format="auto"
               data-full-width-responsive="true">
          </ins>
        */}
      </div>
    </div>
  );
}

export default AdSlot;
