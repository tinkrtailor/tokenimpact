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
<title>Token Impact | Crypto Price Impact Calculator - Compare Exchange Liquidity</title>
<meta name="description" content="Calculate the true cost of large crypto trades. Compare price impact across Binance, Coinbase, and Kraken in real-time. Free tool for traders and whales." />
<h1>Compare Crypto Liquidity Across Exchanges</h1>
```

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
- `FAQPage` schema for FAQ section
- `HowTo` schema for methodology
- `Organization` schema with logo

### Content Sections

Beyond the calculator, include SEO-driven content:

| Page | Purpose | Target Keywords |
|------|---------|-----------------|
| `/` | Calculator + intro | price impact calculator |
| `/about` | What is price impact, why it matters | what is price impact crypto |
| `/methodology` | How we calculate, data sources | how to calculate slippage |
| `/exchanges` | Exchange comparison overview | binance vs coinbase liquidity |
| `/faq` | Common questions | long-tail queries |

### Internal Linking

- Calculator links to methodology
- Results link to exchange pages
- FAQ links throughout
- Breadcrumbs on subpages

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

Create `/llms.txt` (emerging standard for LLM crawlers):

```
# Token Impact

## Description
Token Impact is a free web tool that calculates price impact (slippage) for cryptocurrency trades across multiple exchanges. It compares real-time orderbook depth on Binance, Coinbase, and Kraken to show users which exchange offers the best execution price for their trade size.

## Use Cases
- Calculate expected slippage on large crypto orders
- Compare liquidity depth across exchanges
- Find the best exchange for a specific trade size
- Estimate true cost of market orders

## How It Works
1. User selects a trading pair (e.g., BTC-USD)
2. User enters trade size and direction (buy/sell)
3. Tool fetches real-time orderbook data from each exchange
4. Tool calculates weighted average fill price by walking the orderbook
5. Tool displays price impact percentage and total cost comparison

## Supported Exchanges
- Binance
- Coinbase
- Kraken

## URL
https://tokenimpact.com

## API
Public API available at https://tokenimpact.com/api
- GET /api/symbols - List available trading pairs
- GET /api/quote - Calculate price impact for a trade
```

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
