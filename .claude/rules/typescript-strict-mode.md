# .claude/rules/typescript-strict-mode.md

---

paths: "\*_/_.{ts,tsx}"
priority: critical
related:

- typescript-null-handling.md
- typescript-error-handling.md

---

# TypeScript Strict Mode and Type Safety

Always use strict TypeScript configuration for maximum type safety.

## Problem

Without strict mode:

- Implicit `any` types hide bugs
- Null/undefined errors surface at runtime
- Type assertions bypass the type system
- Refactoring becomes dangerous

## Required Behavior

### tsconfig.json Settings

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true
  }
}
```

### Best Practices

1. **Never use `any`** - Use `unknown` for truly unknown types, then narrow
2. **Avoid type assertions** - Prefer type guards
3. **Use `satisfies`** for type checking without widening
4. **Use branded types** for type-safe IDs

## Examples

### Good

```typescript
// Use unknown and narrow
function process(data: unknown) {
  if (isValidData(data)) { ... }
}

// Type guard instead of assertion
if (isUser(data)) {
  const user = data; // TypeScript knows it's User
}

// Satisfies for config objects
const config = {
  port: 3000,
  host: "localhost"
} satisfies ServerConfig;

// Branded types for IDs
type UserId = string & { readonly __brand: "UserId" };
type InvoiceId = string & { readonly __brand: "InvoiceId" };
```

### Bad

```typescript
// any hides bugs
function process(data: any) { ... }

// Type assertion bypasses checks
const user = data as User;
```

## Anti-patterns

❌ Using `any` instead of `unknown`
❌ Type assertions (`as Type`) without validation
❌ Disabling strict mode flags
❌ Using `@ts-ignore` without explanation
❌ Implicit any in function parameters

## Good Patterns

✅ `unknown` with type narrowing
✅ Type guards for runtime checks
✅ `satisfies` for type-checked object literals
✅ Branded types for domain primitives
✅ `exactOptionalPropertyTypes` for precise optionals

## Related Rules

- `typescript-null-handling.md` - Null/undefined handling with strict mode
- `typescript-error-handling.md` - Type-safe error handling
