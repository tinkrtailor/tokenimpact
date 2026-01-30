# Token Impact

## Project Overview

Crypto liquidity calculator - compare price impact across exchanges (Binance, Coinbase, Kraken).

## Structure

- `app/` - Next.js App Router pages and API routes
- `components/` - React components (shadcn/ui based)
- `lib/` - Utilities, exchange integrations, calculations

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Validation**: Zod
- **Data Fetching**: React Query + Server Components

## Development

```bash
npm install
npm run dev        # Start dev server (port 3000)
npm run build      # Production build
npm run lint       # ESLint
```

## Conventions

- Server Components by default, "use client" only when needed
- Mobile-first responsive design
- API routes under `/api/*`
- Exchange integrations in `lib/exchanges/`
- Affiliate links and ad slots in designated components

## Key Files

- `PRODUCT.md` - Full product spec, wireframes, API design
- `app/api/quote/route.ts` - Main liquidity calculation endpoint
- `lib/exchanges/` - Binance, Coinbase, Kraken integrations
