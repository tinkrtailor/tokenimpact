# How to Write Prompts for Ralph

A guide to crafting effective prompts for the Ralph Wiggum technique.

## The Anatomy of a Ralph Prompt

Every Ralph prompt has four sections:

```
┌─────────────────────────────────────┐
│  1. CONTEXT                         │  What Ralph needs to know
│     - Specs, learnings, progress    │
├─────────────────────────────────────┤
│  2. TASK                            │  What Ralph should do
│     - One thing per loop            │
├─────────────────────────────────────┤
│  3. VALIDATION                      │  How to verify success
│     - Tests, build, lint            │
├─────────────────────────────────────┤
│  4. STATE UPDATE                    │  What to record
│     - Progress, learnings, commit   │
└─────────────────────────────────────┘
```

---

## Section 1: Context

Load Ralph's memory at the start of each loop.

### What to Include

```markdown
# Context
0a. Study @specs/* to learn about specifications
0b. Study @.ralph/learnings.md for codebase knowledge
0c. Study @.ralph/gotchas.md to avoid known mistakes
0d. List @.ralph/decisions/ and read relevant ADRs
0e. Study @prd.json for current progress and task priorities
```

### Why Each Part Matters

| Context | Purpose |
|---------|---------|
| `@specs/*` | What to build (functional requirements) |
| `@.ralph/learnings.md` | Codebase patterns discovered in prior loops |
| `@.ralph/gotchas.md` | Mistakes to avoid repeating |
| `@.ralph/decisions/` | Architectural decisions already made |
| `@prd.json` | Task priorities, status, and verification criteria |

### Context Loading Tips

- **Be specific when possible**: `@specs/auth.md` vs `@specs/*`
- **Use "List" for directories**: `List @.ralph/decisions/` lets Ralph see what exists without reading everything
- **Order matters**: Load specs before progress so Ralph understands the goal first

---

## Section 2: Task

Tell Ralph what to do. **One thing per loop.**

### Good Task Instructions

```markdown
# Task
1. Choose the highest priority pending task from @prd.json (lowest priority number)
2. Search codebase before implementing (don't assume not implemented)
3. Implement the feature
4. Verify ALL items in the task's verification array pass
```

### The Golden Rule: One Task Per Loop

Why? Context window management.

```markdown
# Bad - too many tasks
Implement authentication, then add the API endpoints,
then create the UI components, then write tests for everything.

# Good - one task
Choose the highest priority pending task from @prd.json
and implement it fully before moving on.
```

### Task Selection Strategies

**Let Ralph choose (recommended for AFK):**
```markdown
Choose the pending task with lowest priority number from @prd.json.
If multiple tasks have the same priority, prefer those with fewer dependencies.
```

**Explicit task (for focused work):**
```markdown
Implement the task with id "auth-001" from @prd.json
```

**Category-scoped:**
```markdown
Work on the highest priority pending task in the "core" category from @prd.json.
```

### Preventing Bad Behavior

Add explicit guardrails:

```markdown
# Guardrails
- Search codebase before implementing (don't assume not implemented)
- DO NOT implement placeholder or minimal implementations
- If blocked, document in @.ralph/gotchas.md, add blocker note to task in @prd.json, and move to next task
```

---

## Section 3: Validation

Define the feedback loop. This is what makes Ralph self-correcting.

### Basic Validation

```markdown
# Validation
Run feedback loops before committing:
1. cargo fmt
2. cargo clippy -- -D warnings
3. cargo test

Do NOT commit if any step fails. Fix first.
```

### Language-Specific Examples

**Rust:**
```markdown
cargo fmt && cargo clippy -- -D warnings && cargo test
```

**TypeScript:**
```markdown
npm run typecheck && npm run lint && npm run test
```

**Python:**
```markdown
ruff check . && mypy . && pytest
```

### Extended Validation

For higher quality, add more checks:

```markdown
# Validation
1. cargo fmt
2. cargo clippy -- -D warnings
3. cargo test
4. cargo doc --no-deps (must have no warnings)
5. If adding public API, ensure doc comments exist
```

### Validation Tips

- **Order matters**: Format before lint, lint before test
- **Fail fast**: Run quick checks first
- **Be explicit**: "Do NOT commit if any step fails"

---

## Section 4: State Update

Record what happened for future loops.

### Basic State Update

```markdown
# Update State
5. Update @prd.json - move completed task to "completed" array with notes
6. If you learned something new, add to @.ralph/learnings.md
7. If you made a mistake and fixed it, document in @.ralph/gotchas.md
8. If you made an architectural decision, create ADR in @.ralph/decisions/
9. Git commit with conventional commit message
```

### Completion Signal

For AFK loops, add a termination condition:

```markdown
10. If tasks array in @prd.json is empty (all moved to completed), output:
    <promise>COMPLETE</promise>
```

### Commit Instructions

Be specific about commit format:

```markdown
Git commit with conventional commit message:
- feat(scope): description - for new features
- fix(scope): description - for bug fixes
- refactor(scope): description - for refactoring
- test(scope): description - for tests
- docs(scope): description - for documentation
```

---

## Complete Prompt Templates

### Implementation Loop (Standard)

