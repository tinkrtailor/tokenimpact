export type AdSlotId = "top-banner" | "results-bottom" | "sidebar";

export interface SlotDimensions {
  mobile: { width: number; height: number } | null;
  desktop: { width: number; height: number };
}

export type AAdsSize = `${number}x${number}`;

type PublicEnvKey =
  | "NEXT_PUBLIC_AADS_SITE_ID"
  | "NEXT_PUBLIC_AADS_SITE_ID_TOP_BANNER"
  | "NEXT_PUBLIC_AADS_SITE_ID_RESULTS_BOTTOM"
  | "NEXT_PUBLIC_AADS_SITE_ID_SIDEBAR"
  | "NEXT_PUBLIC_AADS_SITE_ID_TOP_BANNER_MOBILE"
  | "NEXT_PUBLIC_AADS_SITE_ID_TOP_BANNER_DESKTOP"
  | "NEXT_PUBLIC_AADS_SITE_ID_RESULTS_BOTTOM_MOBILE"
  | "NEXT_PUBLIC_AADS_SITE_ID_RESULTS_BOTTOM_DESKTOP"
  | "NEXT_PUBLIC_AADS_SITE_ID_SIDEBAR_DESKTOP";

// Keep direct property access so Next.js can inline NEXT_PUBLIC_* values in client bundles.
const PUBLIC_ENV: Record<PublicEnvKey, string | undefined> = {
  NEXT_PUBLIC_AADS_SITE_ID: process.env.NEXT_PUBLIC_AADS_SITE_ID,
  NEXT_PUBLIC_AADS_SITE_ID_TOP_BANNER: process.env.NEXT_PUBLIC_AADS_SITE_ID_TOP_BANNER,
  NEXT_PUBLIC_AADS_SITE_ID_RESULTS_BOTTOM: process.env.NEXT_PUBLIC_AADS_SITE_ID_RESULTS_BOTTOM,
  NEXT_PUBLIC_AADS_SITE_ID_SIDEBAR: process.env.NEXT_PUBLIC_AADS_SITE_ID_SIDEBAR,
  NEXT_PUBLIC_AADS_SITE_ID_TOP_BANNER_MOBILE:
    process.env.NEXT_PUBLIC_AADS_SITE_ID_TOP_BANNER_MOBILE,
  NEXT_PUBLIC_AADS_SITE_ID_TOP_BANNER_DESKTOP:
    process.env.NEXT_PUBLIC_AADS_SITE_ID_TOP_BANNER_DESKTOP,
  NEXT_PUBLIC_AADS_SITE_ID_RESULTS_BOTTOM_MOBILE:
    process.env.NEXT_PUBLIC_AADS_SITE_ID_RESULTS_BOTTOM_MOBILE,
  NEXT_PUBLIC_AADS_SITE_ID_RESULTS_BOTTOM_DESKTOP:
    process.env.NEXT_PUBLIC_AADS_SITE_ID_RESULTS_BOTTOM_DESKTOP,
  NEXT_PUBLIC_AADS_SITE_ID_SIDEBAR_DESKTOP:
    process.env.NEXT_PUBLIC_AADS_SITE_ID_SIDEBAR_DESKTOP,
};

export const SLOT_DIMENSIONS: Record<AdSlotId, SlotDimensions> = {
  "top-banner": {
    mobile: { width: 320, height: 50 },
    desktop: { width: 728, height: 90 },
  },
  "results-bottom": {
    mobile: { width: 320, height: 100 },
    desktop: { width: 728, height: 90 },
  },
  sidebar: {
    mobile: null,
    desktop: { width: 300, height: 250 },
  },
};

export const AADS_SIZES: Record<
  AdSlotId,
  { mobile: AAdsSize | null; desktop: AAdsSize }
> = {
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

export const SLOT_ENV_IDS: Record<AdSlotId, PublicEnvKey> = {
  "top-banner": "NEXT_PUBLIC_AADS_SITE_ID_TOP_BANNER",
  "results-bottom": "NEXT_PUBLIC_AADS_SITE_ID_RESULTS_BOTTOM",
  sidebar: "NEXT_PUBLIC_AADS_SITE_ID_SIDEBAR",
};

export const SLOT_SIZE_ENV_IDS: Record<
  AdSlotId,
  { mobile?: PublicEnvKey; desktop?: PublicEnvKey }
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

export const getAAdsSiteIds = (
  slotId: AdSlotId
): { mobile?: string; desktop?: string } => {
  const slotEnv = SLOT_ENV_IDS[slotId];
  const sizeEnv = SLOT_SIZE_ENV_IDS[slotId];
  const globalId = PUBLIC_ENV.NEXT_PUBLIC_AADS_SITE_ID;
  const slotFallback = PUBLIC_ENV[slotEnv] ?? globalId;

  return {
    mobile: sizeEnv.mobile ? PUBLIC_ENV[sizeEnv.mobile] ?? slotFallback : undefined,
    desktop: sizeEnv.desktop ? PUBLIC_ENV[sizeEnv.desktop] ?? slotFallback : undefined,
  };
};
