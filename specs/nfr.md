# Non-Functional Requirements

Performance, security, brand identity, and operational requirements.

## Brand Identity

### Positioning

Token Impact is the precision tool for serious crypto traders. Not retail hype, not DeFi degen culture. Bloomberg terminal energy meets crypto.

### Brand Attributes

| Attribute | Expression |
|-----------|------------|
| Precise | Exact numbers, no rounding, monospace typography |
| Professional | Clean layouts, no memes, no emojis in UI |
| Trustworthy | Transparent methodology, data sources shown |
| Fast | Instant feedback, no waiting, optimistic UI |
| Confident | Direct copy, no hedging, bold assertions |

### Voice & Tone

- **Direct**: "Best price on Binance" not "It looks like Binance might have a better price"
- **Technical**: Use trading terminology, don't dumb down
- **Concise**: No filler, every word earns its place
- **Neutral**: Present data, don't hype or FUD

### Color Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Background | Void Black | `#09090b` | Main background |
| Surface | Charcoal | `#18181b` | Cards, inputs |
| Border | Zinc | `#27272a` | Dividers, borders |
| Text Primary | White | `#fafafa` | Headlines, numbers |
| Text Secondary | Zinc | `#a1a1aa` | Labels, captions |
| Accent | Electric Cyan | `#22d3ee` | CTAs, highlights, BUY |
| Accent Alt | Magenta | `#e879f9` | SELL indicator |
| Success | Emerald | `#34d399` | Best price, gains |
| Warning | Amber | `#fbbf24` | High impact warning |
| Error | Red | `#f87171` | Errors, losses |

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Logo | Geist Sans | Bold | 24px |
| Headlines | Geist Sans | Semibold | 18-24px |
| Body | Geist Sans | Regular | 14-16px |
| Numbers | Geist Mono | Medium | 14-18px |
| Labels | Geist Sans | Medium | 12-14px |

Numbers (prices, quantities, percentages) always use monospace for alignment and precision feel.

### Visual Elements

- **Borders**: 1px, subtle, `border-zinc-800`
- **Radius**: Small, 6-8px, not overly rounded
- **Shadows**: Minimal, only for elevation (modals)
- **Icons**: Lucide icons, consistent stroke width
- **Spacing**: 4px base unit, generous whitespace

### Logo

Text-based logo: "Token Impact" in Geist Sans Bold. Optional: subtle impact ripple effect on the "o" in Token.

## Performance

### Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP | < 2.0s | Largest contentful paint |
| FID | < 100ms | First input delay |
| CLS | < 0.1 | Cumulative layout shift |
| TTFB | < 200ms | Time to first byte |
| Quote API | < 800ms | P95 response time |

### Optimization

- Server-side render initial shell
- Stream results as exchanges respond
- Lazy load ads and non-critical JS
- Preload critical fonts
- Edge caching for static assets

## Security

### API Security

- Input validation on all endpoints (Zod)
- Rate limiting per IP
- No sensitive data in URLs
- CORS restricted to own domain
- Request ID for tracing

### Client Security

- No secrets in client bundle
- CSP headers configured
- XSS prevention (React default escaping)
- No user-generated content (low XSS risk)

### Data Privacy

- No user accounts (MVP)
- No PII collection
- Analytics: anonymous session tracking only
- Cookie consent for tracking cookies
- Clear privacy policy

## Reliability

### Availability Target

99.5% uptime (allows ~3.6 hours downtime/month)

### Failure Handling

| Failure | Behavior |
|---------|----------|
| Single exchange down | Show other exchanges, indicate unavailable |
| All exchanges down | Show error, suggest retry |
| API timeout | Show partial results if any succeeded |
| Database down | N/A (no database in MVP) |

### Monitoring

- Uptime monitoring (external)
- Error tracking (Sentry or similar)
- Performance monitoring (Vercel Analytics)
- Exchange health dashboard

## Scalability

### MVP Scale

- Target: 10,000 daily users
- Peak: 100 concurrent requests
- No database (stateless)
- Vercel serverless handles scaling

### Future Considerations

- WebSocket for live updates
- Redis for rate limiting at scale
- CDN for global latency

## Accessibility

### WCAG 2.1 AA Compliance

- Color contrast ratios met
- Keyboard navigation complete
- Screen reader compatible
- Focus indicators visible
- No motion sensitivity issues

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Last 2 |
| Firefox | Last 2 |
| Safari | Last 2 |
| Edge | Last 2 |
| Mobile Safari | iOS 14+ |
| Chrome Mobile | Last 2 |

No IE11 support.

## SEO

See dedicated specification: `specs/seo.md`

Covers Google ranking strategy, LLM discoverability, technical SEO, content strategy, and measurement.
