# Learnings

Discoveries about the codebase that future iterations should know.

## Build System

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **Data Fetching**: Server Components + React Query
- **Validation**: Zod

## Codebase Patterns

- **Tailwind CSS v3**: Using v3 for shadcn/ui compatibility (v4 not yet supported)
- **shadcn/ui**: Initialized with dark theme, components in `components/ui/`
- **CSS Variables**: Brand colors defined in `app/globals.css` as HSL CSS variables
- **Font Loading**: Geist fonts loaded via `geist` package in layout.tsx

## Dependencies

- `@tanstack/react-query` - Client-side data fetching
- `zod` - Runtime validation schemas
- `nuqs` - URL state for shareable links
- `lucide-react` - Icons (included with shadcn)
- `vitest` - Unit testing framework (dev dependency)
- `@playwright/test` - E2E testing framework (dev dependency)
- `@axe-core/playwright` - Accessibility testing for Playwright (dev dependency)

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

- **Completed Tasks**: 48/48
- **Project Status**: ALL TASKS COMPLETE - Project ready for release
- **Final Tasks Completed**: api-005 (X-Request-Id), api-006 (data freshness), seo-005 (exchange comparisons)
- **Planning Session 1**: 2026-01-30 validated all 41 tasks against 8 spec files
- **Planning Session 2**: 2026-01-30 added 3 error handling tasks (error-001, error-002, error-003)
- **Planning Session 3**: 2026-01-30 validated all 44 tasks against 14 spec files, minor updates to ui-001, ui-007, legal-001
- **Planning Session 4**: 2026-01-30 re-validated with 8 parallel subagents, confirmed 0% implemented / 100% specified, no new tasks needed
- **Planning Session 5**: 2026-01-30 final validation with 8 parallel subagents, confirmed no changes needed, ready for implementation
- **Planning Session 6**: 2026-01-30 added brand-001 task for brand assets (logos, favicons, OG images, manifest) - was missing despite comprehensive spec in brand-assets.md
- **Planning Session 7**: 2026-01-30 final validation with 8 parallel subagents, confirmed 0% implemented / 100% specified, 45 tasks complete and ready for implementation
- **Planning Session 8**: 2026-01-31 validation with 8 parallel subagents, confirmed 0% implemented / 100% specified, no changes needed
- **Planning Session 9**: 2026-01-31 validated all tasks, investigated potential gaps (CSP, analytics events, URL state, privacy page), confirmed existing tasks cover all requirements
- **Planning Session 10**: 2026-01-31 final validation with 8 parallel subagents, confirmed 0% implemented / 100% specified, no changes needed
- **Planning Session 11**: 2026-01-31 post-implementation validation with 8 parallel subagents. All 45 original tasks completed. Added 3 new tasks: test-003 (E2E Playwright tests - Critical), api-005 (X-Request-Id header - Medium), api-006 (data freshness flag - Medium)
- **Planning Session 12**: 2026-01-31 validation with 8 parallel subagents. Confirmed 45/48 tasks complete, 3 pending (test-003, api-005, api-006). No new gaps found. Codebase quality excellent - only 1 TODO comment (affiliate ref codes placeholder).
- **Planning Session 13**: 2026-01-31 final validation with 8 parallel subagents. Confirmed 45/48 tasks complete, 3 pending unchanged. UI verified 100% complete. SEO verified 100% complete (30 token pages, 3 comparisons, 3 guides, all structured data). No new tasks needed.

## Planning Session Notes

### Session 13 (2026-01-31) - Final Validation

**Validation Method**: 8 parallel subagents analyzed each spec domain
- Source code inventory (comprehensive 50+ source files across app/, components/, lib/, public/)
- Validation spec vs implementation (E2E tests still missing)
- API spec vs implementation (X-Request-Id still missing)
- Core spec vs implementation (data freshness flag still missing)
- Exchanges spec vs implementation (Kraken queue implemented, Binance/Coinbase reactive only)
- UI spec vs implementation (100% complete - all 7 requirements verified)
- SEO spec vs implementation (100% complete - all structured data, llms.txt, 30 token pages, 3 comparisons, 3 guides)
- TODOs/placeholders search (only 1 found - affiliate ref codes placeholder)

