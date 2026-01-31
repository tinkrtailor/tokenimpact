# Ad Network Setup Guide

This guide explains how to configure display advertising for Token Impact using A-ADS (Anonymous Ads).

## Why A-ADS?

| Feature | A-ADS |
|---------|-------|
| Crypto-friendly | Yes, 100% fill rate for crypto sites |
| Cookies | None (no consent banner needed) |
| JavaScript | None (pure iframe embeds) |
| Minimum traffic | None |
| Minimum deposit | $25 (for advertisers, not publishers) |
| Payout threshold | 0.001 BTC (~$60) |
| Payment methods | Bitcoin, Lightning Network |

## Quick Start

### 1. Create A-ADS Account

1. Go to [a-ads.com](https://a-ads.com)
2. Click "Earn" or "For Publishers"
3. Sign up with email or Bitcoin wallet

### 2. Add Your Site

1. In the dashboard, click "Add new ad unit"
2. Enter your site URL (e.g., `tokenimpact.com`)
3. Select ad size (we use multiple sizes, but start with `728x90`)
4. Copy the **Site ID** from the generated embed code

The site ID is the number in the embed code:
```html
<iframe data-aa="12345678" src="//ad.a-ads.com/12345678?size=728x90">
                 ^^^^^^^^
                 This is your Site ID
```

### 3. Configure Environment Variable

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_AADS_SITE_ID=12345678
```

Replace `12345678` with your actual site ID.

### 4. Deploy

Deploy your site. Ads will appear automatically in the configured slots.

## Ad Slots

| Slot | Location | Mobile | Desktop |
|------|----------|--------|---------|
| `top-banner` | After header | 320x50 | 728x90 |
| `results-bottom` | After results | 320x100 | 728x90 |
| `sidebar` | Right column | Hidden | 300x250 |

## Development Mode

When `NEXT_PUBLIC_AADS_SITE_ID` is not set:
- Placeholder boxes show slot ID and dimensions
- Useful for testing layout without real ads

## Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add:
   - Name: `NEXT_PUBLIC_AADS_SITE_ID`
   - Value: Your A-ADS site ID
   - Environment: Production (and Preview if desired)
4. Redeploy

## Testing

### Local Testing with Placeholder
```bash
bun run dev
# Visit http://localhost:3000
# You'll see placeholder ads with slot dimensions
```

### Local Testing with Real Ads
```bash
echo "NEXT_PUBLIC_AADS_SITE_ID=12345678" >> .env.local
bun run dev
# Real ads will load (may show "no ads" if site not approved yet)
```

### Production Verification

1. Deploy with the environment variable set
2. Visit your production site
3. Check that ads appear in all 3 slots
4. Verify mobile responsiveness (sidebar hidden, banners resize)

## A-ADS Dashboard

### Monitoring Earnings

1. Log in to [a-ads.com](https://a-ads.com)
2. View your ad unit statistics
3. Track impressions and earnings

### Payout Settings

1. Go to "Withdrawal" in your dashboard
2. Set your Bitcoin address
3. Choose payout threshold (min 0.001 BTC)
4. Payments are automatic when threshold is reached

## Troubleshooting

### Ads Not Showing

1. **Check environment variable**: Ensure `NEXT_PUBLIC_AADS_SITE_ID` is set
2. **Check CSP**: Verify `frame-src` includes `https://ad.a-ads.com`
3. **Check browser console**: Look for blocked frame errors
4. **Site approval**: New sites may take 24-48 hours for full ad fill

### Low Fill Rate

A-ADS may show "no ads available" banners initially. This improves as:
- Your site gets more traffic
- More advertisers target your niche
- You've been a publisher longer

### Placeholder Showing in Production

Ensure the environment variable is:
1. Named exactly `NEXT_PUBLIC_AADS_SITE_ID`
2. Set in your hosting provider (Vercel, etc.)
3. Deployment was triggered after adding the variable

## Content Security Policy

The CSP in `next.config.ts` includes A-ADS:

```typescript
"frame-src https://ad.a-ads.com ..."
```

If you modify CSP, ensure this domain remains allowed.

## Revenue Optimization

### Best Practices

1. **Don't overload with ads** - Max 2 visible at once (per spec)
2. **Above the fold** - Top banner gets most impressions
3. **After engagement** - Results-bottom shows after user action
4. **Desktop sidebar** - High-value placement for desktop users

### A-ADS Specific Tips

1. Enable all ad categories for higher fill rate
2. Consider enabling adult ads if appropriate (higher CPM)
3. Bitcoin-related traffic performs best on A-ADS

## Alternative Networks

If A-ADS doesn't meet your needs, consider:

| Network | Pros | Cons |
|---------|------|------|
| Coinzilla | Higher CPM, crypto-focused | Requires 3+ months traffic history |
| Google AdSense | Highest fill rate | May reject crypto sites |
| Carbon Ads | Developer-focused, tasteful | Competitive approval |

To switch networks, update the `AdSlot` component iframe source.

## Support

- A-ADS Support: support@a-ads.com
- A-ADS Telegram: [@AAdsCom](https://t.me/AAdsCom)
- Documentation: https://a-ads.com/blog/how-to-