```markdown
# Context
0a. Study @specs/* to learn about specifications
0b. Study @.ralph/learnings.md for codebase knowledge
0c. Study @.ralph/gotchas.md to avoid known mistakes
0d. List @.ralph/decisions/ and read relevant ADRs
0e. Study @prd.json for current progress and task priorities

# Task
1. Choose the highest priority pending task (lowest priority number)
2. Search codebase before implementing (don't assume not implemented)
3. Implement the feature fully
4. Verify ALL items in the task's verification array pass

# Validation
5. Run: cargo fmt && cargo clippy -- -D warnings && cargo test
6. Do NOT commit if validation fails - fix first

# Update State
7. Update @prd.json - move completed task to "completed" array
8. If you learned something, add to @.ralph/learnings.md
9. If you hit a gotcha, document in @.ralph/gotchas.md
10. If you made an architectural decision, create ADR in @.ralph/decisions/
11. Git commit with conventional commit message
12. If tasks array empty, output <promise>COMPLETE</promise>

# Rules
- ONE task per loop
- NO placeholder implementations
- Search before assuming not implemented
- ALL verification steps must pass before marking complete
```

### Planning Loop

```markdown
# Context
Study @specs/* and existing source code in src/
Study @.ralph/learnings.md and @.ralph/gotchas.md
List @.ralph/decisions/ for existing ADRs

# Task
Use subagents to:
1. Compare source against specifications
2. Find TODOs, placeholders, minimal implementations
3. Identify missing functionality
4. Check for inconsistencies

# Output
Create/update @prd.json with tasks including:
- id: unique identifier (category-NNN)
- title: short description
- description: detailed requirements
- priority: 1 (blockers) to 4 (polish)
- status: "pending"
- category: setup, core, feature, polish
- verification: array of specific testable criteria
- dependencies: array of task ids

If architectural decisions are needed, create ADRs in @.ralph/decisions/
```

### Bug Fix Loop

```markdown
# Context
Study @.ralph/gotchas.md for known issues
Study the error message or bug report below:

[PASTE ERROR OR BUG DESCRIPTION]

# Task
1. Reproduce the issue (write a failing test first)
2. Find the root cause
3. Fix the issue
4. Verify the test passes

# Validation
cargo test [specific_test_name]
cargo test (full suite)

# Update State
- Add the fix to @.ralph/gotchas.md with DON'T/DO format
- If this was a task in @prd.json, move it to completed
- Git commit: fix(scope): description
```

### Test Coverage Loop

```markdown
# Context
Study @.ralph/learnings.md for testing patterns that work
Run: cargo llvm-cov --text to see current coverage

# Task
1. Identify uncovered code paths
2. Write tests for the most critical paths first
3. Focus on: error handling, edge cases, public API

# Validation
cargo test
cargo llvm-cov --text (verify coverage increased)

# Update State
- Document testing patterns in @.ralph/learnings.md
- Git commit: test(scope): description
```

---

## Prompt Tuning

### When Ralph Goes Off Track

**Problem: Implementing things twice**
```markdown
# Add to prompt:
IMPORTANT: Search codebase before implementing.
Do NOT assume a feature is not implemented.
Use grep/find to verify before writing new code.
```

**Problem: Placeholder implementations**
```markdown
# Add to prompt:
DO NOT implement placeholder, stub, or minimal implementations.
Every implementation must be complete and functional.
If you cannot complete something, document why in @.ralph/gotchas.md
```

**Problem: Ignoring test failures**
```markdown
# Add to prompt:
If tests fail, you MUST fix them before committing.
Do NOT skip, ignore, or delete failing tests.
```

**Problem: Not committing**
```markdown
# Add to prompt:
After EACH completed task, create a git commit.
Do not batch multiple tasks into one commit.
```

**Problem: Context rot (quality degrades)**
```markdown
# Solutions:
- Make tasks smaller
- Use more subagents for exploration
- Clear context more frequently (shorter loops)
```

### Adjusting Verbosity

**More verbose (debugging):**
```markdown
Before each step, explain your reasoning.
After each step, summarize what you did and why.
```

**Less verbose (speed):**
```markdown
Work silently. Only output errors and the final commit message.
```

---

## Anti-Patterns

### Don't Do This

```markdown
# Too vague
Make the code better.

# Too broad
Implement all the features.

# No validation
Just write the code, don't worry about tests.

# No state update
Don't bother updating prd.json.
```

### Why These Fail

| Anti-Pattern | Problem |
|--------------|---------|
| Vague tasks | Ralph has no clear goal, wanders |
| Broad scope | Context window fills up, quality drops |
| No validation | Errors compound across loops |
| No state update | Each loop starts blind |

---

## Iteration Strategy

### Start Restrictive, Loosen Over Time

**Early loops (foundation):**
```markdown
- ONE task per loop
- Must search before implementing
- Full test coverage required
```

**Later loops (velocity):**
```markdown
- Up to 3 related tasks per loop
- Can assume patterns from @.ralph/learnings.md
- Tests for public API only
```

### When to Reset

If Ralph is consistently failing:

1. Stop the loop
2. Review recent commits
3. Check @.ralph/gotchas.md for patterns
4. Adjust the prompt
5. Consider `git reset --hard` to known-good state
6. Restart with refined prompt

---

## Checklist: Is Your Prompt Ready?

- [ ] **Context**: Loads specs, learnings, gotchas, decisions, prd.json
- [ ] **Task**: Clear, single objective with verification criteria
- [ ] **Validation**: Explicit feedback loop (format, lint, test)
- [ ] **State Update**: Records progress in prd.json, learnings, commits
- [ ] **Guardrails**: Prevents known bad behaviors
- [ ] **Termination**: Has completion signal for AFK mode (tasks array empty)
