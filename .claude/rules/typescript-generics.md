# .claude/rules/typescript-generics.md

---

paths: "\*_/_.{ts,tsx}"
priority: normal
related:

- typescript-interfaces-types.md
- typescript-strict-mode.md

---

# TypeScript Generics Best Practices

Use generics to create reusable, type-safe abstractions.

## Problem

Poor generic usage leads to:

- Over-complicated type signatures
- Loss of type inference
- Unnecessary generic parameters
- Hard-to-understand code

## Required Behavior

### Core Principles

1. **Use meaningful parameter names** for complex generics
2. **Constrain generics** when possible
3. **Use default generic parameters**
4. **Let TypeScript infer** when possible
5. **Avoid over-genericizing**

## Examples

### Good

```typescript
// Simple case - T is fine
function identity<T>(value: T): T { return value; }

// Complex case - descriptive names
function transform<TInput, TOutput>(
  input: TInput,
  transformer: (item: TInput) => TOutput
): TOutput { ... }

// Constrained generic
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

// Default generic parameters
interface ApiResponse<TData = unknown, TError = Error> {
  data?: TData;
  error?: TError;
}

// TypeScript infers T
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
const num = first([1, 2, 3]); // inferred as number

// keyof constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Utility types
type Nullable<T> = T | null | undefined;
type AsyncResult<T> = Promise<Result<T>>;
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Conditional types
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type ArrayElement<T> = T extends (infer E)[] ? E : never;

// Generic class with constraint
class BaseRepository<T extends { id: string }> implements Repository<T> {
  // ...
}
```

### Bad

```typescript
// Too permissive
function getLength<T>(item: T): number { ... }

// Unnecessary generic
function add<T extends number>(a: T, b: T): number {
  return a + b;
}

// Just use concrete type
function add(a: number, b: number): number {
  return a + b;
}
```

## Anti-patterns

❌ Unconstrained generics that should be constrained
❌ Unnecessary generics when concrete types work
❌ Single-letter names for complex generics
❌ Missing default parameters when sensible

## Good Patterns

✅ Meaningful names for complex generics (TInput, TOutput)
✅ Constraints with `extends`
✅ Default parameters for common cases
✅ Let inference work (`first([1,2,3])`)
✅ Utility types for common patterns

## Related Rules

- `typescript-interfaces-types.md` - When to use interface vs type
- `typescript-strict-mode.md` - Type safety configuration
