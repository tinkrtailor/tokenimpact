# .claude/rules/typescript-testing.md

---

paths: "\*_/_.{test,spec}.{ts,tsx}"
priority: high
related:

- typescript-error-handling.md

---

# TypeScript Testing Patterns

Write type-safe, maintainable tests.

## Problem

Untyped tests lead to:

- False positives (tests pass but types are wrong)
- Hard-to-maintain test utilities
- Brittle mocks that break silently
- Missing edge case coverage

## Required Behavior

### Core Principles

1. **Type your test utilities**
2. **Use factory functions** over fixtures
3. **Type your mocks properly**
4. **Use clear describe/it naming**
5. **Test types with expectTypeOf**

## Examples

### Good

```typescript
// Typed factory function
function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'test-id',
    name: 'Test User',
    email: 'test@example.com',
    ...overrides,
  };
}

// Factory with faker
const createTestUser = (overrides?: Partial<User>) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  ...overrides,
});

// Typed mocks
import type { Mock } from 'vitest';
const mockFetch = vi.fn() as Mock<[string], Promise<Response>>;

vi.mock('./api');
const mockedApi = vi.mocked(api);

// Clear naming
describe('InvoiceService', () => {
  describe('createInvoice', () => {
    it('should create an invoice with valid data', async () => {
      // ...
    });

    it('should throw ValidationError for invalid amount', async () => {
      // ...
    });
  });
});

// Type testing
import { expectTypeOf } from 'vitest';

test('createUser returns User type', () => {
  const user = createUser({ name: 'Test' });
  expectTypeOf(user).toMatchTypeOf<User>();
});

// Assertion helper
function expectInvoice(invoice: unknown): asserts invoice is Invoice {
  expect(invoice).toHaveProperty('id');
  expect(invoice).toHaveProperty('amount');
  expect(invoice).toHaveProperty('status');
}

// Proper isolation
describe('DatabaseService', () => {
  let db: Database;

  beforeEach(async () => {
    db = await createTestDatabase();
  });

  afterEach(async () => {
    await db.cleanup();
  });
});

// Testing errors
it('should throw NotFoundError when user does not exist', async () => {
  await expect(service.getUser('nonexistent')).rejects.toThrow(NotFoundError);
});
```

### Bad

```typescript
// Shared mutable state
const testUser = { id: "1", name: "Test" };

// Untyped mock
const mockFetch = vi.fn();

// Vague test name
it("should work", () => { ... });
```

## Anti-patterns

❌ Shared mutable test fixtures
❌ Untyped mock functions
❌ Vague test descriptions
❌ Missing error case tests
❌ Snapshot testing for frequently changing data

## Good Patterns

✅ Factory functions for test data
✅ Typed mocks with `vi.mocked()`
✅ Clear describe/it hierarchies
✅ `expectTypeOf` for type assertions
✅ Isolated tests with proper setup/teardown

## Related Rules

- `typescript-error-handling.md` - Testing error cases
