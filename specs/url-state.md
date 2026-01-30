# URL State Specification

Shareable links and URL state management for Token Impact.

## Purpose

Enable users to share specific calculations via URL. Copy link → send to friend → they see exact same results.

## Library

Use `nuqs` for type-safe URL state management with Next.js App Router.

## URL Parameters

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `s` | string | - | Symbol (e.g., `BTC-USD`) |
| `side` | `buy` \| `sell` | `buy` | Trade direction |
| `qty` | string | - | Quantity (base asset) |

### Example URLs

```
/                                    # Empty calculator
/?s=BTC-USD                          # Symbol only
/?s=BTC-USD&side=sell&qty=10         # Full calculation
/?s=ETH-USDT&qty=100                 # Buy (default) 100 ETH
```

## Behavior

### On Page Load

1. Parse URL params with `nuqs`
2. Validate symbol exists in catalog
3. Validate quantity is positive number
4. If valid: populate form, auto-fetch quote
5. If invalid: show empty form, no error (silent fallback)

### On User Input

1. Update URL params as user changes inputs
2. Use `replace` (not `push`) to avoid polluting history
3. Debounce URL updates (300ms) to avoid spam
4. Clear `qty` param if user clears input

### On Results

Results are NOT stored in URL because:
- They're time-sensitive (stale quickly)
- They're large (3 exchanges × multiple fields)
- Fresh fetch on share is better UX

## Schema (nuqs)

```typescript
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';

const urlStateSchema = {
  s: parseAsString,
  side: parseAsStringLiteral(['buy', 'sell'] as const).withDefault('buy'),
  qty: parseAsString,
};

// Usage
const [params, setParams] = useQueryStates(urlStateSchema);
```

## Validation

| Param | Validation | On Invalid |
|-------|------------|------------|
| `s` | Must exist in symbol catalog | Ignore, show empty selector |
| `side` | Must be `buy` or `sell` | Default to `buy` |
| `qty` | Must be positive number string | Ignore, show empty input |

## Copy Link Feature

### UI

- "Copy Link" button appears after successful calculation
- Located near results (mobile: above cards, desktop: toolbar)
- Copies current URL to clipboard
- Shows "Copied!" toast on success

### Implementation

```typescript
const copyLink = async () => {
  await navigator.clipboard.writeText(window.location.href);
  toast.success('Link copied');
};
```

## Social Sharing

### Open Graph Tags (Dynamic)

When URL has valid params, generate OG tags:

```html
<meta property="og:title" content="BTC-USD Price Impact | Token Impact" />
<meta property="og:description" content="Sell 10 BTC: Best price on Binance (0.05% impact)" />
<meta property="og:url" content="https://tokenimpact.com/?s=BTC-USD&side=sell&qty=10" />
```

### Twitter Card

```html
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="BTC-USD Price Impact | Token Impact" />
<meta name="twitter:description" content="Compare exchange liquidity for your trade" />
```

## Edge Cases

| Case | Behavior |
|------|----------|
| Unknown symbol in URL | Ignore, show empty selector |
| Negative quantity | Ignore, show empty input |
| Non-numeric quantity | Ignore, show empty input |
| Very large quantity | Accept, let API handle |
| Missing params | Show defaults |
| Extra unknown params | Ignore silently |

## History Management

- Use `replace` for form changes (no back button spam)
- Use `push` only for navigation between pages
- Clear params resets to clean URL `/`
