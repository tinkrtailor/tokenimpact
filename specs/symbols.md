# Symbols Specification

Symbol normalization and catalog management for Token Impact.

## Purpose

Provide a unified symbol format across exchanges, enabling apples-to-apples comparison of the same trading pair.

## Normalized Format

All symbols use the format: `{BASE}-{QUOTE}`

Examples:
- `BTC-USD`
- `ETH-USDT`
- `SOL-EUR`

## Exchange Mappings

Each exchange has its own symbol format:

| Exchange | Native Format | Example | Normalized |
|----------|---------------|---------|------------|
| Binance | `BASEQOUTE` | `BTCUSDT` | `BTC-USDT` |
| Coinbase | `BASE-QUOTE` | `BTC-USD` | `BTC-USD` |
| Kraken | `XBASEZQUOTE` or varies | `XXBTZUSD` | `BTC-USD` |

## Symbol Catalog

### Structure

```
{
  normalized: "BTC-USD",
  base: "BTC",
  quote: "USD",
  exchanges: {
    binance: { symbol: "BTCUSDT", available: true },
    coinbase: { symbol: "BTC-USD", available: true },
    kraken: { symbol: "XXBTZUSD", available: true }
  }
}
```

### Requirements

1. Catalog includes all pairs available on at least one exchange
2. Each entry indicates per-exchange availability
3. Stablecoin equivalents are NOT merged (USDT != USD != USDC)
4. Catalog refreshes periodically (not on every request)

## Quote Currency Groups

For UI filtering/organization:

| Group | Currencies |
|-------|------------|
| Fiat | USD, EUR, GBP |
| Stablecoins | USDT, USDC, DAI, BUSD |
| Crypto | BTC, ETH |

## Search & Filter

The symbol selector supports:

1. **Text search**: Match against base or quote (e.g., "BTC" matches BTC-USD, ETH-BTC)
2. **Quote filter**: Show only pairs with specific quote currency
3. **Exchange filter**: Show only pairs available on specific exchange(s)
4. **Common pairs first**: BTC, ETH, SOL pairs surface above obscure tokens

## Validation Rules

- Base and quote must be non-empty
- Symbol must exist in catalog
- At least one exchange must support the symbol
- Requested exchanges must have the symbol available

## Edge Cases

- **Delisted pairs**: Remove from catalog on next refresh
- **New listings**: Appear after catalog refresh
- **Exchange-specific pairs**: Show but indicate limited availability
- **Kraken naming quirks**: Handle X-prefix and Z-prefix legacy symbols
