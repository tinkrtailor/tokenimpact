# .claude/rules/typescript-async-await.md

---

paths: "\*_/_.{ts,tsx}"
priority: high
related:

- typescript-error-handling.md

---

# TypeScript Async/Await and Promise Handling

Handle asynchronous code safely and efficiently.

## Problem

Incorrect async handling causes:

- Floating promises that fail silently
- Sequential operations that could run in parallel
- Memory leaks from unhandled rejections
- Race conditions and timing bugs

## Required Behavior

### Core Principles

1. **Always await or return Promises**
2. **Type async function returns explicitly**
3. **Use Promise.all for parallel operations**
4. **Use Promise.allSettled when failures shouldn't stop others**
5. **Avoid async void functions** (except event handlers)

## Examples

### Good

```typescript
// Always await promises
async function save() {
  await saveToDb();
}

// Explicit return type
async function fetchUser(id: string): Promise<User | null> {
  const data = await db.users.find(id);
  return data;
}

// Parallel operations
const [user, orders] = await Promise.all([fetchUser(id), fetchOrders(id)]);

// Handle partial failures
const results = await Promise.allSettled([sendEmail(user1), sendEmail(user2), sendEmail(user3)]);
const failures = results.filter((r) => r.status === 'rejected');

// Timeout with AbortController
async function fetchWithTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  try {
    return await promise;
  } finally {
    clearTimeout(timeout);
  }
}

// Safe event handler
button.onClick = () => {
  handleClick().catch(console.error);
};

// Async iterators for streams
async function* paginate<T>(fetch: (page: number) => Promise<T[]>) {
  let page = 0;
  while (true) {
    const items = await fetch(page++);
    if (items.length === 0) break;
    yield* items;
  }
}
```

### Bad

```typescript
// Floating promise
async function save() {
  saveToDb(); // Promise not awaited!
}

// Sequential when could be parallel
const user = await fetchUser(id);
const orders = await fetchOrders(id);

// Async void loses errors
async function handleClick(): Promise<void> { ... }
button.onClick = handleClick; // Error not caught!
```

## Anti-patterns

❌ Floating (non-awaited) promises
❌ Sequential awaits for independent operations
❌ `async void` functions
❌ Missing timeout handling for external calls
❌ Implicit Promise return types

## Good Patterns

✅ Always await or return promises
✅ `Promise.all` for parallel independent operations
✅ `Promise.allSettled` for partial failure tolerance
✅ `AbortController` for timeouts
✅ Explicit `Promise<T>` return types

## Related Rules

- `typescript-error-handling.md` - Error handling in async code
