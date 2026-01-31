# A-ADS Integration Specification

Ad network integration using A-ADS (Anonymous Ads).

## Why A-ADS

| Criteria | A-ADS | Coinzilla | Google AdSense |
|----------|-------|-----------|----------------|
| Crypto sites allowed | Yes (100% fill) | Yes | Restricted |
| Minimum traffic | None | 3+ months history | High |
| Cookies/tracking | None | Yes | Yes |
| Consent banner needed | No | Yes | Yes |
| Min deposit | $25 | $500+ | N/A |
| Since | 2011 | 2016 | 2003 |

A-ADS is crypto-friendly, cookie-less (no consent banner per `specs/consent.md`), and has no minimum traffic requirements.

## Technical Details

- Embeds are CSS/HTML only (iframe)
- No JavaScript, no cookies
- Aligns with consent spec's "cookie-less" MVP approach

## Configuration

Environment variable:
```
NEXT_PUBLIC_AADS_SITE_ID=<your-site-id>
```

When not set, placeholder ads are shown (development mode).

## Ad Slots

Uses existing slots from `specs/monetization.md`:

| Slot ID | A-ADS Size (Mobile) | A-ADS Size (Desktop) |
|---------|---------------------|----------------------|
| `top-banner` | 320x50 | 728x90 |
| `results-bottom` | 320x100 | 728x90 |
| `sidebar` | Hidden | 300x250 |

## Embed Format

```html
<iframe
  data-aa="SITE_ID"
  src="//ad.a-ads.com/SITE_ID?size=WxH"
  loading="lazy"
/>
```

## CSP Requirements

Add to `frame-src`:
```
https://ad.a-ads.com
```

## Ad Guidelines

Per `specs/monetization.md`:
- Max 2 ad units visible at once
- No interstitials or popups
- Clear "Advertisement" label
- Lazy load after main content

## Placement

| Location | Component | Visibility |
|----------|-----------|------------|
| After header | `app/page.tsx` | Always |
| After results | `components/calculator.tsx` | After quote loaded |
| Right sidebar | `app/page.tsx` | Desktop only |

## Fallback

When `NEXT_PUBLIC_AADS_SITE_ID` not set:
- Show placeholder with slot ID and dimensions
- Useful for local development
