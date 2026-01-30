# UI Specification

User interface for Token Impact.

## Design Principles

1. **Mobile-first**: Design for 375px, scale up to desktop
2. **Data-dense**: Show all relevant metrics without clutter
3. **Scannable**: Best option immediately obvious
4. **Fast**: Optimistic UI, skeleton loaders, no jank

## Layout

### Mobile (< 768px)

```
┌─────────────────────────┐
│ Token Impact      [menu]│  <- Header
├─────────────────────────┤
│ [Symbol Selector    ▼]  │  <- Full-width dropdown
│ [BUY] [SELL]            │  <- Toggle
│ [Quantity___________]   │  <- Input with base asset label
│ [Compare Prices]        │  <- Primary CTA
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 🏆 BINANCE          │ │  <- Best badge
│ │ Impact: 0.05%       │ │
│ │ Cost: $500,255      │ │
│ │ [Trade on Binance →]│ │  <- Affiliate CTA
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ COINBASE            │ │
│ │ Impact: 0.07%       │ │
│ │ Cost: $500,450      │ │
│ │ [Trade on Coinbase]│ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ KRAKEN              │ │
│ │ Unavailable         │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ [Ad Slot]               │  <- 320x100 banner
├─────────────────────────┤
│ Footer / Legal          │
└─────────────────────────┘
```

### Desktop (≥ 1024px)

```
┌──────────────────────────────────────────────────────────────┐
│ Token Impact                                     [About]     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ [Symbol ▼]  [BUY|SELL]  [Quantity____] [Compare]    │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐  │
│   │ Exchange │ Mid Price │ Avg Fill │ Impact │ Cost │    │  │
│   ├──────────┼───────────┼──────────┼────────┼──────┼────┤  │
│   │🏆Binance │ $50,000   │ $50,025  │ 0.05%  │$500k │ →  │  │
│   │ Coinbase │ $50,010   │ $50,045  │ 0.07%  │$500k │ →  │  │
│   │ Kraken   │    —      │    —     │   —    │  —   │    │  │
│   └──────────────────────────────────────────────────────┘  │
│                                                              │
│   [Ad Slot - 728x90 Leaderboard]                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Components

### Symbol Selector

- Searchable dropdown
- Shows exchange availability badges
- Recently used at top
- Common pairs (BTC, ETH) prioritized
- Keyboard navigable

### Side Toggle

- Two-button toggle: BUY / SELL
- BUY = cyan highlight
- SELL = magenta highlight
- Updates results immediately if quantity set

### Quantity Input

- Numeric input with thousand separators
- Base asset label suffix (e.g., "BTC")
- Quick buttons: 1, 10, 100, 1000 (contextual)
- Validation: positive numbers only

### Results Cards (Mobile)

- Stacked vertically
- Best option has "BEST" badge + subtle glow
- Unavailable exchanges grayed, collapsed
- Expand to show full metrics

### Results Table (Desktop)

- Sortable columns
- Best row highlighted
- Hover state shows affiliate CTA
- Unavailable rows grayed at bottom

### Affiliate CTA Button

- Prominent on best result
- Subdued on others
- Opens in new tab
- Tracks click events

### Loading States

- Skeleton loaders match final layout
- Individual exchange loading (don't wait for slowest)
- Stale indicator if data >5s old

### Error States

- Exchange-specific errors inline
- Full failure shows retry option
- Network error shows offline message

## Interactions

| Action | Result |
|--------|--------|
| Select symbol | Clear results, ready for input |
| Toggle side | Recalculate if quantity present |
| Enter quantity | Enable compare button |
| Click Compare | Fetch quotes, show loading |
| Click affiliate CTA | Open exchange (new tab), track click |

## Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| < 640px | Mobile: stacked cards |
| 640-1023px | Tablet: 2-column cards |
| ≥ 1024px | Desktop: table view |

## Accessibility

- Full keyboard navigation
- ARIA labels on interactive elements
- Color not sole indicator (icons + text)
- Focus visible states
- Screen reader friendly results

## Performance

- Initial load < 2s (LCP)
- Quote response < 1s perceived
- No layout shift after load
- Prefetch common symbol data
