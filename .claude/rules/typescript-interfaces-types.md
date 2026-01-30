# .claude/rules/typescript-interfaces-types.md

---

paths: "\*_/_.{ts,tsx}"
priority: normal
related:

- typescript-generics.md
- typescript-strict-mode.md

---

# TypeScript Interface vs Type Usage

Choose the right abstraction for your type definitions.

## Problem

Inconsistent usage of interface vs type:

- Makes code harder to understand
- Misses language feature benefits
- Creates unnecessary complexity

## Required Behavior

### Use `interface` For

1. **Object shapes that may be extended**
2. **Public API contracts**
3. **Declaration merging** (when needed)

### Use `type` For

1. **Unions and intersections**
2. **Mapped and conditional types**
3. **Tuples**
4. **Function types**
5. **Primitive aliases and branded types**

## Examples

### Good

```typescript
// Interface for extendable shapes
interface User {
  id: string;
  name: string;
}

interface AdminUser extends User {
  permissions: string[];
}

// Interface for contracts
interface Repository<T> {
  find(id: string): Promise<T | undefined>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}

// Type for unions
type Status = 'pending' | 'active' | 'completed';
type Result<T> = Success<T> | Failure;

// Type for mapped types
type Readonly<T> = { readonly [K in keyof T]: T[K] };

// Type for tuples
type Coordinate = [number, number];

// Type for functions
type Handler = (event: Event) => void;

// Type for branded primitives
type UserId = string & { readonly __brand: 'UserId' };

// Combining both
interface BaseUser {
  id: string;
  name: string;
}

type UserWithRole = BaseUser & {
  role: 'admin' | 'user' | 'guest';
};
```

### Bad

```typescript
// Interface for union (can't do this)
interface Status = "pending" | "active"; // Error!

// Prefixing with I
interface IUser { ... } // Don't do this
```

## Anti-patterns

❌ Using interface for unions/intersections
❌ Prefixing interfaces with "I"
❌ Inconsistent style within a codebase
❌ Using type for extendable contracts

## Good Patterns

✅ Interface for object shapes and contracts
✅ Type for unions, tuples, and mapped types
✅ PascalCase for both
✅ Export types that are part of public API
✅ Consistent style per codebase

## Related Rules

- `typescript-generics.md` - Generic type patterns
- `typescript-strict-mode.md` - Type safety configuration
