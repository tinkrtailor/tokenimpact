# Meta Rules - Creating New Rules

When you identify a pattern, convention, or best practice that should be followed consistently, create a new rule in `.claude/rules/`.

## When to Create a Rule

- You notice yourself repeating the same guidance
- A pattern should be applied consistently across the codebase
- A mistake was made that should be prevented in the future
- A library or framework has specific conventions

## Rule File Structure

```markdown
---
paths: **/*.ts  # Optional: scope to specific files
---

# Rule Title

Brief description of what this rule covers.

## Section 1

Content with examples...

## Section 2

More content...
```

## Naming Convention

- Use lowercase with hyphens: `typescript-error-handling.md`
- Prefix language-specific rules: `typescript-`, `react-`, `next-`
- Use descriptive names that indicate the rule's purpose

## Rule Content Guidelines

1. **Be specific** - Include concrete examples
2. **Show good and bad** - Contrast what to do vs. what to avoid
3. **Explain why** - Help understand the reasoning
4. **Keep focused** - One concern per rule file
5. **Include code examples** - Demonstrate the pattern

## Organizing Rules

Use subdirectories for related rules:

```
.claude/rules/
├── auto-commit.md
├── meta-rules.md
├── testing-philosophy.md
├── typescript-error-handling.md
├── react-components.md
└── next-api-routes.md
```

## Iterating on Rules

Periodically review and improve rules:

1. Are they being followed?
2. Are they still relevant?
3. What's missing?
4. What's redundant?

Loop the rules back for self-improvement:

```
Look at the rules in @.claude/rules/
What is missing? What does not follow best practice?
```
