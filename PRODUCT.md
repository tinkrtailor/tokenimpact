# Token Impact

**Tagline:** Find the best liquidity for your crypto trades across exchanges.

## Problem Statement

Token holders looking to exit or reduce positions face a critical question: *where can I get the best execution for my trade size?*

Large orders suffer price impact—the bigger the order relative to available liquidity, the worse the average fill price. This impact varies dramatically across exchanges. A $500K sell order might move the price 0.5% on Binance but 3% on a smaller venue.

**Token Impact** answers this in seconds: enter your trade, see the real cost across exchanges, pick the best venue.

## Target Users

- Crypto holders with significant positions ($10K+)
- Traders comparing execution quality
- Projects/DAOs planning treasury operations
- Analysts researching market depth

## MVP Features

### Core Functionality

| Feature | Description |
|---------|-------------|
| **Pair Selection** | Search/select from all available pairs (normalized naming across exchanges) |
| **Direction Toggle** | BUY or SELL |
| **Quantity Input** | Enter amount in base currency |
| **Liquidity Comparison** | 3-column table: Binance, Coinbase, Kraken |

### Output Metrics (per exchange)

| Metric | Description |
|--------|-------------|
| **Average Fill Price** | Weighted average price to fill the entire order |
| **Trade Value** | Total quote currency required/received |
| **Price Impact** | % difference from mid-price; absolute value |
| **% of 24h Volume** | Order size as percentage of daily volume |
| **Best Bid/Ask** | Current top-of-book for reference |

### Monetization Touchpoints

| Placement | Type |
|-----------|------|
| **Below results table** | Affiliate CTAs: "Execute on Binance →" |
| **Sidebar (desktop)** | Display ad unit |
| **Footer (mobile)** | Display ad unit |
| **Interstitial** | Optional: show after N calculations |

## Tech Stack

```
┌─────────────────────────────────────────────────────┐
│                   NEXT.JS APP                       │
│              TypeScript + React                     │
│         Mobile-first responsive design              │
├─────────────────────────────────────────────────────┤
│                   API ROUTES                        │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐   │
│  │ Binance API │ │ Coinbase API│ │  Kraken API  │   │
│  └─────────────┘ └─────────────┘ └──────────────┘   │
│         Exchange abstraction layer                  │
│         Rate limiting / caching                     │
└─────────────────────────────────────────────────────┘
```

### Next.js App

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Data Fetching:** Server Components + React Query
- **Validation:** Zod

### Key Libraries

- `shadcn/ui` - Component library (Button, Select, Input, Card, Tabs, etc.)
- `@tanstack/react-query` - Client-side data fetching
- `nuqs` - URL state (shareable links)
- `lucide-react` - Icons (included with shadcn)
- `recharts` - Charts (future: depth visualization, shadcn has built-in support)

### Infrastructure

**Option A: Vercel (Recommended for MVP)**
- Zero-config deployment
- Edge caching built-in
- Free tier sufficient for launch

**Option B: VPS (Later)**
- Docker + Nginx
- Let's Encrypt SSL
- More control, lower cost at scale

### shadcn/ui Components Used

| Component | Usage |
|-----------|-------|
| `Button` | CTAs, submit |
| `Card` | Exchange result cards |
| `Input` | Quantity input |
| `Select` / `Combobox` | Pair selector with search |
| `Tabs` | Mobile exchange switcher |
| `Toggle Group` | BUY/SELL direction |
| `Skeleton` | Loading states |
| `Badge` | "Best price" indicator |

## API Design

### Endpoints

```
GET /api/symbols
  → List all normalized trading pairs

GET /api/quote?pair=BTC-USDT&side=sell&quantity=10
  → Returns liquidity analysis for all exchanges
```

### Response Schema

```json
{
  "pair": "BTC-USDT",
  "side": "sell",
  "quantity": 10,
  "timestamp": "2025-01-30T12:00:00Z",
  "exchanges": {
    "binance": {
      "available": true,
      "avgPrice": 42150.25,
      "tradeValue": 421502.50,
      "priceImpact": {
        "percent": -0.12,
        "absolute": -50.58
      },
      "midPrice": 42200.83,
      "bestBid": 42200.00,
      "bestAsk": 42201.65,
      "volume24h": 125000,
      "pctOfVolume": 0.008,
      "affiliateUrl": "https://binance.com/..."
    },
    "coinbase": { ... },
    "kraken": { ... }
  }
}
```

## Symbol Normalization

Exchanges use different naming conventions:

| Asset | Binance | Coinbase | Kraken | Normalized |
|-------|---------|----------|--------|------------|
| Bitcoin | BTC | BTC | XBT | BTC |
| Ethereum | ETH | ETH | ETH | ETH |
| Tether | USDT | USDT | USDT | USDT |
| USD Coin | USDC | USDC | USDC | USDC |

`lib/symbols.ts` maintains the mapping. API routes translate on the fly.

## Mobile-First Design

### Mobile Layout (< 768px)

