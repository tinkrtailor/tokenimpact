# Homepage Engagement Specification

First-visit experience enhancements to make the homepage more appealing before a comparison is made.

## Problem

Current initial state is sparse:
- Empty form controls
- Generic empty state text
- Ad slots (potentially empty)
- No value proposition visible

Users don't understand what the tool does or why they should use it.

## Solution

Three-tier engagement system:

1. **Educational Hero** - Value proposition above calculator
2. **Quick-Start Buttons** - One-click example comparisons
3. **Popular Pairs** - Clickable market highlights

## Layout

### Mobile (< 768px)

```
┌─────────────────────────┐
│ Token Impact            │
│ Compare price impact... │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Compare Before You  │ │  <- Hero section
│ │ Trade               │ │
│ │ • Large orders move │ │
│ │   prices            │ │
│ │ • Compare 3 exchanges│ │
│ └─────────────────────┘ │
├─────────────────────────┤
│ [Ad Banner]             │
├─────────────────────────┤
│ [Symbol ▼] [BUY|SELL]   │
│ [Quantity____] [Compare]│
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ What is Price Impact│ │  <- Empty state content
│ │ When you trade...   │ │
│ ├─────────────────────┤ │
│ │ Try a comparison:   │ │
│ │ [BTC] [ETH] [SOL]   │ │  <- Quick-start buttons
│ ├─────────────────────┤ │
│ │ Popular Pairs       │ │
│ │ ┌────┐ ┌────┐       │ │
│ │ │BTC │ │ETH │       │ │  <- Clickable pair chips
│ │ └────┘ └────┘       │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### Desktop (≥ 1024px)

```
┌──────────────────────────────────────────────────────────────┐
│ Token Impact                                                  │
│ Compare price impact across exchanges                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   Compare Price Impact Before You Trade                       │
│   Large orders move prices • Compare Binance, Coinbase,       │
│   Kraken instantly • Avoid slippage surprises                 │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│   [728x90 Ad Banner]                                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   [Symbol ▼]  [BUY|SELL]  [Quantity____]  [Compare]          │
│                                                               │
│   ┌────────────────────────────────────────────────────────┐ │
│   │                                                         │ │
│   │  What is Price Impact?                                  │ │
│   │  When you trade large amounts, your order consumes      │ │
│   │  liquidity and moves the price...                       │ │
│   │                                                         │ │
│   │  Try a quick comparison:                                │ │
│   │  [Try BTC]  [Try ETH]  [Try SOL]                        │ │
│   │                                                         │ │
│   │  Popular Pairs                                          │ │
│   │  [BTC-USDT] [ETH-USDT] [SOL-USDT] [XRP-USDT]            │ │
│   │                                                         │ │
│   └────────────────────────────────────────────────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Components

### HeroSection

Server component. Always visible above calculator.

**Content:**
- Headline: "Compare Price Impact Before You Trade"
- 2-3 bullet points (inline on desktop, stacked on mobile):
  - "Large orders move prices - see how much"
  - "Compare Binance, Coinbase, Kraken instantly"
  - "Avoid slippage surprises" (optional, desktop only)

**Styling:**
- Compact, not overwhelming
- `text-lg` headline, `text-sm` bullets
- `text-muted-foreground` for bullets
- `mb-6` spacing below

### QuickStartButtons

Client component. Appears in empty state.

**Behavior:**
- On click: sets URL params via nuqs (`?s=BTC-USDT&side=sell&qty=10`)
- Calculator auto-fetches when URL params change
- Shows loading state while fetching

**Buttons:**
| Label | Symbol | Quantity | Side |
|-------|--------|----------|------|
| Try BTC | BTC-USDT | 1 | sell |
| Try ETH | ETH-USDT | 10 | sell |
| Try SOL | SOL-USDT | 100 | sell |

**Styling:**
- `Button` variant="outline" size="sm"
- Horizontal flex, gap-2, centered
- Wrap on narrow screens

### PopularPairs

Client component. Appears in empty state below quick-start.

**Content:**
Static list (no API call):
- BTC-USDT (Bitcoin)
- ETH-USDT (Ethereum)
- SOL-USDT (Solana)
- XRP-USDT (Ripple)

**Behavior:**
- Click sets symbol only (user enters quantity)
- Does NOT trigger auto-compare

**Styling:**
- Horizontal scroll on mobile
- Grid on desktop (4 columns)
- Badge-style chips with exchange count indicator

### EmptyState

Client component. Replaces current inline empty state text.

**Sections:**
1. Educational blurb (what is price impact)
2. QuickStartButtons
3. PopularPairs

**Visibility:**
- Shown when: no results, not loading, no error
- Hidden when: results displayed or loading

## Interactions

| Action | Result |
|--------|--------|
| Click quick-start button | Set URL params, trigger comparison |
| Click popular pair | Set symbol only, focus quantity input |
| Page load with URL params | Auto-compare (existing behavior) |

## Analytics Events

Add to tracking:

| Event | Trigger | Properties |
|-------|---------|------------|
| `quick_start_clicked` | Quick-start button click | `symbol`, `quantity` |
| `popular_pair_clicked` | Popular pair click | `symbol` |

## Implementation

### Files to Create

| File | Type | Purpose |
|------|------|---------|
| `components/hero-section.tsx` | Server | Educational hero |
| `components/quick-start-buttons.tsx` | Client | Pre-filled compare buttons |
| `components/popular-pairs.tsx` | Client | Clickable pair grid |
| `components/empty-state.tsx` | Client | Composed empty state |

### Files to Modify

| File | Change |
|------|--------|
| `app/page.tsx` | Add HeroSection import/usage |
| `components/calculator.tsx` | Replace inline empty state with EmptyState component |
| `lib/analytics.ts` | Add new event types |

### Calculator Changes

Current empty state (lines ~551-559):
```tsx
<div className="py-12 text-center text-muted-foreground">
  Select a trading pair...
</div>
```

Replace with:
```tsx
<EmptyState />
```

Add URL change detection to trigger comparison when quick-start sets params.

## Verification

- [ ] Hero section visible on page load
- [ ] Quick-start buttons trigger real comparison
- [ ] Popular pairs set symbol and focus quantity
- [ ] Empty state hides after comparison
- [ ] Mobile layout stacks properly
- [ ] Desktop layout uses horizontal space
- [ ] Analytics events fire correctly
- [ ] No CLS (Cumulative Layout Shift) on load
- [ ] Works with existing URL sharing

## Dependencies

None. Uses existing:
- nuqs for URL state
- shadcn/ui components (Button, Badge)
- Tailwind CSS styling patterns
