# Monetization Specification

Revenue generation for Token Impact.

## Revenue Streams

| Stream | Priority | Complexity |
|--------|----------|------------|
| Affiliate links | 1 | Low |
| Display ads | 2 | Medium |

## Affiliate Program

### Strategy

Every exchange result includes an affiliate signup link. The "best" result has prominent CTA placement.

### Exchange Programs

| Exchange | Program | Commission | Cookie |
|----------|---------|------------|--------|
| Binance | Binance Affiliates | 20-50% trading fees | 90 days |
| Coinbase | Coinbase Affiliates | $10 per signup | 30 days |
| Kraken | Kraken Affiliates | 20% trading fees | 30 days |

### Link Structure

All affiliate links use redirect through our domain for:
- Click tracking
- A/B testing different CTAs
- Link updates without code deploy

Format: `/go/{exchange}?ref={tracking_id}`

Redirects to exchange with affiliate parameters.

### CTA Placement

| Location | Visibility | Style |
|----------|------------|-------|
| Best result | Always visible | Primary button, highlighted |
| Other results | Visible | Secondary button, subdued |
| Mobile card | Bottom of card | Full-width button |
| Desktop row | Row hover / always | Inline button |

### CTA Copy

| Exchange | Primary CTA | Secondary CTA |
|----------|-------------|---------------|
| Best | "Trade on {Exchange} →" | "Open {Exchange}" |
| Others | "Trade on {Exchange}" | "Open {Exchange}" |

### Tracking

Track per click:
- Exchange
- Symbol
- Trade side
- Quantity
- Timestamp
- Session ID
- Device type

Store in analytics for:
- Conversion attribution (if exchange shares data)
- CTA optimization
- Revenue reporting

## Display Advertising

### Ad Slots

| Slot ID | Location | Size (Mobile) | Size (Desktop) |
|---------|----------|---------------|----------------|
| `top-banner` | Below header | 320x50 | 728x90 |
| `results-bottom` | Below results | 320x100 | 728x90 |
| `sidebar` | Right column | Hidden | 300x250 |

### Implementation

- Use Google AdSense or crypto-friendly network (Coinzilla, A-ADS)
- Lazy load ads after main content
- Fallback to house ads if no fill
- Respect Do Not Track (optional)

### Ad Guidelines

- Max 2 ad units visible at once
- No interstitials or popups
- No auto-playing video
- Clear "Advertisement" label
- No ads that mimic UI elements

### Ad-Free Consideration

Future: Premium tier removes ads (not in MVP).

## Revenue Tracking

### Metrics to Track

| Metric | Source |
|--------|--------|
| Affiliate clicks | Internal tracking |
| Affiliate signups | Exchange dashboard (manual) |
| Affiliate revenue | Exchange dashboard (manual) |
| Ad impressions | Ad network |
| Ad clicks | Ad network |
| Ad revenue | Ad network |
| RPM | Calculated |

### Reporting

Daily email/dashboard with:
- Total sessions
- Quotes generated
- Affiliate clicks by exchange
- Estimated revenue

## Legal Requirements

### Disclosures

- Affiliate disclosure in footer: "We earn commission from partner links"
- Cookie consent for tracking (GDPR)
- Privacy policy covering data collection

### Compliance

- FTC affiliate disclosure guidelines
- GDPR cookie consent
- No misleading claims about savings
