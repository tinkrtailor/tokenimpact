# Auto Commit Rule

After each meaningful change, automatically create a git commit.

## Commit Convention

Use **Conventional Commits** format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `chore` | Maintenance tasks |
| `ci` | CI/CD changes |

### Scope

Use the module or component name (e.g., `parser`, `cli`, `api`).

### Examples

```
feat(parser): add support for multi-line strings
fix(cli): handle missing config file gracefully
docs(readme): update installation instructions
refactor(core): extract validation logic into separate module
test(api): add integration tests for auth endpoints
```

## When to Commit

- After implementing a single logical unit of work
- After fixing a bug
- After adding or updating tests
- After each file that compiles successfully

## Process

1. Stage changed files with `git add`
2. Write commit message following convention
3. Commit with `git commit`
4. Do NOT push unless explicitly asked
