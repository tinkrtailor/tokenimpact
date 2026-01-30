# .claude/rules/nextjs-components.md

---

paths: "**/*.{ts,tsx}"
priority: normal
related:

- nextjs-app-router.md
- nextjs-data-fetching.md
- typescript-interfaces-types.md

---

# Next.js Component Patterns

Component organization and patterns for Next.js.

## Problem

Poor component organization causes:

- Unnecessary client JavaScript
- Hard-to-maintain code
- Type safety issues
- Poor reusability

## Required Behavior

### Core Principles

1. **Separate Server and Client Components**
2. **Push Client Components down the tree**
3. **Pass Server data to Client via props**
4. **Use composition for flexibility**
5. **Type component props explicitly**

## Examples

### Good

```typescript
// Component organization
components/
├── server/           # Server-only components
│   ├── InvoiceList.tsx
│   └── UserProfile.tsx
├── client/           # Client components
│   ├── Counter.tsx
│   └── Modal.tsx
└── ui/               # Shared UI primitives
    ├── Button.tsx
    └── Input.tsx

// Push Client Components down the tree
async function DashboardPage() {
  const data = await getData();
  return (
    <div>
      <StaticHeader />           {/* Server */}
      <DataTable data={data} />  {/* Server */}
      <InteractiveChart data={data} /> {/* Client */}
    </div>
  );
}

// Pass Server data to Client via props
// page.tsx (Server)
async function Page() {
  const user = await getUser();
  return <UserDropdown user={user} />;
}

// UserDropdown.tsx (Client)
"use client";
export function UserDropdown({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  return <Dropdown user={user} open={open} />;
}

// Composition with slots
function Card({ header, children, footer }) {
  return (
    <div className="card">
      <div className="card-header">{header}</div>
      <div className="card-body">{children}</div>
      <div className="card-footer">{footer}</div>
    </div>
  );
}

// Loading states with useFormStatus
"use client";

import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending}>
      {pending ? "Submitting..." : "Submit"}
    </button>
  );
}

// forwardRef for reusable components
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", children, ...props }, ref) => {
    return (
      <button ref={ref} className={styles[variant]} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

// Explicit prop types
interface InvoiceCardProps {
  invoice: Invoice;
  onSelect?: (id: string) => void;
  className?: string;
}

export function InvoiceCard({
  invoice,
  onSelect,
  className,
}: InvoiceCardProps) {
  // ...
}

// Extending HTML element props
interface InputProps extends React.ComponentPropsWithoutRef<"input"> {
  label: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <div>
      <label>{label}</label>
      <input {...props} />
      {error && <span className="error">{error}</span>}
    </div>
  );
}

// Memoize expensive components
"use client";

import { memo } from "react";

export const ExpensiveList = memo(function ExpensiveList({
  items,
}: {
  items: Item[];
}) {
  return items.map((item) => <ExpensiveItem key={item.id} item={item} />);
});
```

### Bad

```typescript
// Client Component at the top of tree
"use client";

export default function Page() {
  // Everything below is now client-side
  return <Dashboard />;
}

// Missing prop types
export function InvoiceCard({ invoice, onSelect }) {
  // No type safety
}

// Not using forwardRef for form elements
export function Input(props) {
  return <input {...props} />; // Can't use ref
}
```

## Anti-patterns

❌ "use client" at page level
❌ Missing explicit prop types
❌ Not using forwardRef for form elements
❌ Fetching in Client when Server works
❌ Not memoizing expensive Client Components

## Good Patterns

✅ Server Components by default
✅ Client Components pushed down
✅ Explicit TypeScript prop interfaces
✅ `forwardRef` for form elements
✅ `memo` for expensive Client Components
✅ Composition with slots

## Related Rules

- `nextjs-app-router.md` - App Router patterns
- `nextjs-data-fetching.md` - Data fetching
- `typescript-interfaces-types.md` - Type patterns
