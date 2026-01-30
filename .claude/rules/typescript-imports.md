# .claude/rules/typescript-imports.md

---

paths: "\*_/_.{ts,tsx}"
priority: normal
related: []

---

# TypeScript Import/Export Patterns

Organize imports and exports for maintainability and tree-shaking.

## Problem

Poor import organization causes:

- Circular dependencies
- Poor tree-shaking (larger bundles)
- Inconsistent import styles
- Hard-to-navigate code

## Required Behavior

### Core Principles

1. **Use named exports** over default exports
2. **Use type-only imports** for types
3. **Organize imports consistently**
4. **Use barrel files sparingly**
5. **Avoid circular imports**

## Examples

### Good

```typescript
// Named exports (easier to refactor)
export class UserService { ... }
export function createUser() { ... }

// Type-only imports (helps bundlers)
import type { User, UserRole } from "./types";
import { createUser } from "./users";

// Inline type imports
import { createUser, type User } from "./users";

// Organized imports
// 1. External dependencies
import { useState } from "react";
import { z } from "zod";

// 2. Internal absolute imports
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

// 3. Relative imports
import { UserCard } from "./UserCard";
import type { UserProps } from "./types";

// Barrel files (use sparingly)
// components/index.ts
export { Button } from "./Button";
export { Input } from "./Input";

// Path aliases
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"]
    }
  }
}

// Library entry point
// src/index.ts
export { Client } from "./client";
export { createInvoice, payInvoice } from "./invoice";
export type { Invoice, InvoiceStatus } from "./types";
```

### Bad

```typescript
// Default exports (harder to refactor)
export default class UserService { ... }

// Mixed value and type imports
import { User, createUser } from "./users"; // User is type only

// Deep barrel files hurt tree-shaking
import { everything } from "@/utils"; // Pulls in everything
```

## Anti-patterns

❌ Default exports for regular modules
❌ Importing types without `type` keyword
❌ Deep barrel files that import everything
❌ Circular imports between modules
❌ Inconsistent import ordering

## Good Patterns

✅ Named exports for everything
✅ `import type` for type-only imports
✅ Consistent import ordering (external → absolute → relative)
✅ Path aliases for cleaner imports
✅ Single entry point for libraries

## Related Rules

None.
