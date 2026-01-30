# Brand Assets Specification

Creation and implementation of logos, favicons, OG images, and other brand assets.

## Overview

All assets must align with the brand identity defined in `nfr.md`:
- Professional, precise, trustworthy
- Dark theme with Electric Cyan accent (#22d3ee)
- Geist Sans typography
- Bloomberg terminal energy, not retail hype

## Logo

### Primary Logo

Text-based wordmark: "Token Impact"

| Property | Value |
|----------|-------|
| Font | Geist Sans Bold |
| Color (dark bg) | White (#fafafa) |
| Color (light bg) | Void Black (#09090b) |
| Accent | Electric Cyan (#22d3ee) on the "o" in Token |

**Design detail**: The "o" in "Token" features a subtle ripple/impact ring effect in Electric Cyan, suggesting the price impact concept.

### Logo Variants

| Variant | Use Case | Dimensions |
|---------|----------|------------|
| Full horizontal | Header, about page | 200x40 px (SVG) |
| Compact | Mobile header | 140x32 px (SVG) |
| Icon only | Favicon base, app icon | 512x512 px (SVG) |
| Monochrome | Print, low-color contexts | Same dims, single color |

### Icon Mark

Standalone icon for contexts where text doesn't fit:
- Stylized "T" with the ripple/impact effect
- Or: Abstract representation of price impact (concentric rings emanating from center point)

### Clear Space

Minimum clear space around logo = height of the "T" on all sides.

### Don'ts

- Don't stretch or distort
- Don't use colors outside the palette
- Don't add effects (drop shadows, gradients, glows)
- Don't place on busy backgrounds

## Favicon

### Favicon Package

Create complete favicon set for cross-browser/platform support:

| File | Size | Purpose |
|------|------|---------|
| `favicon.ico` | 16x16, 32x32, 48x48 | Legacy browsers |
| `favicon.svg` | Vector | Modern browsers |
| `apple-touch-icon.png` | 180x180 | iOS home screen |
| `icon-192.png` | 192x192 | Android/PWA |
| `icon-512.png` | 512x512 | PWA splash |

### Design

- Use the icon mark (stylized "T" or impact rings)
- Background: Void Black (#09090b)
- Icon: Electric Cyan (#22d3ee)
- Ensure legibility at 16x16

### Implementation

```html
<!-- In app/layout.tsx or head -->
<link rel="icon" href="/favicon.ico" sizes="32x32" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.webmanifest" />
```

## Open Graph Images

### Default OG Image

For homepage and pages without custom images.

| Property | Value |
|----------|-------|
| Dimensions | 1200x630 px |
| Background | Void Black (#09090b) |
| Format | PNG or JPG (< 300KB) |

**Layout**:
```
┌────────────────────────────────────────────┐
│                                            │
│         TOKEN IMPACT                       │
│         ────────────                       │
│                                            │
│    Compare Crypto Liquidity                │
│    Across Exchanges                        │
│                                            │
│    [Binance]  [Coinbase]  [Kraken]        │
│                                            │
└────────────────────────────────────────────┘
```

**Elements**:
- Logo at top, Electric Cyan accent
- Tagline in Geist Sans, white
- Exchange names/icons as visual indicator
- Subtle grid or data visualization motif in background (low opacity)

### Dynamic OG Images (Future)

Consider dynamic OG for shareable results:
```
┌────────────────────────────────────────────┐
│  TOKEN IMPACT                              │
│                                            │
│  Buying 10 BTC                             │
│                                            │
│  🏆 Binance: 0.05% impact                  │
│     Coinbase: 0.07% impact                 │
│     Kraken: 0.12% impact                   │
│                                            │
│  tokenimpact.com                           │
└────────────────────────────────────────────┘
```

Implementation: Use `@vercel/og` for dynamic generation.

### Twitter Card

| Property | Value |
|----------|-------|
| Card type | summary_large_image |
| Dimensions | 1200x600 px (or use same as OG) |

### Implementation

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  openGraph: {
    title: 'Token Impact',
    description: 'Compare crypto liquidity across exchanges',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Token Impact - Crypto Price Impact Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
};
```

## Web App Manifest

For PWA support and Android installation.

```json
{
  "name": "Token Impact",
  "short_name": "TokenImpact",
  "description": "Compare crypto liquidity across exchanges",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#09090b",
  "theme_color": "#22d3ee",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

## Asset File Structure

```
public/
├── favicon.ico
├── favicon.svg
├── apple-touch-icon.png
├── icon-192.png
├── icon-512.png
├── og-image.png
├── manifest.webmanifest
└── images/
    └── logo/
        ├── logo-full.svg
        ├── logo-compact.svg
        ├── logo-icon.svg
        └── logo-mono.svg
```

## Creation Checklist

### Phase 1: Core Assets (MVP)

- [ ] Design icon mark (stylized T or impact rings)
- [ ] Create `favicon.svg` (vector, scalable)
- [ ] Export `favicon.ico` (multi-size ICO)
- [ ] Export `apple-touch-icon.png` (180x180)
- [ ] Export PWA icons (192, 512)
- [ ] Create `og-image.png` (1200x630)
- [ ] Create `manifest.webmanifest`
- [ ] Create full wordmark logo SVG

### Phase 2: Extended Assets

- [ ] Logo variants (compact, monochrome)
- [ ] Exchange badge icons (for results)
- [ ] Loading/skeleton graphics
- [ ] Error state illustrations
- [ ] Dynamic OG image template

### Phase 3: Marketing Assets

- [ ] Social media profile images
- [ ] Banner images for directories
- [ ] Press kit / media assets

## Tools

Recommended for asset creation:
- **Vector**: Figma, Illustrator, or Inkscape
- **Favicon generation**: realfavicongenerator.net (after creating base SVG)
- **OG preview**: opengraph.xyz
- **Dynamic OG**: @vercel/og

## Quality Checklist

- [ ] All icons sharp at target sizes
- [ ] Favicon visible on both light and dark browser themes
- [ ] OG image text readable when scaled to thumbnail
- [ ] Apple touch icon has appropriate padding
- [ ] PWA icons pass maskable icon tests
- [ ] All assets < 300KB
- [ ] SVGs optimized (SVGO)

## Testing

| Test | How |
|------|-----|
| Favicon | Check browser tabs in Chrome, Firefox, Safari |
| Apple touch icon | Add to home screen on iOS |
| OG image | Share link on Twitter, Facebook, LinkedIn, Discord |
| PWA | Install on Android, check splash screen |
| Social preview | Use Facebook debugger, Twitter card validator |

## Verification Criteria

- [ ] Favicon displays correctly in all major browsers
- [ ] Apple touch icon shows on iOS home screen
- [ ] OG image renders correctly when shared on Twitter/Facebook/LinkedIn
- [ ] PWA is installable with correct icons and theme
- [ ] Logo SVGs load and display correctly in header
- [ ] All assets pass PageSpeed Insights (no oversized images)
