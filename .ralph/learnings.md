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

- **Completed Tasks**: 0/45
- **Project Status**: Specifications complete, implementation pending
- **Next Step**: Initialize Next.js project (setup-001)
- **Planning Session 1**: 2026-01-30 validated all 41 tasks against 8 spec files
- **Planning Session 2**: 2026-01-30 added 3 error handling tasks (error-001, error-002, error-003)
- **Planning Session 3**: 2026-01-30 validated all 44 tasks against 14 spec files, minor updates to ui-001, ui-007, legal-001
- **Planning Session 4**: 2026-01-30 re-validated with 8 parallel subagents, confirmed 0% implemented / 100% specified, no new tasks needed
- **Planning Session 5**: 2026-01-30 final validation with 8 parallel subagents, confirmed no changes needed, ready for implementation
- **Planning Session 6**: 2026-01-30 added brand-001 task for brand assets (logos, favicons, OG images, manifest) - was missing despite comprehensive spec in brand-assets.md
- **Planning Session 7**: 2026-01-30 final validation with 8 parallel subagents, confirmed 0% implemented / 100% specified, 45 tasks complete and ready for implementation

## Planning Session Notes

### Session 7 (2026-01-30)

**Validation Method**: 8 parallel subagents analyzed each spec domain
- Source code inventory (confirmed 0 files)
- Core/symbols specs vs implementation
- Exchanges spec vs implementation
- API spec vs implementation
- UI spec vs implementation
- Monetization/SEO specs vs implementation
- NFR/errors/url-state/analytics/consent specs vs implementation
- Content/brand-assets specs vs implementation

**Findings**:
- **Zero source files exist**: Confirmed no app/, components/, lib/, package.json, tsconfig.json
- **All 45 tasks remain pending**: 0% implementation confirmed
- **100% spec coverage maintained**: All 14 specs have corresponding tasks
- **prd.json is valid and accurate**: No updates needed
- **No blockers identified**: Ready to begin setup-001

**Ready for Implementation**:
- Start with: `setup-001` (Initialize Next.js 15 project with TypeScript)
- Critical path: setup → core → exchange → api → ui
- brand-001 can run in parallel after setup-003

### Session 6 (2026-01-30)

**Validation Method**: 8 parallel subagents analyzed each spec domain
- Source code inventory
- Core/symbols specs vs implementation
- Exchanges spec vs implementation
- API spec vs implementation
- UI spec vs implementation
- Monetization/SEO specs vs implementation
- NFR/errors/url-state/analytics/consent specs vs implementation
- Content/brand-assets specs vs implementation

**Findings**:
- **Zero source files exist**: Confirmed no app/, components/, lib/, package.json, tsconfig.json
- **Gap discovered**: specs/brand-assets.md (283 lines) had no corresponding task in prd.json
- **New task added**: brand-001 (Create brand assets: logos, favicons, OG images, manifest)
- **45 tasks total**: 0% implemented, 100% specified

**Ready for Implementation**:
- Start with: `setup-001` (Initialize Next.js 15 project with TypeScript)
- Critical path: setup → core → exchange → api → ui
- brand-001 can run in parallel after setup-003

### Session 5 (2026-01-30)

**Validation Method**: 8 parallel subagents analyzed each spec domain
- Source code inventory (confirmed 0 files)
- Core/calculations spec vs implementation
- Exchanges spec vs implementation
- API spec vs implementation
- UI spec vs implementation
- Symbols spec vs implementation
- Monetization/SEO specs vs implementation
- NFR/errors/url-state/analytics/consent specs vs implementation

**Findings**:
- **Zero source files exist**: Confirmed no app/, components/, lib/, package.json, tsconfig.json
- **All 44 tasks remain pending**: 0% implementation confirmed
- **100% spec coverage maintained**: All 14 specs have corresponding tasks
- **prd.json is valid and accurate**: No updates needed
- **No blockers identified**: Ready to begin setup-001

**Ready for Implementation**:
- Start with: `setup-001` (Initialize Next.js 15 project with TypeScript)
- Critical path validated: setup → core → exchange → api → ui

### Session 4 (2026-01-30)

**Validation Method**: 8 parallel subagents analyzed each spec domain
- Source code inventory
- Core/calculations spec vs implementation
- Exchanges spec vs implementation
- API spec vs implementation
- UI spec vs implementation
- Symbols spec vs implementation
- Monetization/SEO specs vs implementation
- NFR/errors/url-state/analytics specs vs implementation

**Findings**:
- **Zero source files exist**: No app/, components/, lib/, package.json, tsconfig.json
- **All 44 tasks remain pending**: 0% implementation confirmed
- **100% spec coverage maintained**: All 14 specs have corresponding tasks
- **No new gaps identified**: prd.json is complete and accurate
- **Post-MVP decisions documented**: /exchanges page intentionally deferred

**Ready for Implementation**:
- Critical path: setup-001 → setup-002/003/004 → core-001/002/003 → exchange-* → api-* → ui-*
- No blockers identified

### Session 3 (2026-01-30)

**Validation Method**: 8 parallel subagents analyzed spec vs implementation gaps

**Findings**:
- All 14 spec files reviewed against 44 tasks
- 100% spec coverage confirmed
- Minor gaps found and resolved:
  - `specs/url-state.md` Copy Link feature → added to ui-007 verification
  - `specs/url-state.md` Dynamic OG tags → added to ui-001 description/verification
  - `specs/consent.md` MVP approach (no consent banner) → clarified legal-001 description

**Key Clarification - Cookie Consent**:
- MVP does NOT need cookie consent banner per specs/consent.md
- Reason: Vercel Analytics is cookie-less, affiliate tracking is server-side redirect
- legal-001 updated to reflect this decision

### Session 2 (2026-01-30)

- Added 3 error handling tasks (error-001, error-002, error-003) from specs/errors.md

### Session 1 (2026-01-30)

**Verification Results**:
- **Source code files**: 0 (no app/, components/, lib/ directories exist)
- **Configuration files**: 0 (no package.json, tsconfig.json, tailwind.config.ts)
- **TODOs/placeholders**: 0 (codebase is spec-only)
- **Task coverage**: 100% of specs covered by 44 tasks

**Critical Path**:
1. **Setup phase** (setup-001 to setup-004): Initialize Next.js, Tailwind, shadcn, dependencies
2. **Core types** (core-002): Type definitions required before exchange clients
3. **Symbol mapping** (core-003): Normalization functions required before API
4. **Calculation engine** (core-001): Price impact algorithm
5. **Exchange clients** (exchange-001 to 004): Can parallelize after core types
6. **API routes** (api-001 to 004): Require exchange aggregator
7. **UI components** (ui-001 to 008): Can start after setup-002

**Gaps Identified & Resolved**:
- `/exchanges` content page mentioned in specs/seo.md (line 116) has no dedicated task
  - Decision: Not critical for MVP, can be added post-launch if needed
- `specs/errors.md` defines comprehensive error UI patterns but had no implementation tasks
  - Resolution: Added error-001 (inline validation), error-002 (toasts), error-003 (full-page/offline)

## Gotchas

(To be populated as issues are discovered)

## Commands That Work

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
```
