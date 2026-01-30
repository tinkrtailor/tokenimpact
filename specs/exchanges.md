# Exchanges Specification

Exchange integrations for Token Impact.

## Supported Exchanges

| Exchange | Priority | Orderbook API | Public | Rate Limit |
|----------|----------|---------------|--------|------------|
| Binance | 1 | REST + WebSocket | Yes | 1200/min |
| Coinbase | 2 | REST + WebSocket | Yes | 10/sec |
| Kraken | 3 | REST + WebSocket | Yes | 1/sec |

## Required Data Per Exchange

### Orderbook

| Field | Type | Description |
|-------|------|-------------|
| `bids` | array | Price/quantity pairs, descending by price |
| `asks` | array | Price/quantity pairs, ascending by price |
| `timestamp` | number | Exchange timestamp (ms) |
| `symbol` | string | Exchange-native symbol |

Depth requirement: Minimum 100 levels per side, 500+ preferred.

### 24h Volume

| Field | Type | Description |
|-------|------|-------------|
| `volume` | decimal | 24h base asset volume |
| `quoteVolume` | decimal | 24h quote asset volume |

### Ticker (optional, for display)

| Field | Type | Description |
|-------|------|-------------|
| `lastPrice` | decimal | Last traded price |
| `priceChange` | decimal | 24h price change % |

## Integration Requirements

### Binance

- Endpoint: `GET /api/v3/depth?symbol={symbol}&limit=500`
- Volume: `GET /api/v3/ticker/24hr?symbol={symbol}`
- No auth required for public data
- Weight system: depth=5 (limit 500), ticker=1

### Coinbase

- Endpoint: `GET /products/{symbol}/book?level=2`
- Volume: `GET /products/{symbol}/stats`
- No auth required for public data
- Level 2 provides top 50 bids/asks (aggregate to 100+ via level 3 if needed)

### Kraken

- Endpoint: `GET /0/public/Depth?pair={symbol}&count=500`
- Volume: `GET /0/public/Ticker?pair={symbol}`
- No auth required
- Slower rate limits, implement request queuing

## Error Handling

| Error Type | Behavior |
|------------|----------|
| Rate limited | Retry with exponential backoff, max 3 attempts |
| Symbol not found | Exclude exchange from response, don't fail request |
| Timeout (>5s) | Exclude exchange from response, don't fail request |
| Malformed response | Log error, exclude exchange from response |
| Exchange down | Exclude exchange, cache last-known status |

## Response Normalization

All exchange responses normalize to common format before calculation:

```
{
  exchange: "binance",
  symbol: "BTC-USD",         // Normalized
  nativeSymbol: "BTCUSDT",   // Exchange-native
  orderbook: {
    bids: [[price, qty], ...],
    asks: [[price, qty], ...],
    timestamp: 1234567890123
  },
  volume24h: 12345.67,
  status: "ok" | "error" | "timeout" | "unavailable"
}
```

## Caching Strategy

| Data | Cache Duration | Rationale |
|------|----------------|-----------|
| Symbol catalog | 1 hour | Rarely changes |
| 24h volume | 5 minutes | Changes slowly |
| Orderbook | No cache | Must be fresh per request |

## Monitoring

Track per exchange:
- Request latency (p50, p95, p99)
- Error rate
- Rate limit headroom
- Data freshness
