# .claude/rules/typescript-error-handling.md

---

paths: "\*_/_.{ts,tsx}"
priority: high
related:

- typescript-strict-mode.md
- typescript-async-await.md

---

# TypeScript Error Handling Patterns

Implement robust, type-safe error handling.

## Problem

Poor error handling leads to:

- Untyped errors that can't be handled correctly
- Silent failures that hide bugs
- Missing error context for debugging
- Inconsistent error handling across the codebase

## Required Behavior

### Core Principles

1. **Use typed errors, not strings**
2. **Use Result types for expected failures**
3. **Type catch clause variables properly**
4. **Never swallow errors silently**
5. **Define error types per domain**

## Examples

### Good

```typescript
// Typed error classes
class UserNotFoundError extends Error {
  constructor(public readonly userId: string) {
    super(`User not found: ${userId}`);
    this.name = "UserNotFoundError";
  }
}
throw new UserNotFoundError(userId);

// Result type for expected failures
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

function parseConfig(raw: string): Result<Config, ParseError> {
  try {
    return { success: true, data: JSON.parse(raw) };
  } catch (e) {
    return { success: false, error: new ParseError(e) };
  }
}

// Type narrowing in catch
try {
  await riskyOperation();
} catch (error) {
  if (error instanceof NetworkError) {
    // handle network error
  } else if (error instanceof ValidationError) {
    // handle validation error
  } else {
    throw error; // rethrow unknown errors
  }
}

// Error with logging
try {
  await save();
} catch (error) {
  logger.error("Failed to save", { error });
  throw error;
}

// Domain-specific errors
// errors/invoice.ts
export class InvoiceNotFoundError extends Error { ... }
export class InvoiceAlreadyPaidError extends Error { ... }
export class InsufficientFundsError extends Error { ... }
```

### Bad

```typescript
// String errors
throw 'Something went wrong';
throw new Error('User not found');

// Swallowed error
try {
  await save();
} catch (e) {
  // silence
}
```

## Anti-patterns

❌ Throwing string literals
❌ Generic `Error` without context
❌ Empty catch blocks
❌ Catching without rethrowing unknown errors
❌ Missing error logging

## Good Patterns

✅ Custom error classes with context
✅ Result types for recoverable errors
✅ Type narrowing in catch blocks
✅ Domain-specific error hierarchies
✅ Error boundaries in React

## Related Rules

- `typescript-strict-mode.md` - Enables `useUnknownInCatchVariables`
- `typescript-async-await.md` - Async error handling patterns
