# Content Pages Specification

Static content pages for SEO and user education.

## Pages

| Path | Purpose | Priority |
|------|---------|----------|
| `/about` | What is Token Impact, why use it | MVP |
| `/methodology` | How calculations work | MVP |
| `/faq` | Common questions | MVP |
| `/exchanges` | Exchange comparison overview | Post-MVP |

## Page: /about

### URL
`/about`

### Title
"About Token Impact | Crypto Liquidity Calculator"

### Content Outline

```markdown
# About Token Impact

## What We Do

Token Impact calculates the true cost of executing large crypto trades.
Enter your trade size, and we show you the price impact across Binance,
Coinbase, and Kraken in real-time.

## Why Price Impact Matters

When you place a market order, you don't get the quoted price. You get
the average price across all the orders you consume in the orderbook.

A $500 trade? Negligible difference.
A $500,000 trade? Could cost you thousands in hidden slippage.

## Who We're For

- **Traders** optimizing execution on large orders
- **Whales** comparing exchange liquidity before moving size
- **DAOs** planning treasury operations
- **Analysts** researching market depth

## How It's Free

Token Impact is free to use. We earn commission when you sign up for
exchanges through our links. This doesn't affect your trading fees.

[Try the Calculator →]
```

### Word Count
~200-300 words

---

## Page: /methodology

### URL
`/methodology`

### Title
"How We Calculate Price Impact | Token Impact Methodology"

### Content Outline

```markdown
# Methodology

## Data Sources

We fetch real-time orderbook data directly from exchange APIs:
- Binance: Public REST API, 500 levels depth
- Coinbase: Public REST API, Level 2 orderbook
- Kraken: Public REST API, 500 levels depth

## Calculation Process

### 1. Fetch Orderbook

For each exchange, we retrieve the current bid/ask levels with
quantities at each price point.

### 2. Walk the Book

For a BUY order, we consume asks from lowest to highest price.
For a SELL order, we consume bids from highest to lowest price.

We accumulate quantity until your order is filled.

### 3. Calculate Metrics

**Average Fill Price** = Total Cost / Quantity

**Price Impact** = (Avg Fill Price - Mid Price) / Mid Price × 100%

**Mid Price** = (Best Bid + Best Ask) / 2

### Example

You want to sell 10 BTC. The orderbook looks like:

| Bid Price | Quantity |
|-----------|----------|
| $50,000   | 2 BTC    |
| $49,990   | 3 BTC    |
| $49,975   | 5 BTC    |

You fill:
- 2 BTC at $50,000 = $100,000
- 3 BTC at $49,990 = $149,970
- 5 BTC at $49,975 = $249,875

Total: $499,845 for 10 BTC
Average: $49,984.50 per BTC

If mid-price was $50,005, your price impact is -0.04%.

## Limitations

- Data is point-in-time (markets move fast)
- Does not account for your order affecting the market
- Exchange fees not included in calculations
- Actual execution may vary

## Update Frequency

Orderbook data is fetched fresh for each calculation. We do not
cache orderbook data to ensure accuracy.

[Calculate Your Trade →]
```

### Word Count
~400-500 words

---

## Page: /faq

### URL
`/faq`

### Title
"FAQ | Token Impact - Crypto Price Impact Calculator"

### Schema
Implement `FAQPage` structured data for rich snippets.

### Questions

**What is price impact?**
Price impact is the difference between the expected price of a trade and
the actual average price you receive. It occurs because large orders
consume multiple levels of the orderbook.

**Why does price impact matter?**
For small trades, impact is negligible. For large trades ($10K+), it can
cost hundreds or thousands of dollars. Comparing exchanges helps you
minimize this cost.

**Which exchanges do you support?**
Currently: Binance, Coinbase, and Kraken. We plan to add more exchanges
including OKX, Bybit, and DEX aggregators.

**Is the data real-time?**
Yes. We fetch live orderbook data from each exchange when you request a
quote. Data is typically <1 second old.

**How accurate are the calculations?**
Our calculations show what your trade would cost based on current
orderbook depth. Actual execution may differ due to:
- Market movement between calculation and execution
- Your order affecting other traders' behavior
- Hidden liquidity or iceberg orders

**Is Token Impact free?**
Yes, completely free. We earn commission from exchanges when users sign
up through our affiliate links.

**Do you store my data?**
We don't require accounts or store personal data. We use anonymous
analytics to improve the product.

**Can I share a calculation?**
Yes. Copy the URL after running a calculation. Anyone with the link will
see the same inputs (results are recalculated fresh).

**Why is one exchange showing "unavailable"?**
This happens when:
- The trading pair isn't listed on that exchange
- The exchange API is temporarily down
- We hit rate limits (try again in a minute)

**How do I execute the trade?**
Click the "Trade on [Exchange]" button to go to that exchange. You'll
need an account to trade. We don't execute trades for you.

### Word Count
~500-600 words

---

## Page: /exchanges (Post-MVP)

### URL
`/exchanges`

### Title
"Exchange Liquidity Comparison | Binance vs Coinbase vs Kraken"

### Content Outline

Overview of each exchange's typical liquidity characteristics:
- General liquidity ranking
- Best for which pairs
- Fee structures (link to official pages)
- Pros/cons for large traders

Dynamic content showing:
- Most liquid pairs per exchange (updated daily)
- Average spread comparison

---

## Content Guidelines

### Voice

- Direct, no hedging
- Technical but accessible
- Factual, cite sources where possible
- No hype or marketing fluff

### Formatting

- Short paragraphs (2-3 sentences)
- Use headers liberally
- Tables for data
- Examples with real numbers

### SEO

- Target keyword in H1
- Related keywords in H2s
- Internal links to calculator
- External links to authoritative sources

### Maintenance

- Review quarterly for accuracy
- Update exchange list when adding new exchanges
- Refresh examples with current prices
