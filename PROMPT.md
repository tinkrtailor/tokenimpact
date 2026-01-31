# Ralph Loop Prompt

## Context

0a. Study @specs/* to learn about specifications
0b. Study @.ralph/learnings.md for codebase knowledge
0c. Study @.ralph/gotchas.md to avoid known mistakes
0d. List @.ralph/decisions/ and read relevant ADRs
0e. Study @prd.json for current progress and task priorities

## Task

1. Choose the highest priority pending task (lowest priority number)
2. Search codebase before implementing (don't assume not implemented)
3. Implement the feature
4. Verify all items in the task's "verification" array pass

## Validation

5. Run quality gates in order:
   ```bash
   bun run lint && bun run build
   ```
6. If any step fails, fix before proceeding - do NOT commit broken code
7. A task is NOT complete until `bun run build` succeeds

## Update State

8. Update @prd.json - move completed task to "completed" array with completion notes
9. If you learned something new, add it to @.ralph/learnings.md
10. If you made a mistake and fixed it, document in @.ralph/gotchas.md
11. If you made an architectural decision, create ADR in @.ralph/decisions/
12. Git commit with conventional commit message
13. If all tasks complete (tasks array empty), output <promise>COMPLETE</promise>

## Rules

- DO NOT implement placeholder or minimal implementations
- DO NOT assume code is not implemented - search first
- ONE task per loop iteration
- Run tests for changed code before committing
- ALL verification steps must pass before marking complete
