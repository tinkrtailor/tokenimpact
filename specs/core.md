# Core Specification

Price impact calculation engine for Token Impact.

## Purpose

Calculate the true cost of executing a trade across orderbook depth, accounting for slippage beyond the quoted price.

## Concepts

### Price Impact

The difference between the quoted mid-price and the actual average fill price when consuming orderbook liquidity.

### Orderbook Depth

Cumulative bid/ask levels. A buy order consumes asks (lowest first). A sell order consumes bids (highest first).

## Inputs

| Field | Type | Description |
|-------|------|-------------|
| `symbol` | string | Normalized trading pair (e.g., `BTC-USD`) |
| `side` | enum | `BUY` or `SELL` |
| `quantity` | decimal | Base asset amount to trade |
| `orderbook` | object | Bids and asks with price/quantity at each level |

## Outputs

| Field | Type | Description |
|-------|------|-------------|
| `avgFillPrice` | decimal | Weighted average execution price |
| `totalCost` | decimal | Total quote currency spent (buy) or received (sell) |
| `priceImpact` | decimal | Percentage difference from mid-price |
| `midPrice` | decimal | (bestBid + bestAsk) / 2 at calculation time |
| `bestBid` | decimal | Top bid price |
| `bestAsk` | decimal | Top ask price |
| `volumePct` | decimal | Quantity as percentage of 24h volume |
| `depthConsumed` | integer | Number of orderbook levels consumed |
| `fillable` | boolean | Whether full quantity can be filled |
| `shortfall` | decimal | Unfilled quantity if not fully fillable |

## Calculation Rules

1. **Buy orders** walk up the ask side, consuming levels from lowest to highest price
2. **Sell orders** walk down the bid side, consuming levels from highest to lowest price
3. **Partial fills** at a level are supported (order may partially consume a level)
4. **Insufficient liquidity** returns `fillable: false` with `shortfall` amount
5. **Price impact formula**: `((avgFillPrice - midPrice) / midPrice) * 100`
   - Positive for buys (you pay more than mid)
   - Negative for sells (you receive less than mid)

## Edge Cases

- **Empty orderbook**: Return `fillable: false`, no price data
- **Zero quantity**: Return current market data, zero impact
- **Quantity exceeds book**: Fill what's available, report shortfall
- **Single level fills entire order**: Still calculate impact vs mid-price

## Data Freshness

- Calculations use point-in-time snapshots
- Results include timestamp of orderbook data
- Stale data (>5s) should be flagged in response
