# .claude/rules/nextjs-data-fetching.md

---

paths: "app/**/*.{ts,tsx}"
priority: high
related:

- nextjs-app-router.md
- nextjs-components.md

---

# Next.js Data Fetching Patterns

Efficient data fetching in Next.js App Router.

## Problem

Poor data fetching leads to:

- Unnecessary API calls
- Waterfall requests
- Stale data
- Poor user experience

## Required Behavior

### Core Principles

1. **Fetch in Server Components**
2. **Use React cache** for deduplication
3. **Implement parallel data fetching**
4. **Use Suspense for streaming**
5. **Implement proper revalidation**

## Examples

### Good

```typescript
// Fetch directly in Server Component
// app/invoices/page.tsx
async function InvoicesPage() {
  // Direct database access - no API call needed
  const invoices = await db.invoices.findMany({
    where: { userId: session.userId },
  });

  return <InvoiceList invoices={invoices} />;
}

// React cache for deduplication
import { cache } from "react";

export const getUser = cache(async (id: string) => {
  return db.users.findUnique({ where: { id } });
});

// Multiple calls in same request are deduplicated
const user1 = await getUser("123");
const user2 = await getUser("123"); // Returns cached result

// Parallel data fetching
async function DashboardPage() {
  // Start all fetches in parallel
  const invoicesPromise = getInvoices();
  const statsPromise = getStats();
  const userPromise = getUser();

  // Wait for all
  const [invoices, stats, user] = await Promise.all([
    invoicesPromise,
    statsPromise,
    userPromise,
  ]);

  return <Dashboard invoices={invoices} stats={stats} user={user} />;
}

// Suspense for streaming
import { Suspense } from "react";

async function Page() {
  return (
    <div>
      <Header />
      <Suspense fallback={<InvoicesSkeleton />}>
        <InvoiceList />
      </Suspense>
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
    </div>
  );
}

// Revalidation strategies
// Time-based
export const revalidate = 60; // Revalidate every 60 seconds

// On-demand
import { revalidatePath, revalidateTag } from "next/cache";

export async function updateInvoice(id: string, data: InvoiceData) {
  await db.invoices.update({ where: { id }, data });
  revalidatePath("/invoices");
  revalidateTag("invoices");
}

// Fetch with tags for granular caching
const invoices = await fetch("/api/invoices", {
  next: { tags: ["invoices", `user-${userId}`] },
});

// Handle not found
async function InvoicePage({ params }: { params: { id: string } }) {
  const invoice = await getInvoice(params.id);

  if (!invoice) {
    notFound(); // Renders not-found.tsx
  }

  return <InvoiceDetail invoice={invoice} />;
}

// Server Actions for mutations
// app/invoices/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createInvoice(formData: FormData) {
  const data = Object.fromEntries(formData);
  const validated = InvoiceSchema.parse(data);

  await db.invoices.create({ data: validated });

  revalidatePath("/invoices");
  redirect("/invoices");
}

// Optimistic updates
"use client";

import { useOptimistic } from "react";

function InvoiceList({ invoices }) {
  const [optimisticInvoices, addOptimistic] = useOptimistic(
    invoices,
    (state, newInvoice) => [...state, newInvoice]
  );

  async function handleCreate(data) {
    addOptimistic({ ...data, id: "temp", status: "pending" });
    await createInvoice(data);
  }
}
```

### Bad

```typescript
// Fetching in Client Component when Server would work
'use client';
import { useEffect, useState } from 'react';

export function InvoiceList() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetch('/api/invoices')
      .then((r) => r.json())
      .then(setInvoices);
  }, []);
}

// Waterfall requests
const user = await getUser(id);
const orders = await getOrders(id); // Waits for user
const stats = await getStats(id); // Waits for orders
```

## Anti-patterns

❌ useEffect for data that can be Server Component
❌ Sequential fetches for independent data
❌ Not using React cache for shared queries
❌ Missing Suspense boundaries
❌ Not revalidating after mutations

## Good Patterns

✅ Fetch in Server Components
✅ React `cache()` for deduplication
✅ `Promise.all()` for parallel fetches
✅ Suspense for streaming
✅ `revalidatePath/Tag` after mutations
✅ `useOptimistic` for instant feedback

## Related Rules

- `nextjs-app-router.md` - App Router conventions
- `nextjs-components.md` - Component patterns
