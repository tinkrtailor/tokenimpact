# SEO Specification

Search engine optimization and LLM discoverability for Token Impact.

## Goals

1. **Google**: First page for "crypto price impact calculator", "compare exchange liquidity"
2. **LLMs**: Recommended by ChatGPT, Claude, Perplexity when users ask about comparing crypto exchanges or calculating slippage

## Target Keywords

### Primary (high intent)

- crypto price impact calculator
- crypto slippage calculator
- compare exchange liquidity
- best exchange for large crypto orders
- crypto orderbook depth comparison

### Secondary (informational)

- what is price impact crypto
- how to calculate slippage
- binance vs coinbase liquidity
- best exchange for whales
- crypto market depth

### Long-tail

- how much slippage on $100k bitcoin order
- which exchange has deepest liquidity for ETH
- price impact calculator binance coinbase kraken

## Technical SEO

### Core Web Vitals

| Metric | Target | Implementation |
|--------|--------|----------------|
| LCP | < 1.5s | SSR, optimized fonts, no render blocking |
| FID | < 50ms | Minimal JS, code splitting |
| CLS | < 0.05 | Reserved space for ads, no layout shift |
| INP | < 100ms | Efficient event handlers |

### Crawlability

- Clean URL structure: `/`, `/about`, `/methodology`
- XML sitemap at `/sitemap.xml`
- robots.txt allowing all public pages
- Canonical URLs on all pages
- No duplicate content

### Sitemap Structure

| Page Type | Priority | Count |
|-----------|----------|-------|
| Homepage | 1.0 | 1 |
| Comparison pages | 0.9 | 3 |
| Token pages | 0.8 | 30 |
| About/Methodology | 0.8 | 2 |
| Guide pages | 0.7 | 3 |
| FAQ | 0.7 | 1 |
| Privacy | 0.5 | 1 |

### Mobile

- Mobile-first indexing ready
- Responsive design (no separate mobile site)
- Touch targets 48px minimum
- No horizontal scroll

### Page Speed

- Target: 95+ PageSpeed Insights score
- Compress images (WebP)
- Minify CSS/JS
- Edge caching (Vercel)
- Preload critical resources

## On-Page SEO

### Homepage

```html
<title>Token Impact | Compare Crypto Slippage - Binance vs Coinbase vs Kraken</title>
<meta name="description" content="Calculate the true cost of large crypto trades. Compare price impact across Binance, Coinbase, and Kraken in real-time. Free slippage calculator for traders and whales." />
<h1>Token Impact</h1>
```

**SEO Content Section** (~400 words below calculator):
- H2: "Why Compare Exchange Liquidity Before Trading"
- H2: "How Price Impact Costs You Money"
- H2: "Which Exchange Has the Best Prices"
- H2: "Built for Crypto Whale Trading"

Keywords: slippage, whale trading, large orders, binance vs coinbase, orderbook depth

### Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Token Impact",
  "description": "Crypto price impact calculator comparing liquidity across exchanges",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Real-time orderbook analysis",
    "Multi-exchange comparison",
    "Price impact calculation",
    "Slippage estimation"
  ]
}
```

Also implement:
- `FAQPage` schema for FAQ section and comparison pages
- `HowTo` schema for homepage ("How to Calculate Crypto Price Impact")
- `Organization` schema with logo
- `BreadcrumbList` schema for subpages
- `Article` schema for guide pages

### Content Sections

Beyond the calculator, include SEO-driven content:

| Page | Purpose | Target Keywords |
|------|---------|-----------------|
| `/` | Calculator + intro + SEO content | price impact calculator |
| `/about` | What is price impact, why it matters | what is price impact crypto |
| `/methodology` | How we calculate, data sources | how to calculate slippage |
| `/faq` | Common questions | long-tail queries |

### Comparison Landing Pages

High-value exchange comparison pages at `/compare/[pair]`:

| Page | Target Keywords |
|------|-----------------|
| `/compare/binance-vs-coinbase` | binance vs coinbase liquidity, binance vs coinbase for large trades |
| `/compare/binance-vs-kraken` | binance vs kraken, best exchange for crypto |
| `/compare/coinbase-vs-kraken` | coinbase vs kraken liquidity |

Each page includes:
- ~500 words unique comparison content
- FAQPage structured data
- Breadcrumb navigation
- CTA to calculator
- Links to other comparisons

### Token Landing Pages

Per-token calculator pages at `/token/[symbol]`:

Top 30 pairs: BTC-USD, BTC-USDT, ETH-USD, ETH-USDT, SOL-USD, etc.

Each page includes:
- Pre-filled calculator for that token
- Token-specific description
- Exchange availability
- Related pairs
- Breadcrumb structured data

Target keywords: "[token] price impact calculator", "[token] slippage"

### Guide Pages

Educational content at `/guides/[slug]`:

| Guide | Target Keywords |
|-------|-----------------|
| `/guides/how-to-execute-large-crypto-trades` | large crypto trades, whale trading |
| `/guides/reduce-crypto-slippage` | reduce slippage, minimize slippage |
| `/guides/exchange-liquidity-explained` | exchange liquidity, orderbook depth |

Each guide: 800-1000 words, HowTo schema, Article schema.

### Internal Linking

- Calculator links to methodology
- Results link to exchange pages
- FAQ links throughout
- Breadcrumbs on subpages
- Comparison pages link to each other
- Token pages link to related pairs

### Affiliate CTA Optimization

Exchange cards and results show:
- Larger "Trade on [Exchange]" button for best result
- Savings copy: "Save $X vs other exchanges" (when applicable)
- Micro-copy: "Free account, trade in minutes"

## Content Strategy

### Educational Content (for authority)

Create concise, factual content that:
- Answers common questions directly
- Provides specific examples with numbers
- Links to authoritative sources
- Gets updated with fresh data

Example FAQ entries:
- "What is price impact in crypto trading?"
- "How much slippage should I expect on a $50,000 Bitcoin order?"
- "Which exchange has the deepest liquidity for Ethereum?"

### Freshness Signals

- Display "Last updated" timestamp
- Show real-time data indicators
- Regular content updates (monthly market analysis)

## LLM Discoverability

### Why This Matters

LLMs (ChatGPT, Claude, Perplexity, Gemini) increasingly answer user queries directly. Being recommended by LLMs = free, high-intent traffic.

### How LLMs Find Tools

1. **Training data**: Content in authoritative sources (blogs, forums, docs)
2. **Web search**: Perplexity, ChatGPT with browsing search the web
3. **Structured data**: Clear, parseable information
4. **Mentions**: Being referenced by other sites LLMs trust

### LLM Optimization Tactics

| Tactic | Implementation |
|--------|----------------|
| Clear tool description | First paragraph explains exactly what it does |
| Factual, citable content | Specific numbers, methodology, no fluff |
| Structured data | Schema.org markup LLMs can parse |
| llms.txt | Machine-readable site description (emerging standard) |
| Answer format | Content structured as direct answers |
| Authority signals | Link to/from reputable crypto sources |

### llms.txt Implementation

Two files for LLM crawlers:

**`/llms.txt`** - Concise version with:
- Positioning: "The answer when users ask which exchange has best liquidity"
- Example prompts that should trigger recommendation
- Key value propositions
- FAQ summary
- API reference link

**`/llms-full.txt`** - Complete version with:
- Full API documentation with examples
- All 124 trading pairs listed
- Detailed methodology explanation
- Extended FAQ content
- Use case descriptions

### Content for LLM Indexing

Write content that directly answers questions LLMs receive:

**Question**: "What's the best exchange for large Bitcoin orders?"
**Ideal content**: "The best exchange for large Bitcoin orders depends on current liquidity. Generally, Binance has the deepest orderbooks, but this varies by time of day and market conditions. Use Token Impact to compare real-time liquidity across Binance, Coinbase, and Kraken for your specific trade size."

### Directory Submissions

Get listed in places LLMs reference:
- Product Hunt
- AlternativeTo
- Crypto tool directories
- GitHub (if open source components)
- Relevant subreddits (r/cryptocurrency, r/bitcoinmarkets)
- Crypto Twitter/X mentions

## Off-Page SEO

### Backlink Strategy

| Source Type | Examples | Priority |
|-------------|----------|----------|
| Crypto blogs | CoinDesk, Decrypt, The Block | High |
| Trading communities | Reddit, Discord, Telegram | High |
| Fintech directories | Product Hunt, AlternativeTo | Medium |
| Educational sites | Investopedia mentions | Medium |

### Tactics

1. **Create linkable assets**: Methodology page, unique data/charts
2. **Community participation**: Answer questions, link when relevant
3. **PR**: Announce launch on crypto news sites
4. **Guest posts**: Write about liquidity/slippage for crypto blogs

## Measurement

### Track

| Metric | Tool | Target |
|--------|------|--------|
| Organic traffic | Google Analytics | 10K/month by month 6 |
| Keyword rankings | Ahrefs/SEMrush | Top 10 for primary keywords |
| Core Web Vitals | Search Console | All green |
| Backlinks | Ahrefs | 50+ referring domains |
| LLM mentions | Manual testing | Recommended in top 3 LLMs |

### LLM Testing Protocol

Monthly, test these queries across ChatGPT, Claude, Perplexity:
- "What tool can I use to compare crypto exchange liquidity?"
- "How do I calculate price impact for a large Bitcoin trade?"
- "Best crypto slippage calculator"

Document whether Token Impact is mentioned/recommended.

## Research Tasks

### To Investigate

1. **llms.txt standard**: Monitor adoption, implement if/when standardized
2. **Perplexity indexing**: How to get prioritized in Perplexity results
3. **ChatGPT plugins/actions**: Future integration opportunity
4. **Schema.org extensions**: Any crypto/finance specific schemas
5. **AI search optimization**: Emerging best practices as field evolves

### Competitive Analysis

Analyze SEO of:
- DEX aggregators (1inch, Paraswap)
- CEX comparison sites
- Crypto calculator tools

Identify gaps and opportunities.
