# Learnings

Discoveries about the codebase that future iterations should know.

## Build System

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Data Fetching**: Server Components + React Query
- **Validation**: Zod

## Codebase Patterns

(To be populated as implementation progresses)

## Dependencies

- `@tanstack/react-query` - Client-side data fetching
- `zod` - Runtime validation schemas
- `nuqs` - URL state for shareable links
- `lucide-react` - Icons (included with shadcn)

## Exchange APIs

### Binance
- **Orderbook**: `GET /api/v3/depth?symbol={symbol}&limit=500`
- **Volume**: `GET /api/v3/ticker/24hr?symbol={symbol}`
- **Rate Limit**: 1200 req/min (weight-based)
- **No authentication** required for public data

### Coinbase
- **Orderbook**: `GET /products/{symbol}/book?level=2`
- **Volume**: `GET /products/{symbol}/stats`
- **Rate Limit**: 10 req/sec
- **Level 2** provides top 50 bids/asks

### Kraken
- **Orderbook**: `GET /0/public/Depth?pair={symbol}&count=500`
- **Volume**: `GET /0/public/Ticker?pair={symbol}`
- **Rate Limit**: 1 req/sec (slowest - requires queuing)
- **Symbol quirks**: XBT = BTC, X-prefix (XXBT), Z-prefix (ZUSD)

## Symbol Normalization

- **Normalized format**: `{BASE}-{QUOTE}` (e.g., `BTC-USD`)
- **Binance**: `BTCUSDT` → `BTC-USDT`
- **Coinbase**: `BTC-USD` → `BTC-USD` (passthrough)
- **Kraken**: `XXBTZUSD` → `BTC-USD` (handle X/Z prefixes, XBT→BTC)

## Brand Colors (from nfr.md)

- **Background**: Void Black `#09090b`
- **Surface**: Charcoal `#18181b`
- **Text Primary**: White `#fafafa`
- **Accent (BUY)**: Electric Cyan `#22d3ee`
- **Accent (SELL)**: Magenta `#e879f9`
- **Success (BEST)**: Emerald `#34d399`

## Typography

- **Display/Body**: Geist Sans
- **Numbers**: Geist Mono (monospace for alignment)

## API Design

### Rate Limits (per IP)
- `/symbols`: 60 req/min
- `/quote`: 30 req/min
- `/health`: 10 req/min

### Caching Strategy
- **Symbol catalog**: 1 hour
- **24h volume**: 5 minutes
- **Orderbook**: No cache (must be fresh)

## Implementation Status

- **Completed Tasks**: None yet
- **Project Status**: Specifications complete, implementation pending
- **Next Step**: Initialize Next.js project (setup-001)

## Gotchas

(To be populated as issues are discovered)

## Commands That Work

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
```
