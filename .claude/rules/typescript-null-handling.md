# .claude/rules/typescript-null-handling.md

---

paths: "\*_/_.{ts,tsx}"
priority: high
related:

- typescript-strict-mode.md
- typescript-zod-validation.md

---

# TypeScript Null and Undefined Handling

Handle nullable values safely and explicitly.

## Problem

Improper null handling causes:

- Runtime "undefined is not a function" errors
- Inconsistent null vs undefined usage
- Verbose null checking code
- Type system bypasses

## Required Behavior

### Core Principles

1. **Use strictNullChecks** (always enabled in strict mode)
2. **Prefer undefined over null** for consistency
3. **Use optional chaining** (`?.`) for safe property access
4. **Use nullish coalescing** (`??`) for defaults
5. **Use type guards** for narrowing

## Examples

### Good

```typescript
// Prefer undefined over null
function find(id: string): User | undefined { ... }

// Optional chaining
const name = user?.profile?.name;

// Nullish coalescing (only replaces null/undefined)
const count = value ?? 10;

// Type guard for filtering
function isNotNull<T>(value: T | null | undefined): value is T {
  return value != null;
}
const users = [user1, null, user2].filter(isNotNull);
// users is User[], not (User | null)[]

// Utility types
type UserInput = { name?: string; email?: string };
type User = Required<UserInput>; // All properties required

type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>; // string

// Default parameters
function greet(name: string = "Guest") { ... }
function createUser({ name = "Anonymous", age = 0 }: Partial<User> = {}) { ... }

// Assertion functions
function assertExists<T>(value: T | null | undefined, msg: string): asserts value is T {
  if (value == null) throw new Error(msg);
}

const user = await findUser(id);
assertExists(user, `User ${id} not found`);
// TypeScript knows user is User here
```

### Bad

```typescript
// Mixing null and undefined
function find(id: string): User | null | undefined { ... }

// Verbose null checking
const name = user && user.profile && user.profile.name;

// || treats 0 and "" as falsy
const count = value || 10;

// Non-null assertion without explanation
const element = document.getElementById("app")!;
```

## Anti-patterns

❌ Mixing null and undefined in return types
❌ Using `||` for default values (use `??`)
❌ Non-null assertion (`!`) without documentation
❌ Verbose `&&` chains (use `?.`)
❌ Ignoring strictNullChecks errors

## Good Patterns

✅ Consistent use of undefined over null
✅ Optional chaining (`?.`)
✅ Nullish coalescing (`??`)
✅ Type guards for narrowing
✅ Assertion functions for runtime validation
✅ `NonNullable<T>` and `Required<T>` utility types

## Related Rules

- `typescript-strict-mode.md` - Enables strictNullChecks
- `typescript-zod-validation.md` - Runtime validation for nullable data