**Findings**:
- **45 original tasks completed**: Full implementation verified
- **3 pending tasks confirmed**: test-003, api-005, api-006
- **No new gaps discovered**: All specs covered by existing tasks
- **Codebase quality excellent**: Single TODO comment for affiliate codes (acceptable for MVP)
- **UI 100% complete**: Mobile layout, desktop table, symbol selector, direction toggle, quantity input, skeletons, copy link all verified

**Minor Gaps (Deferred to Post-MVP, unchanged)**:
- Binance weight-based rate limiting (uses reactive retry instead)
- Coinbase request queuing (no 10/sec queue like Kraken has)
- Content-Type header implicit on /api/health (NextResponse.json sets it automatically)
- Affiliate referral codes are placeholders
- Tablet breakpoint (640-1023px) defaults to mobile layout

**Critical Path**: test-003 (E2E Playwright tests) must complete before release

### Session 12 (2026-01-31) - Validation Confirmation

**Validation Method**: 8 parallel subagents analyzed each spec domain
- Source code inventory (comprehensive 50+ source files)
- Validation spec vs implementation (E2E tests missing)
- API spec vs implementation (X-Request-Id missing, Content-Type partial)
- Core spec vs implementation (data freshness flag missing)
- Exchanges spec vs implementation (rate limiting differences documented)
- UI spec vs implementation (95% complete)
- Monetization/SEO specs vs implementation (complete except placeholder ref codes)
- TODOs/placeholders search (only 1 found - affiliate ref codes)

**Findings**:
- **45 original tasks completed**: Full implementation verified
- **3 pending tasks confirmed**: test-003, api-005, api-006
- **No new gaps discovered**: All specs covered by existing tasks
- **Codebase quality excellent**: Single TODO comment for affiliate codes (acceptable for MVP)

**Minor Gaps (Deferred to Post-MVP, unchanged from Session 11)**:
- Binance weight-based rate limiting (uses reactive retry instead)
- Coinbase request queuing (no 10/sec queue like Kraken has)
- Content-Type header missing on some error responses
- Affiliate referral codes are placeholders
- Tablet breakpoint (640-1023px) defaults to mobile layout

**Critical Path**: test-003 (E2E Playwright tests) must complete before release

### Session 11 (2026-01-31) - Post-Implementation Validation

**Validation Method**: 8 parallel subagents analyzed each spec domain against implemented code
- Source code inventory (comprehensive codebase exists)
- Core/symbols specs vs implementation
- Exchanges spec vs implementation
- API spec vs implementation
- UI spec vs implementation
- Monetization/SEO specs vs implementation
- NFR/errors/url-state/analytics/consent specs vs implementation
- Content/brand-assets/validation specs vs implementation

**Findings**:
- **All 45 original tasks completed**: Full implementation verified
- **Comprehensive codebase**: 50+ source files across app/, components/, lib/
- **Unit tests**: 85+ tests in calculations.test.ts and API route tests
- **API integration tests**: 60 tests covering /quote, /symbols, /health endpoints

**Gaps Discovered**:
1. **E2E Testing Suite (Critical)** - specs/validation.md requires Playwright tests for 10 test suites. No e2e/ directory or playwright.config.ts exists. Added task test-003.
2. **Data Freshness Flag (Medium)** - specs/core.md line 64 requires "stale data (>5s) should be flagged in response". Not implemented in /api/quote response. Added task api-006.
3. **X-Request-Id Header (Medium)** - specs/api.md requires unique request identifier header. Missing from middleware. Added task api-005.

**Minor Gaps (Deferred to Post-MVP)**:
- Binance weight-based rate limiting (uses reactive retry instead)
- Coinbase request queuing (no 10/sec queue like Kraken has)
- Volume caching (5-min cache spec vs fresh-per-request impl)
- Token landing pages count (24 vs 30 in spec)
- Affiliate referral codes (placeholder codes need replacement)

**New Tasks Added**:
- test-003: E2E Playwright testing suite (Priority 1)
- api-005: X-Request-Id header (Priority 3)
- api-006: Data freshness flag (Priority 2)

**Conclusion**: 45/48 tasks complete. 3 new tasks identified. Critical path: test-003 (E2E tests) before release.

