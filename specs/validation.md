# Validation Specification

End-to-end testing with Playwright. Final gate before declaring work complete.

## Purpose

Verify all implemented functionality works correctly in a real browser. Run this validation suite as the last step before marking any task complete.

## When to Run

- After implementing any feature
- After fixing any bug
- Before marking a task "completed" in prd.json
- Before outputting `<promise>COMPLETE</promise>`

## Test Environment

| Setting | Value |
|---------|-------|
| Browser | Chromium (headless in CI) |
| Base URL | `http://localhost:3000` |
| Timeout | 30s per test |
| Retries | 2 (flaky network) |

## Test Suites

### 1. App Loads

**Priority: Critical**

| Test | Verification |
|------|--------------|
| Homepage loads | Page title contains "Token Impact" |
| No console errors | Zero `error` level console messages |
| No hydration mismatch | No React hydration warnings |
| LCP < 3s | Largest contentful paint under 3 seconds |

### 2. Symbol Selector

**Priority: Critical**

| Test | Verification |
|------|--------------|
| Dropdown opens | Click selector, options visible |
| Search filters | Type "BTC", only BTC pairs shown |
| Selection works | Click option, selector shows selected value |
| Keyboard nav | Arrow keys + Enter selects option |

### 3. Quote Form

**Priority: Critical**

| Test | Verification |
|------|--------------|
| Side toggle | Click BUY/SELL, toggle state changes |
| Quantity input | Type "10", value displays correctly |
| Input validation | Non-numeric rejected, negative rejected |
| Submit enabled | Button enabled when symbol + quantity set |

### 4. Quote Results

**Priority: Critical**

| Test | Verification |
|------|--------------|
| Results display | Submit form, results appear |
| Loading state | Skeleton shown during fetch |
| Multiple exchanges | At least 2 exchange results shown |
| Best badge | One result marked as "BEST" |
| Price data | Mid price, avg fill, impact % visible |
| Affiliate CTA | "Trade on X" button visible |

### 5. Error Handling

**Priority: High**

| Test | Verification |
|------|--------------|
| Invalid symbol | Error message displayed, not crash |
| Network failure | Retry option shown |
| Partial failure | Working exchanges shown, failed grayed |

### 6. URL State

**Priority: High**

| Test | Verification |
|------|--------------|
| State in URL | After quote, URL contains params |
| URL restore | Navigate to URL with params, form populated |
| Share works | Copy URL, new tab loads same state |

### 7. Mobile Responsiveness

**Priority: High**

| Test | Verification |
|------|--------------|
| 375px renders | No horizontal scroll, all content visible |
| Cards stack | Results in vertical card layout |
| Touch targets | Buttons >= 44px tap target |

### 8. Static Pages

**Priority: Medium**

| Test | Verification |
|------|--------------|
| /about loads | Content renders, no errors |
| /methodology loads | Content renders, no errors |
| /faq loads | Content renders, no errors |
| /privacy loads | Content renders, no errors |
| Footer links work | All footer links navigate correctly |

### 9. Analytics & Consent

**Priority: Medium**

| Test | Verification |
|------|--------------|
| Consent banner | Shows on first visit |
| Accept works | Banner dismisses, preference saved |
| Decline works | Banner dismisses, no tracking |

### 10. Accessibility

**Priority: Medium**

| Test | Verification |
|------|--------------|
| Keyboard only | Complete flow with Tab + Enter |
| Focus visible | Focus ring on all interactive elements |
| Axe audit | Zero critical/serious violations |

## Test Data

Use these fixtures for consistent testing:

```typescript
const TEST_CASES = {
  validQuote: {
    symbol: "BTC-USD",
    side: "BUY",
    quantity: "10",
  },
  smallQuote: {
    symbol: "ETH-USD",
    side: "SELL",
    quantity: "1",
  },
  invalidSymbol: {
    symbol: "INVALID-XXX",
    side: "BUY",
    quantity: "1",
  },
};
```

## Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

## Running Validation

```bash
# Full suite
npx playwright test

# Specific suite
npx playwright test e2e/quote.spec.ts

# With UI (debugging)
npx playwright test --ui

# Mobile only
npx playwright test --project=mobile
```

## Pass/Fail Criteria

| Level | Requirement |
|-------|-------------|
| **PASS** | All Critical + High tests pass |
| **WARN** | All Critical pass, some High/Medium fail |
| **FAIL** | Any Critical test fails |

## Integration with Ralph Loop

Add to prompt validation section:

```markdown
# Validation
5. Run: npm run lint && npm run build
6. Run: npx playwright test
7. Do NOT mark task complete if validation fails
```

## Smoke Test (Quick)

For rapid iteration, run minimal smoke test:

```bash
npx playwright test e2e/smoke.spec.ts
```

Smoke test covers only:
1. App loads without error
2. Can submit a quote
3. Results display

## CI Integration

```yaml
# .github/workflows/e2e.yml
- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: npx playwright test

- name: Upload report
  uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: playwright-report
    path: playwright-report/
```

## Debugging Failures

1. **Check screenshot**: `playwright-report/` contains failure screenshots
2. **Check trace**: Run `npx playwright show-trace trace.zip`
3. **Run headed**: `npx playwright test --headed`
4. **Add pause**: Insert `await page.pause()` to debug interactively
