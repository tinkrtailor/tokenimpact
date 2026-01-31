# Agent Instructions

How to build, run, and test Token Impact.

## Prerequisites

- Bun (latest)
- Docker (for sandboxed Ralph loops)

## Setup

```bash
bun install
```

## Development

```bash
bun run dev
```

Starts dev server at http://localhost:3000

## Build

```bash
bun run build
```

## Lint

```bash
bun run lint
```

## Full Validation

Run before committing:

```bash
bun run lint && bun run build
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
