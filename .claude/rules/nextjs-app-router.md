# .claude/rules/nextjs-app-router.md

---

paths: "app/**/*.{ts,tsx}"
priority: high
related:

- nextjs-data-fetching.md
- nextjs-components.md

---

# Next.js App Router Patterns

Best practices for Next.js 14+ App Router.

## Problem

Incorrect App Router usage causes:

- Unnecessary client-side JavaScript
- Poor performance from wrong component types
- Broken streaming and loading states
- Confusing file structure

## Required Behavior

### Core Principles

1. **Use Server Components by default**
2. **Mark Client Components explicitly**
3. **Use correct file conventions**
4. **Implement loading states**
5. **Handle errors gracefully**

## Examples

### Good

```typescript
// app/users/page.tsx (Server Component - default)
async function UsersPage() {
  const users = await db.users.findMany();
  return <UserList users={users} />;
}

export default UsersPage;

// components/Counter.tsx (Client Component - explicit)
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### File Conventions

```
app/
├── layout.tsx      # Root layout (required)
├── page.tsx        # Home page
├── loading.tsx     # Loading UI
├── error.tsx       # Error UI
├── not-found.tsx   # 404 UI
└── users/
    ├── page.tsx    # /users
    ├── [id]/
    │   └── page.tsx # /users/:id
    └── layout.tsx   # Nested layout
```

```typescript
// app/users/loading.tsx
export default function Loading() {
  return <UsersSkeleton />;
}

// app/users/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// app/api/users/route.ts (Route Handler)
import { NextResponse } from "next/server";

export async function GET() {
  const users = await db.users.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await db.users.create(body);
  return NextResponse.json(user, { status: 201 });
}

// app/actions.ts (Server Actions)
"use server";

import { revalidatePath } from "next/cache";

export async function createInvoice(formData: FormData) {
  const amount = formData.get("amount");
  await db.invoices.create({ amount });
  revalidatePath("/invoices");
}

// Caching strategies
const data = await fetch(url, { cache: "force-cache" }); // Cached indefinitely
const data = await fetch(url, { next: { revalidate: 60 } }); // Revalidate every 60s
const data = await fetch(url, { cache: "no-store" }); // No cache

// Parallel Routes
app/
└── dashboard/
    ├── @sidebar/
    │   └── page.tsx
    ├── @main/
    │   └── page.tsx
    └── layout.tsx

// Intercepting Routes (modals)
app/
├── invoices/
│   └── [id]/
│       └── page.tsx      # Full page
└── @modal/
    └── (.)invoices/
        └── [id]/
            └── page.tsx  # Modal overlay
```

### Bad

```typescript
// Using useState in Server Component
export default function Page() {
  const [data, setData] = useState([]); // Error!
}

// Missing "use client" for interactive component
export function Counter() {
  const [count, setCount] = useState(0); // Error!
}
```

## Anti-patterns

❌ Using hooks in Server Components
❌ Missing "use client" directive
❌ Forgetting loading.tsx for slow data
❌ Not handling errors with error.tsx
❌ Using Route Handlers when Server Actions work

## Good Patterns

✅ Server Components by default
✅ Explicit "use client" only when needed
✅ loading.tsx for suspense boundaries
✅ error.tsx for error handling
✅ Server Actions for mutations

## Related Rules

- `nextjs-data-fetching.md` - Data fetching patterns
- `nextjs-components.md` - Component organization
