import { cn } from "@/lib/utils";
import {
  AADS_SIZES,
  SLOT_DIMENSIONS,
  getAAdsSiteIds,
  type AdSlotId,
} from "@/components/ad-slot-config";

interface AdSlotStaticProps {
  slotId: AdSlotId;
  className?: string;
}

/**
 * Static ad slot used for verification pages where bots may not execute JS.
 * Renders A-ADS iframes directly in the server HTML.
 */
export function AdSlotStatic({ slotId, className }: AdSlotStaticProps) {
  const dimensions = SLOT_DIMENSIONS[slotId];
  const aadsSizes = AADS_SIZES[slotId];
  const aadsSiteIds = getAAdsSiteIds(slotId);
  const hiddenOnMobile = dimensions.mobile === null;
  const hasAds = Boolean(aadsSiteIds.mobile || aadsSiteIds.desktop);

  return (
    <div
      className={cn("flex flex-col items-center", hiddenOnMobile && "hidden lg:flex", className)}
      role="complementary"
      aria-label="Advertisement"
    >
      <span className="text-xs text-muted-foreground/60 uppercase tracking-wide mb-1">
        Advertisement
      </span>

      <div
        className="relative bg-surface/50 border border-border/30 rounded-sm overflow-hidden"
        style={{
          width: dimensions.mobile?.width ?? dimensions.desktop.width,
          height: dimensions.mobile?.height ?? dimensions.desktop.height,
        }}
        data-slot-id={slotId}
      >
        <style jsx>{`
          @media (min-width: 1024px) {
            div[data-slot-id="${slotId}"] {
              width: ${dimensions.desktop.width}px !important;
              height: ${dimensions.desktop.height}px !important;
            }
          }
        `}</style>

        {aadsSizes.mobile && aadsSiteIds.mobile && (
          <iframe
            data-aa={aadsSiteIds.mobile}
            src={`https://ad.a-ads.com/${aadsSiteIds.mobile}?size=${aadsSizes.mobile}`}
            className="absolute inset-0 lg:hidden border-0"
            style={{
              width: dimensions.mobile?.width ?? dimensions.desktop.width,
              height: dimensions.mobile?.height ?? dimensions.desktop.height,
            }}
            title={`Advertisement - ${slotId} mobile`}
            loading="eager"
          />
        )}

        {aadsSiteIds.desktop && (
          <iframe
            data-aa={aadsSiteIds.desktop}
            src={`https://ad.a-ads.com/${aadsSiteIds.desktop}?size=${aadsSizes.desktop}`}
            className={cn("absolute inset-0 border-0", aadsSizes.mobile ? "hidden lg:block" : "")}
            style={{
              width: dimensions.desktop.width,
              height: dimensions.desktop.height,
            }}
            title={`Advertisement - ${slotId} desktop`}
            loading="eager"
          />
        )}

        {!hasAds && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground/50">
            Missing A-ADS ID for {slotId}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdSlotStatic;
