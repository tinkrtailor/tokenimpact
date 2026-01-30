# Agent Instructions

How to build, run, and test Token Impact.

## Prerequisites

- Node.js 18+
- npm
- Docker (for sandboxed Ralph loops)

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Starts dev server at http://localhost:3000

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Full Validation

Run before committing:

```bash
npm run lint && npm run build
```

## Project Structure

```
app/              # Next.js App Router pages and API routes
├── api/          # API endpoints (/symbols, /quote, /health)
├── page.tsx      # Homepage with calculator
components/       # React components (shadcn/ui based)
lib/
├── exchanges/    # Binance, Coinbase, Kraken integrations
├── calculations/ # Price impact math
├── symbols/      # Symbol normalization
specs/            # Functional specifications
.ralph/           # Ralph's persistent memory
```

## Environment Variables

None required for MVP (all exchange APIs are public).

## Notes

*Add learnings about build/run process here as you discover them.*
