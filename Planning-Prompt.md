# Planning Loop Prompt

## Context

0a. Study @specs/SPECS.md for project overview
0b. Study all specs in @specs/*.md for detailed requirements
0c. Study @.ralph/learnings.md for discovered patterns
0d. Study @.ralph/gotchas.md for known pitfalls
0e. List @.ralph/decisions/ and read existing ADRs
0f. Study @prd.json for current task state

## Task

Use 5-10 subagents in parallel to analyze the gap between specs and implementation:

1. **Inventory source code** - Map all existing src/ files and their purposes
2. **Compare against specs** - For each spec file, identify:
   - What's implemented
   - What's missing
   - What's partially implemented (TODOs, stubs, placeholders)
3. **Find inconsistencies** - Behavior that contradicts specs
4. **Identify blockers** - Missing dependencies, unclear requirements

## Output

Create/update @prd.json with discovered tasks:

```json
{
  "id": "<category>-NNN",
  "title": "Short imperative description",
  "description": "Detailed requirements with acceptance criteria",
  "priority": 1-4,
  "status": "pending",
  "category": "setup|core|feature|polish",
  "verification": [
    "Specific testable criterion 1",
    "Specific testable criterion 2"
  ],
  "dependencies": ["task-id"]
}
```

### Priority Levels

| Priority | Meaning | Examples |
|----------|---------|----------|
| 1 | Blocker | Setup, core infrastructure, breaks build |
| 2 | Critical | Core features, main user flows |
| 3 | Important | Secondary features, edge cases |
| 4 | Polish | UX improvements, nice-to-haves |

**Priority 1 Rule:** If a blocker task has unclear requirements or multiple valid approaches, create an ADR in @.ralph/decisions/ BEFORE adding the task. Reference the ADR in the task's description.

### Verification Criteria Rules

- MUST be objectively testable (not "works correctly")
- MUST be specific (not "handles errors")
- Prefer: "npm run build succeeds", "API returns X when given Y", "UI displays X"

## Decisions

If planning reveals architectural choices needed:

1. Create ADR in @.ralph/decisions/NNN-title.md
2. Use format: Context → Decision → Consequences
3. Reference ADR id in related task descriptions

## Guardrails

- DO NOT create vague tasks ("improve error handling")
- DO NOT create overly broad tasks (break into smaller units)
- DO NOT duplicate existing tasks in prd.json
- DO NOT include time estimates
- EVERY task MUST have ≥2 verification criteria
- Tasks should be completable in ONE implementation loop

## Validation

Before committing:
1. Verify @prd.json is valid JSON (no syntax errors)
2. Verify every task has: id, title, description, priority, status, category, verification (≥2), dependencies
3. Verify no duplicate task ids
4. Verify dependencies reference existing task ids

## State Update

1. Update @prd.json with new/modified tasks
2. If you discovered codebase patterns, add to @.ralph/learnings.md
3. If you found potential pitfalls, add to @.ralph/gotchas.md
4. Git commit: `docs(prd): update task list from planning session`

## Completion

After committing, output summary:
- New tasks added: N
- Tasks updated: N
- ADRs created: N

If no gaps found (specs fully implemented), output:
<promise>COMPLETE</promise>
