# API Specification

REST API endpoints for Token Impact.

## Base URL

Production: `https://tokenimpact.com/api`
Development: `http://localhost:3000/api`

## Endpoints

### GET /symbols

Returns available trading pairs with exchange availability.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `quote` | string | - | Filter by quote currency |
| `exchange` | string | - | Filter by exchange availability |
| `search` | string | - | Search base or quote |
| `limit` | number | 100 | Max results |

**Response:**

```json
{
  "symbols": [
    {
      "symbol": "BTC-USD",
      "base": "BTC",
      "quote": "USD",
      "exchanges": {
        "binance": true,
        "coinbase": true,
        "kraken": true
      }
    }
  ],
  "total": 1234,
  "cached": true,
  "timestamp": 1234567890123
}
```

**Errors:**

| Code | Condition |
|------|-----------|
| 400 | Invalid query parameters |
| 500 | Failed to fetch symbol data |

---

### GET /quote

Calculates price impact for a trade across exchanges.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `symbol` | string | Yes | Normalized symbol (e.g., `BTC-USD`) |
| `side` | string | Yes | `BUY` or `SELL` |
| `quantity` | string | Yes | Base asset amount |
| `exchanges` | string | No | Comma-separated list, default: all |

**Response:**

```json
{
  "symbol": "BTC-USD",
  "side": "BUY",
  "quantity": "10",
  "timestamp": 1234567890123,
  "results": [
    {
      "exchange": "binance",
      "status": "ok",
      "midPrice": "50000.00",
      "bestBid": "49999.00",
      "bestAsk": "50001.00",
      "avgFillPrice": "50025.50",
      "totalCost": "500255.00",
      "priceImpact": "0.051",
      "volumePct": "0.82",
      "depthConsumed": 3,
      "fillable": true,
      "affiliateUrl": "https://binance.com/..."
    },
    {
      "exchange": "coinbase",
      "status": "ok",
      "midPrice": "50010.00",
      "bestBid": "50008.00",
      "bestAsk": "50012.00",
      "avgFillPrice": "50045.00",
      "totalCost": "500450.00",
      "priceImpact": "0.070",
      "volumePct": "1.24",
      "depthConsumed": 5,
      "fillable": true,
      "affiliateUrl": "https://coinbase.com/..."
    },
    {
      "exchange": "kraken",
      "status": "timeout",
      "error": "Request timed out"
    }
  ],
  "best": "binance"
}
```

**Response Fields:**

| Field | Description |
|-------|-------------|
| `best` | Exchange with lowest cost (buy) or highest proceeds (sell) |
| `status` | `ok`, `error`, `timeout`, `unavailable` |
| `priceImpact` | Percentage, positive = worse than mid |
| `volumePct` | Trade size as % of 24h volume |
| `affiliateUrl` | Exchange signup link with affiliate tracking |

**Errors:**

| Code | Condition |
|------|-----------|
| 400 | Missing/invalid parameters |
| 404 | Symbol not found |
| 422 | Quantity <= 0 or non-numeric |
| 500 | All exchanges failed |

---

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "exchanges": {
    "binance": { "status": "ok", "latency": 45 },
    "coinbase": { "status": "ok", "latency": 120 },
    "kraken": { "status": "degraded", "latency": 890 }
  },
  "timestamp": 1234567890123
}
```

## Common Response Headers

| Header | Value |
|--------|-------|
| `Content-Type` | `application/json` |
| `Cache-Control` | `no-store` (quote), `max-age=3600` (symbols) |
| `X-Request-Id` | Unique request identifier |

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| /symbols | 60 | 1 minute |
| /quote | 30 | 1 minute |
| /health | 10 | 1 minute |

Rate limit headers:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Error Response Format

All errors return:

```json
{
  "error": {
    "code": "INVALID_SYMBOL",
    "message": "Symbol XYZ-ABC not found",
    "details": {}
  }
}
```

## Validation

All inputs validated with Zod schemas. Invalid requests return 400 with specific validation errors.
