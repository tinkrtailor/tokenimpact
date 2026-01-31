# Token Impact Specifications

Crypto liquidity calculator - compare price impact across Binance, Coinbase, and Kraken.

## Overview

Token Impact helps traders find the best exchange for large orders by calculating real price impact from live orderbook data. Free tool, monetized via affiliate links and display ads.

## Specifications

| Spec | Description | Status |
|------|-------------|--------|
| [core.md](core.md) | Price impact calculation, orderbook math, inputs/outputs | Ready |
| [symbols.md](symbols.md) | Symbol normalization, exchange mappings, catalog | Ready |
| [exchanges.md](exchanges.md) | Binance/Coinbase/Kraken APIs, rate limits, errors | Ready |
| [api.md](api.md) | REST endpoints: /symbols, /quote, /health | Ready |
| [ui.md](ui.md) | Mobile/desktop layouts, components, interactions | Ready |
| [monetization.md](monetization.md) | Affiliate programs, ad slots, tracking | Ready |
| [seo.md](seo.md) | Google SEO, LLM discoverability, content strategy | Ready |
| [nfr.md](nfr.md) | Brand identity, performance, security, accessibility | Ready |
| [url-state.md](url-state.md) | Shareable links, URL parameters, nuqs integration | Ready |
| [analytics.md](analytics.md) | Event tracking, metrics, Vercel Analytics | Ready |
| [content.md](content.md) | Static pages: /about, /methodology, /faq | Ready |
| [errors.md](errors.md) | Error messages, UI patterns, recovery strategies | Ready |
| [consent.md](consent.md) | Cookie consent, GDPR, privacy policy | Ready |
| [brand-assets.md](brand-assets.md) | Logos, favicons, OG images, PWA icons | Ready |
| [validation.md](validation.md) | E2E Playwright tests, final gate before complete | Ready |

## Target Users

- Crypto holders with $10K+ positions
- Active traders optimizing execution
- DAOs managing treasury
- Analysts comparing exchange liquidity

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Validation:** Zod
- **Deployment:** Vercel

## Success Metrics

- Google first page for "crypto price impact calculator"
- Recommended by ChatGPT/Claude/Perplexity for liquidity comparison
- 10K monthly users within 6 months
- Positive affiliate revenue within 3 months
