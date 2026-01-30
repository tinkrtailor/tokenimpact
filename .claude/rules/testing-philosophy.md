# Testing Philosophy

General principles for what, when, and how much to test.

## The Testing Pyramid

```
        /\
       /  \      E2E Tests (few)
      /----\     - Full system, slow, brittle
     /      \
    /--------\   Integration Tests (some)
   /          \  - Module boundaries, real dependencies
  /------------\
 /              \ Unit Tests (many)
/________________\- Single function/module, fast, isolated
```

**Ratio guideline:** ~70% unit, ~20% integration, ~10% E2E

## What to Test

### Always Test

- **Public API** - Every public function should have tests
- **Edge cases** - Empty inputs, boundaries, overflow
- **Error paths** - Invalid inputs, failures, timeouts
- **Business logic** - Core domain rules
- **Bug fixes** - Add a test that would have caught it

### Don't Over-Test

- **Private implementation details** - Test behavior, not internals
- **Simple getters/setters** - Unless they have logic
- **Framework code** - Trust your dependencies
- **Generated code** - Test the generator, not the output

## When to Write Tests

### Test-First (TDD) - Use When:

- Requirements are clear and well-defined
- Building complex business logic
- Fixing a bug (write failing test first)
- Designing a public API

### Test-After - Acceptable When:

- Exploring/prototyping (but add tests before merging)
- Requirements are uncertain
- Spiking a technical approach

### Always Before Merge

No code merges without tests for:
- New features
- Bug fixes
- Behavior changes

## Test Quality

### Good Tests Are:

```
F - Fast        (milliseconds, not seconds)
I - Isolated    (no shared state, order-independent)
R - Repeatable  (same result every time)
S - Self-validating (pass/fail, no manual checking)
T - Timely      (written close to the code)
```

### Test One Thing

```typescript
// Bad: testing multiple behaviors
test('user', () => {
  const user = new User('alice');
  expect(user.name).toBe('alice');        // Creation
  user.setEmail('a@b.com');
  expect(user.email).toBe('a@b.com');     // Email setting
  expect(user.validate()).toBe(true);      // Validation
});

// Good: separate tests
test('new user has correct name', () => { });

test('setEmail updates email', () => { });

test('valid user passes validation', () => { });
```

### Test Behavior, Not Implementation

```typescript
// Bad: testing implementation
test('cache uses Map internally', () => {
  // Brittle - breaks if we change data structure
});

// Good: testing behavior
test('cache returns previously stored value', () => {
  const cache = new Cache();
  cache.set('key', 'value');
  expect(cache.get('key')).toBe('value');
});
```

## Test Naming

Use descriptive names that read like sentences:

```typescript
test('parseAmount returns null for empty string', () => { });

test('validateAmount throws for negative values', () => { });

test('cache returns undefined for expired entries', () => { });
```

## Coverage Guidelines

| Type | Target | Notes |
|------|--------|-------|
| Core business logic | 90%+ | Critical paths |
| Public API | 80%+ | All functions |
| Error handling | 80%+ | All error branches |
| Overall | 70%+ | Reasonable baseline |

**Coverage is a metric, not a goal.** 100% coverage with bad tests is worse than 70% with good tests.

## Testing Anti-Patterns

### Avoid

- **Testing the mock** - Verify behavior, not mock setup
- **Flaky tests** - Fix or delete; they erode trust
- **Slow tests** - Mock external dependencies
- **Test interdependence** - Each test should run alone
- **Commented-out tests** - Delete or fix them
- **Ignoring failures** - `test.skip()` needs a reason and ticket

### Red Flags

- Tests that only pass in certain order
- Tests that fail on CI but pass locally
- Tests that require manual setup
- Tests longer than the code they test
