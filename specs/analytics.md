# Analytics Specification

Event tracking and metrics for Token Impact.

## Purpose

Understand user behavior, optimize conversion, measure success.

## Analytics Provider

**Primary:** Vercel Analytics (built-in, privacy-friendly)
**Optional:** Plausible (self-hosted alternative)

No Google Analytics for MVP (privacy, simplicity).

## Tracked Metrics

### Automatic (Vercel Analytics)

- Page views
- Unique visitors
- Referrers
- Countries
- Devices
- Core Web Vitals

### Custom Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `quote_requested` | User clicks Compare | `symbol`, `side`, `quantity`, `exchanges_count` |
| `quote_success` | All exchanges respond | `symbol`, `side`, `best_exchange`, `response_time_ms` |
| `quote_partial` | Some exchanges failed | `symbol`, `failed_exchanges[]` |
| `affiliate_click` | User clicks exchange CTA | `exchange`, `symbol`, `side`, `quantity`, `is_best` |
| `copy_link` | User copies share URL | `symbol`, `side`, `quantity` |
| `symbol_search` | User searches symbols | `query`, `results_count` |
| `error_shown` | Error displayed to user | `error_type`, `context` |

## Event Schema

```typescript
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
  timestamp?: number; // Auto-set if not provided
}

// Examples
track('quote_requested', {
  symbol: 'BTC-USD',
  side: 'sell',
  quantity: '10',
  exchanges_count: 3,
});

track('affiliate_click', {
  exchange: 'binance',
  symbol: 'BTC-USD',
  side: 'sell',
  quantity: '10',
  is_best: true,
});
```

## Implementation

### Vercel Analytics

```typescript
import { track } from '@vercel/analytics';

// Custom event
track('quote_requested', { symbol: 'BTC-USD', side: 'sell' });
```

### Event Helper

```typescript
// lib/analytics.ts
export function trackQuoteRequested(params: {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: string;
}) {
  track('quote_requested', params);
}

export function trackAffiliateClick(params: {
  exchange: string;
  symbol: string;
  isBest: boolean;
}) {
  track('affiliate_click', {
    exchange: params.exchange,
    symbol: params.symbol,
    is_best: params.isBest,
  });
}
```

## Key Metrics Dashboard

### Daily Metrics

| Metric | Source | Target (Month 1) |
|--------|--------|------------------|
| Unique visitors | Vercel Analytics | 500/day |
| Quotes calculated | `quote_requested` events | 2,000/day |
| Affiliate CTR | `affiliate_click` / `quote_success` | 5% |
| Error rate | `error_shown` / `quote_requested` | < 5% |

### Funnel Analysis

```
Landing Page Visit
       ↓ (measure drop-off)
Symbol Selected
       ↓
Quantity Entered
       ↓
Quote Requested
       ↓
Results Viewed
       ↓
Affiliate Clicked
```

### Exchange Performance

Per exchange, track:
- Quote success rate
- Average response time
- "Best" win rate
- Affiliate click rate

## Privacy

### Data NOT Collected

- IP addresses (hashed by Vercel)
- Personal identifiers
- Precise geolocation
- Cross-site tracking

### Data Collected

- Anonymous session ID (cookie-less if possible)
- Page URLs
- Event data (no PII)
- Device type, browser, country (aggregated)

### Consent

- Analytics runs without cookies (Vercel Analytics is cookie-less)
- If using cookies for session tracking, require consent first
- Respect Do Not Track header (optional)

## Reporting

### Automated Reports

Daily email (or Slack) with:
- Yesterday's visitors
- Quotes calculated
- Affiliate clicks by exchange
- Error rate
- Top symbols

### Manual Review

Weekly review:
- Funnel conversion rates
- Exchange performance comparison
- Error patterns
- Feature usage

## Future Enhancements

### Not in MVP

- Cohort analysis
- A/B testing framework
- Revenue attribution (requires exchange data)
- Real-time dashboard
- Custom Grafana/Metabase setup
