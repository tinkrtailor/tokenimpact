# A-ADS Setup Guide

Set up display advertising with A-ADS (Anonymous Ads).

## Why A-ADS?

- Crypto sites allowed (100% fill)
- No minimum traffic requirements
- Cookie-less (no consent banner needed)
- No JavaScript, just iframes

## Setup Steps

### 1. Create A-ADS Account

1. Go to [a-ads.com](https://a-ads.com)
2. Click "Earn" → "Add Site"
3. Sign up with email or Bitcoin wallet

### 2. Add Your Site

1. Enter your domain: `tokenimpact.com` (or your domain)
2. Select site category: **Finance / Cryptocurrency**
3. Submit for review (usually instant for crypto sites)

### 3. Create Ad Units

Create 3 ad units with these sizes:

| Slot | Size | Where it shows |
|------|------|----------------|
| Top Banner (Mobile) | 320x50 | Below header, mobile |
| Top Banner (Desktop) | 728x90 | Below header, desktop |
| Results Bottom | 320x100 / 728x90 | Below results |
| Sidebar | 300x250 | Right column, desktop only |

**Note:** A-ADS assigns a different `data-aa` (site ID) per ad unit. This repo supports
per-slot and per-size IDs (mobile/desktop). If you only want one ID for all slots, create
a single ad unit and reuse it.

### 4. Get Your Ad Unit IDs

Each ad unit has its own **Ad Unit ID** (A-ADS uses `data-aa` in the embed code). It looks like: `123456789`

### 5. Configure Environment

Add to your `.env.local` (per-slot + per-size):

```bash
NEXT_PUBLIC_AADS_SITE_ID_TOP_BANNER_MOBILE=123456789
NEXT_PUBLIC_AADS_SITE_ID_TOP_BANNER_DESKTOP=123456780
NEXT_PUBLIC_AADS_SITE_ID_RESULTS_BOTTOM_MOBILE=234567890
NEXT_PUBLIC_AADS_SITE_ID_RESULTS_BOTTOM_DESKTOP=234567891
NEXT_PUBLIC_AADS_SITE_ID_SIDEBAR_DESKTOP=345678901
```

Replace the values with your actual Ad Unit IDs.

Fallback options (if you want fewer vars):
```bash
NEXT_PUBLIC_AADS_SITE_ID_TOP_BANNER=123456789
NEXT_PUBLIC_AADS_SITE_ID_RESULTS_BOTTOM=234567890
NEXT_PUBLIC_AADS_SITE_ID_SIDEBAR=345678901
```

Optional (single ID for all slots):
```bash
NEXT_PUBLIC_AADS_SITE_ID=123456789
```

### 6. Deploy

Deploy your changes. Ads will start showing automatically.

## Testing Locally

Without the env var set, placeholder boxes show the slot dimensions. This is normal for development.

To test with real ads locally:
```bash
NEXT_PUBLIC_AADS_SITE_ID_TOP_BANNER_MOBILE=123456789 \
NEXT_PUBLIC_AADS_SITE_ID_TOP_BANNER_DESKTOP=123456780 \
NEXT_PUBLIC_AADS_SITE_ID_RESULTS_BOTTOM_MOBILE=234567890 \
NEXT_PUBLIC_AADS_SITE_ID_RESULTS_BOTTOM_DESKTOP=234567891 \
NEXT_PUBLIC_AADS_SITE_ID_SIDEBAR_DESKTOP=345678901 \
bun run dev
```

## Ad Slots in Codebase

The `<AdSlot>` component handles everything:

```tsx
import { AdSlot } from "@/components/ad-slot";

// In your page
<AdSlot slotId="top-banner" />
<AdSlot slotId="results-bottom" />
<AdSlot slotId="sidebar" />
```

Currently placed:
- `app/page.tsx` - top banner

## Revenue & Payments

- Earnings in Bitcoin (BTC)
- Minimum withdrawal: ~$1 equivalent
- Payments: daily automatic or manual
- Dashboard shows impressions, clicks, CPM

## Troubleshooting

**Ads not showing?**
- Check the per-size/per-slot env vars are set correctly (or `NEXT_PUBLIC_AADS_SITE_ID` if using one ID)
- Ensure domain matches what you registered
- Check browser console for CSP errors

**CSP errors?**
Add to your Content Security Policy:
```
frame-src https://ad.a-ads.com
```

**Low fill rate?**
A-ADS has near 100% fill for crypto sites. If empty, check site approval status.