```
┌─────────────────────────┐
│  🔍 BTC-USDT        ▼   │  ← Pair selector
├─────────────────────────┤
│  [SELL]  [BUY]          │  ← Toggle
├─────────────────────────┤
│  Quantity: [    10    ] │  ← Input
├─────────────────────────┤
│  [ Calculate Impact ]   │  ← CTA button
├─────────────────────────┤
│                         │
│  ┌───┐ ┌───┐ ┌───┐      │  ← Exchange tabs
│  │ B │ │ C │ │ K │      │
│  └───┘ └───┘ └───┘      │
│                         │
│  Avg Price    $42,150   │  ← Results card
│  Trade Value  $421,500  │     (swipeable)
│  Impact       -0.12%    │
│  % Volume     0.008%    │
│                         │
│  [Trade on Binance →]   │  ← Affiliate CTA
│                         │
├─────────────────────────┤
│  [ Ad Unit ]            │  ← Footer ad
└─────────────────────────┘
```

### Desktop Layout (≥ 1024px)

```
┌────────────────────────────────────────────────────────────────┐
│  TOKEN IMPACT                                    [About] [FAQ] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Pair: [BTC-USDT ▼]   Direction: [SELL|BUY]   Qty: [10]  [GO] │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                   │            │
│   BINANCE         COINBASE        KRAKEN          │   [ AD ]   │
│  ──────────────────────────────────────────────── │            │
│   Avg Price       Avg Price       Avg Price       │            │
│   $42,150         $42,180         $42,165         │            │
│                                                   │            │
│   Trade Value     Trade Value     Trade Value     │            │
│   $421,500        $421,800        $421,650        │            │
│                                                   │            │
│   Impact          Impact          Impact          │            │
│   -0.12%          -0.18%          -0.15%          │            │
│   (-$506)         (-$759)         (-$633)         │            │
│                                                   │            │
│   % 24h Vol       % 24h Vol       % 24h Vol       │            │
│   0.008%          0.012%          0.021%          │            │
│                                                   │            │
│   [Trade →]       [Trade →]       [Trade →]       │            │
│                                                   │            │
├────────────────────────────────────────────────────────────────┤
│  © Token Impact        [Affiliate Disclosure]     [Privacy]    │
└────────────────────────────────────────────────────────────────┘
```

## Rate Limiting Strategy

Exchanges impose rate limits. Strategy:

1. **On-demand fetching** - Only fetch when user requests a quote
2. **Parallel requests** - Hit all 3 exchanges simultaneously
3. **Short-term cache** - Cache orderbook for 5-10 seconds (same pair)
4. **Graceful degradation** - If one exchange fails, show others with error state

## Affiliate Program Links

| Exchange | Program | Commission |
|----------|---------|------------|
| Binance | [binance.com/en/activity/affiliate](https://binance.com/en/activity/affiliate) | Up to 50% |
| Coinbase | [coinbase.com/affiliates](https://coinbase.com/affiliates) | Varies |
| Kraken | [kraken.com/referrals](https://kraken.com/referrals) | 20% fees |

## Future Roadmap

### Phase 2: More Exchanges
- OKX, Bybit, KuCoin, Gate.io
- DEX aggregators (1inch, Jupiter)

### Phase 3: Enhanced Features
- Historical liquidity charts
- Alerts: "Notify me when BTC depth > X on Binance"
- TWAP/VWAP execution suggestions
- Multi-leg analysis (split across exchanges)

### Phase 4: Premium
- API access for traders/bots
- White-label for institutions
- Real-time WebSocket updates

## Success Metrics

| Metric | Target (Month 1) |
|--------|------------------|
| Daily unique visitors | 500 |
| Calculations/day | 2,000 |
| Affiliate click-through | 5% |
| Affiliate conversions | 1% of clicks |

## MVP Deliverables

- [ ] Next.js project setup (App Router, TypeScript, Tailwind, shadcn/ui)
- [ ] Exchange API integration (Binance, Coinbase, Kraken)
- [ ] Symbol normalization mapping
- [ ] Orderbook depth calculation logic
- [ ] Mobile-first UI with responsive design
- [ ] Affiliate link integration (CTAs per exchange)
- [ ] Ad placement slots (Google AdSense ready)
- [ ] Vercel deployment
- [ ] Basic analytics (Vercel Analytics or Plausible)
- [ ] SEO basics (meta tags, OpenGraph for sharing)

## Project Structure

```
tokenimpact/
├── app/
│   ├── layout.tsx          # Root layout, fonts, analytics
│   ├── page.tsx            # Main calculator page
│   └── api/
│       ├── symbols/route.ts    # GET /api/symbols
│       └── quote/route.ts      # GET /api/quote
├── components/
│   ├── ui/                     # shadcn/ui components (auto-generated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── pair-selector.tsx       # Combobox for pair search
│   ├── direction-toggle.tsx    # BUY/SELL toggle
│   ├── quantity-input.tsx      # Amount input
│   ├── results-table.tsx       # Desktop: 3-column comparison
│   ├── exchange-card.tsx       # Mobile: swipeable cards
│   └── ad-slot.tsx             # Ad placement wrapper
├── lib/
│   ├── exchanges/
│   │   ├── types.ts            # Common interfaces
│   │   ├── binance.ts
│   │   ├── coinbase.ts
│   │   ├── kraken.ts
│   │   └── index.ts            # Aggregator
│   ├── symbols.ts              # Normalization mapping
│   └── calculations.ts         # Price impact math
├── public/
│   └── logos/                  # Exchange logos
├── tailwind.config.ts
├── next.config.js
└── package.json
```

---

*Document version: 0.2 | Last updated: 2025-01-30*