### Session 10 (2026-01-31)

**Validation Method**: 8 parallel subagents analyzed each spec domain
- Source code inventory (confirmed 0 files)
- Core/symbols specs vs implementation
- Exchanges spec vs implementation
- API spec vs implementation
- UI spec vs implementation
- Monetization/SEO specs vs implementation
- NFR/errors/url-state/analytics/consent specs vs implementation
- Content/brand-assets/validation specs vs implementation

**Potential Gaps Investigated**:
1. CSP Headers (nfr.md) → Covered by deploy-001 (deployment config)
2. Analytics Events (analytics.md) → Covered by monitor-001 + component-level implementation
3. URL State Schema (url-state.md) → nuqs in setup-004, Copy Link in ui-007, schema is impl detail
4. Privacy Policy Page (consent.md) → legal-001 allows external link for MVP
5. Error Codes Enum (errors.md) → Part of core-004 validation schemas

**Conclusion**: All potential gaps are adequately covered by existing 45 tasks. No new tasks needed.

**Findings**:
- **Zero source files exist**: Confirmed no app/, components/, lib/, public/, package.json, tsconfig.json
- **All 45 tasks remain pending**: 0% implementation confirmed
- **100% spec coverage maintained**: All 14 specs have corresponding tasks
- **prd.json is valid**: 45 unique IDs, no missing deps, all tasks have ≥2 verification criteria
- **No blockers identified**: Ready to begin setup-001

**Ready for Implementation**:
- Start with: `setup-001` (Initialize Next.js 15 project with TypeScript)
- Critical path: setup → core → exchange → api → ui
- brand-001 can run in parallel after setup-003

### Session 9 (2026-01-31)

**Validation Method**: 8 parallel subagents analyzed each spec domain
- Source code inventory (confirmed 0 files)
- Core/symbols specs vs implementation
- Exchanges spec vs implementation
- API spec vs implementation
- UI spec vs implementation
- Monetization/SEO specs vs implementation
- NFR/errors/url-state/analytics/consent specs vs implementation
- Content/brand-assets/validation specs vs implementation

**Findings**:
- **Zero source files exist**: Confirmed no app/, components/, lib/, public/, package.json, tsconfig.json
- **All 45 tasks remain pending**: 0% implementation confirmed
- **100% spec coverage maintained**: All 14 specs have corresponding tasks
- **prd.json is valid**: 45 unique IDs, no missing deps, all tasks have ≥2 verification criteria
- **No blockers identified**: Ready to begin setup-001
- **Validation spec note**: specs/validation.md defines E2E Playwright tests as "final gate" - no separate task needed; test-001 and test-002 cover unit/integration testing

**Ready for Implementation**:
- Start with: `setup-001` (Initialize Next.js 15 project with TypeScript)
- Critical path: setup → core → exchange → api → ui
- brand-001 can run in parallel after setup-003

### Session 8 (2026-01-31)

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
- **Zero source files exist**: Confirmed no app/, components/, lib/, public/, package.json, tsconfig.json
- **All 45 tasks remain pending**: 0% implementation confirmed
- **100% spec coverage maintained**: All 14 specs have corresponding tasks
- **prd.json is valid and accurate**: No updates needed
- **No blockers identified**: Ready to begin setup-001

**Ready for Implementation**:
- Start with: `setup-001` (Initialize Next.js 15 project with TypeScript)
- Critical path: setup → core → exchange → api → ui
- brand-001 can run in parallel after setup-003

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
npm run test         # Run unit tests (vitest)
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run E2E tests (playwright)
npm run test:e2e:ui  # Run E2E tests with UI
```

## E2E Testing

- **Framework**: Playwright with Chromium
- **Config**: playwright.config.ts (desktop + mobile projects)
- **Test Directory**: e2e/
- **Test Suites**: 10 suites covering app loads, symbol selector, quote form, quote results, error handling, URL state, mobile responsiveness, static pages, accessibility, and smoke test
- **Smoke Test**: `npx playwright test e2e/smoke.spec.ts` for quick validation
- **Note**: Analytics & Consent suite skipped (MVP doesn't need consent banner per specs/consent.md)
