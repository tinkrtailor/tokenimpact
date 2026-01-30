# Error Handling Specification

User-facing error messages and error UI patterns.

## Principles

1. **Be specific**: Tell users what went wrong
2. **Be actionable**: Tell users what to do
3. **Be honest**: Don't hide failures
4. **Be calm**: Errors happen, don't panic the user

## Error Categories

| Category | Severity | User Impact |
|----------|----------|-------------|
| Validation | Low | Blocked from action |
| Exchange partial | Medium | Reduced results |
| Exchange total | High | No results |
| Network | High | App unusable |
| System | Critical | App broken |

## Error Messages

### Validation Errors

| Error | Message | Recovery |
|-------|---------|----------|
| Empty symbol | "Select a trading pair" | Focus selector |
| Empty quantity | "Enter a quantity" | Focus input |
| Invalid quantity | "Enter a valid number" | Clear and focus input |
| Zero quantity | "Quantity must be greater than 0" | Focus input |
| Negative quantity | "Quantity must be positive" | Clear and focus input |
| Symbol not found | "Trading pair not available" | Show suggestions |

### Exchange Errors

| Error | Message | Recovery |
|-------|---------|----------|
| Single exchange timeout | "[Exchange] is slow to respond" | Show other results |
| Single exchange error | "[Exchange] unavailable" | Show other results |
| Single exchange no pair | "Not listed on [Exchange]" | Show other results |
| All exchanges timeout | "Exchanges are slow. Try again." | Retry button |
| All exchanges error | "Unable to fetch prices. Try again." | Retry button |
| Rate limited | "Too many requests. Wait a moment." | Auto-retry after delay |

### Network Errors

| Error | Message | Recovery |
|-------|---------|----------|
| Offline | "You're offline. Check your connection." | Auto-retry on reconnect |
| Request failed | "Request failed. Try again." | Retry button |

### System Errors

| Error | Message | Recovery |
|-------|---------|----------|
| Unexpected error | "Something went wrong. Try again." | Retry button |
| API down | "Service temporarily unavailable" | Suggest retry later |

## UI Patterns

### Inline Validation

```
┌─────────────────────────┐
│ Quantity                │
│ [____________]          │
│ ⚠ Enter a valid number  │  <- Red text below input
└─────────────────────────┘
```

- Show on blur or submit attempt
- Red border on input
- Error text below input
- Clear error on valid input

### Exchange Card Error (Mobile)

```
┌─────────────────────────┐
│ KRAKEN                  │
│ ─────────────────────── │
│ ⚠ Unavailable           │
│ Pair not listed         │
└─────────────────────────┘
```

- Grayed out card
- Warning icon
- Brief explanation
- No CTA button

### Exchange Row Error (Desktop)

```
│ Kraken   │  —  │  —  │  —  │ Unavailable │
```

- Grayed row
- Dashes for missing data
- Status in last column
- Tooltip on hover with details

### Full Page Error

```
┌─────────────────────────┐
│                         │
│     ⚠                   │
│                         │
│  Unable to fetch prices │
│                         │
│  All exchanges failed   │
│  to respond.            │
│                         │
│  [Try Again]            │
│                         │
└─────────────────────────┘
```

- Centered layout
- Warning icon (not scary)
- Clear message
- Prominent retry button

### Toast Notifications

For non-blocking errors:

```
┌────────────────────────────────┐
│ ⚠ Binance is slow to respond   │  <- Amber toast
└────────────────────────────────┘
```

- Auto-dismiss after 5s
- Don't stack multiple
- Position: bottom-center (mobile), bottom-right (desktop)

### Offline Banner

```
┌────────────────────────────────────────────┐
│ 📡 You're offline. Reconnect to continue.  │
└────────────────────────────────────────────┘
```

- Persistent banner at top
- Dismiss automatically when online
- Gray/muted styling

## Error Codes

Internal error codes for logging/debugging:

| Code | Meaning |
|------|---------|
| `E_VALIDATION` | Input validation failed |
| `E_SYMBOL_NOT_FOUND` | Symbol not in catalog |
| `E_EXCHANGE_TIMEOUT` | Exchange API timeout |
| `E_EXCHANGE_ERROR` | Exchange API error |
| `E_EXCHANGE_RATE_LIMIT` | Exchange rate limited |
| `E_NETWORK` | Network request failed |
| `E_PARSE` | Response parse error |
| `E_UNKNOWN` | Unexpected error |

## Logging

All errors logged with:
- Error code
- Timestamp
- Context (symbol, exchange, etc.)
- Stack trace (server-side only)
- Request ID

## Recovery Strategies

### Auto-Retry

| Error Type | Retry | Delay | Max Attempts |
|------------|-------|-------|--------------|
| Timeout | Yes | 1s | 2 |
| Rate limit | Yes | 5s | 1 |
| Network | Yes | 2s | 2 |
| Validation | No | - | - |
| 4xx errors | No | - | - |
| 5xx errors | Yes | 2s | 1 |

### Graceful Degradation

When some exchanges fail:
1. Show successful results immediately
2. Indicate failed exchanges with status
3. Don't block the entire response
4. Let user retry failed exchanges individually (future)

## Accessibility

- Error messages announced to screen readers
- Color not sole indicator (icons + text)
- Focus moves to error message on validation fail
- Error messages associated with inputs via `aria-describedby`
