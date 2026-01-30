# .claude/rules/typescript-zod-validation.md

---

paths: "\*_/_.{ts,tsx}"
priority: high
related:

- typescript-strict-mode.md

---

# TypeScript Validation with Zod

Use Zod for runtime validation with full type inference.

## Problem

Without runtime validation:

- Invalid data causes runtime errors deep in code
- Types only exist at compile time
- External data (API, user input) is unvalidated
- Type assertions bypass safety

## Required Behavior

### Core Principles

1. **Define schemas, infer types**
2. **Validate at system boundaries**
3. **Use safeParse** for error handling
4. **Compose schemas** with extend and merge
5. **Create reusable schema components**

## Examples

### Good

```typescript
import { z } from 'zod';

// Define schema, infer type
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

type User = z.infer<typeof UserSchema>;

// Validate at boundaries
app.post('/users', async (req, res) => {
  const result = UserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }
  const user = result.data; // Typed as User
});

// safeParse for error handling
const result = UserSchema.safeParse(data);
if (!result.success) {
  console.error(result.error.issues);
  return;
}
const user = result.data;

// Compose with extend
const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const UserSchema = BaseEntitySchema.extend({
  name: z.string(),
  email: z.string().email(),
});

// Transform data
const DateStringSchema = z.string().transform((s) => new Date(s));

const FormDataSchema = z.object({
  amount: z.string().transform(Number),
  date: DateStringSchema,
});

// Reusable components
export const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
  postalCode: z.string(),
});

export const MoneySchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'GBP']),
});

// Discriminated unions
const PaymentMethodSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('card'), cardNumber: z.string() }),
  z.object({ type: z.literal('bank'), accountNumber: z.string() }),
  z.object({ type: z.literal('crypto'), walletAddress: z.string() }),
]);

// Custom error messages
const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');
```

### Bad

```typescript
// parse throws on invalid data
const user = UserSchema.parse(data); // Throws!

// Type assertion without validation
const user = data as User;

// Manual validation
if (typeof data.name !== "string") { ... }
```

## Anti-patterns

❌ Using `parse()` without try/catch
❌ Type assertions (`as`) for external data
❌ Manual validation instead of schemas
❌ Duplicating validation logic
❌ Not validating at system boundaries

## Good Patterns

✅ `safeParse()` for error handling
✅ `z.infer<typeof Schema>` for types
✅ Reusable schema components
✅ `discriminatedUnion` for variants
✅ `transform` for data conversion
✅ Custom error messages

## Related Rules

- `typescript-strict-mode.md` - Type safety configuration
