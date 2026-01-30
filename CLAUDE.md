# Token Impact

Crypto liquidity calculator - compare price impact across exchanges.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Deployment:** Vercel (MVP) / VPS (later)

## Key Files

| File | Purpose |
|------|---------|
| `PRODUCT.md` | Full product spec, wireframes, API design |
| `app/` | Next.js app router pages and API routes |
| `components/` | React components (shadcn/ui based) |
| `lib/exchanges/` | Exchange API integrations |

## Development Workflow

### Before Making Changes

1. Run `npm run dev` to verify current state
2. Read `PRODUCT.md` for context

### After Making Changes

1. Run `npm run lint`
2. Run `npm run build` (catches type errors)
3. Test on mobile viewport
4. Commit with conventional commit format

## Quick Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier (if configured)
```

## Rules

**Attribution**: Never add Co-Authored-By lines to commits. Never mention Claude's involvement in PRs or commit messages.

**Mobile-first**: Always develop mobile layout first, then expand to desktop.

**Monetization**: Keep affiliate CTAs and ad slots visible but not intrusive.
