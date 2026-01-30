# The Ralph Wiggum Technique

A methodology for running AI coding assistants in autonomous loops to complete multi-phase projects without constant human intervention.

## Overview

Ralph Wiggum is a technique where you run an AI coding CLI (Claude Code, Copilot CLI, etc.) in a while loop, letting it autonomously work through a list of tasks. Instead of writing a new prompt for each phase of work, you run the same prompt repeatedly. The agent chooses what to work on next.

```bash
# Run inside a Docker sandbox for safety
while :; do docker sandbox run claude -p "$(cat PROMPT.md)"; done
```

### Why "Ralph Wiggum"?

The technique is "deterministically bad in an undeterministic world" - like the Simpsons character, it has predictable failure modes that can be tuned through prompt adjustments ("signs" for Ralph to read).

---

## Core Philosophy

1. **Define the end state, not the steps** - Describe what "done" looks like. Let the agent figure out how to get there.

2. **One task per loop** - Each iteration should complete exactly one logical unit of work. This prevents context rot and maintains quality.

3. **The agent chooses the task** - You define scope. Ralph decides priority and execution order.

4. **Trust eventual consistency** - Problems created by AI can be resolved through different prompts and more loops.

5. **Small steps compound** - Prefer many small commits over few large ones. Quality over speed.

---

## Architecture

### Directory Structure

```
project/
├── specs/                    # Functional specifications
│   ├── SPECS.md             # Overview linking to all specs
│   ├── feature-a.md         # One file per feature
│   ├── core/                # Subdirectories for domains
│   │   ├── auth.md
│   │   └── storage.md
│   └── api/
│       └── endpoints.md
├── CLAUDE.md                 # Main project instructions - auto-loaded by Claude
├── .claude/
│   ├── settings.json         # Project-specific settings
│   ├── commands/             # Custom slash commands
│   └── rules/                # Modular rules (auto-loaded)
│       ├── code-style.md     # Code style guidelines
│       ├── testing.md        # Testing conventions
│       └── api/              # Subdirectories for organization
│           └── endpoints.md
├── .ralph/                   # Ralph's scratchpad (learnings persist across loops)
│   ├── learnings.md          # Discoveries about the codebase
│   ├── gotchas.md            # Things that didn't work, mistakes to avoid
│   ├── decisions/            # Architectural Decision Records (ADRs)
│   │   ├── 001-example.md    # One file per decision
│   │   └── template.md       # ADR template
│   └── scratch/              # Temporary working notes
├── AGENT.md                  # How to build/run the project
├── PROMPT.md                 # The main loop prompt
├── prd.json                  # Prioritized task list with verification
└── progress.txt              # Session-specific progress log
```

### The Four Pillars

| Component | Purpose | Persists? |
|-----------|---------|-----------|
| `specs/` | What to build (functional requirements) | Yes |
| `CLAUDE.md` + `.claude/rules/` | How to build it (technical standards) | Yes |
| `prd.json` | What's left to do (prioritized tasks with verification) | Yes (until sprint complete) |
| `.ralph/` | What Ralph learned (persistent memory) | Yes |

### Collecting Specs - Conversation First

**Don't start coding. Start talking.**

The specs phase is a conversation with the LLM about what you want to build. You're shaping the LLM's understanding without asking it to implement anything yet.

#### Step 1: Describe Your Vision

Start with a high-level description:

```
We are going to create a CLI tool in Rust called "myapp".

It will:
- Parse markdown files and extract code blocks
- Support multiple output formats (JSON, YAML)
- Have a --watch mode for continuous processing

Use clap for CLI parsing and tracing for logging.

IMPORTANT: Do NOT implement anything yet. Instead, write up the
specifications into the "specs/" folder with each domain topic
as a separate markdown file. Create a "SPECS.md" in the root
that links to all specs.
```

#### Step 2: Refine Through Conversation

Ask the LLM to expand on areas:

```
Look at @specs/

New requirements:
- What error handling should we have?
- What configuration options make sense?
- What edge cases should we handle for markdown parsing?

Update the specs with this guidance.
```

Keep iterating:

```
Look at @specs/

The watch mode spec is too vague. Expand it:
- How should file changes be detected?
- What's the debounce strategy?
- How do we handle errors during watch?

Update @specs/watch-mode.md
```

#### Step 3: Loop Back for Quality

Ask the LLM to review its own specs:

```
Look at @specs/

Review these specifications:
- What is missing?
- What is ambiguous?
- What edge cases aren't covered?
- Are there contradictions between specs?

Update the specs to address any issues found.
```

#### Spec File Structure

Each spec file should include:

```markdown
# Feature Name

## Overview
Brief description of what this feature does.

## Requirements
- Requirement 1
- Requirement 2

## Behavior
Detailed behavior description.

## Edge Cases
- What happens when X?
- What happens when Y?

## Out of Scope
What this feature explicitly does NOT do.

## Dependencies
Other specs this depends on.
```

#### Example: SPECS.md Overview

```markdown
# Project Specifications

## Overview
MyApp is a CLI tool for processing markdown files.

## Specs

| Spec | Description | Status |
|------|-------------|--------|
| [core/parser](core/parser.md) | Markdown parsing logic | Draft |
| [core/output](core/output.md) | Output format handling | Draft |
| [cli/args](cli/args.md) | Command-line arguments | Draft |
| [cli/watch](cli/watch.md) | Watch mode | Draft |

## Non-Functional Requirements
- Must handle files up to 10MB
- Watch mode should use <50MB memory
- Response time <100ms for typical files
```

#### When Are Specs "Done"?

Specs are ready for implementation when:

1. **Complete** - All features have a spec
2. **Unambiguous** - No vague language ("should handle errors appropriately")
3. **Consistent** - No contradictions between specs
4. **Testable** - Each requirement can be verified
5. **Scoped** - Clear boundaries on what's included/excluded

**Don't over-spec.** Start with MVP specs, implement, then add more specs for the next increment.

### CLAUDE.md and .claude/rules/ - Your Technical Standards

Claude Code automatically reads instructions from two places:
1. `CLAUDE.md` in your project root (and subdirectories)
2. All `.md` files in `.claude/rules/` (modular rules)

#### CLAUDE.md - Main Instructions

```markdown
# Project Standards

## Code Style
- Use TypeScript strict mode
- Prefer functional components
- No `any` types

## Git Conventions
- Use conventional commits (feat:, fix:, chore:)
- Commit after each logical change
```

#### .claude/rules/ - Modular Rules

For larger projects, split rules into focused files:

```
.claude/rules/
├── code-style.md       # Formatting, naming conventions
├── testing.md          # Test patterns, coverage requirements
├── security.md         # Security requirements
└── api/
    └── endpoints.md    # API-specific rules
```

All `.md` files are auto-loaded. Use subdirectories for organization.

#### Path-Specific Rules

Rules can be scoped to specific files using YAML frontmatter:

```markdown
---
paths: src/api/**/*.ts
---

# API Development Rules

- All endpoints must include input validation
- Use the standard error response format
- Include OpenAPI documentation comments
```

Glob patterns supported:

| Pattern | Matches |
|---------|---------|
| `**/*.ts` | All TypeScript files |
| `src/**/*` | Everything under src/ |
| `src/components/*.tsx` | React components in specific dir |
| `{src,lib}/**/*.ts` | Multiple directories |

Rules without `paths` frontmatter apply to all files.

### Hooks

Claude Code supports hooks that run before/after tool execution. Configure in `.claude/settings.json`:

```json
{
  "hooks": {
    "preToolExecution": [
      {
        "matcher": "Bash",
        "command": "echo 'Running command...'"
      }
    ],
    "postToolExecution": [
      {
        "matcher": "Edit",
        "command": "npm run lint --fix"
      }
    ]
  }
}
```

Useful hooks for Ralph:
- **Post-edit linting** - auto-fix style issues after each file edit
- **Pre-commit validation** - run tests before allowing commits
- **Post-commit tagging** - auto-tag releases when tests pass

### The .ralph/ Directory - Ralph's Memory

Each loop iteration starts with a fresh context window. The `.ralph/` directory lets Ralph preserve learnings across iterations.

```
.ralph/
├── learnings.md      # Discoveries about the codebase
├── gotchas.md        # Things that didn't work, mistakes to avoid
├── decisions/        # Architectural Decision Records (ADRs)
│   ├── 001-runtime-choice.md
│   ├── 002-error-handling.md
│   └── template.md
└── scratch/          # Temporary working notes (can be messy)
```

#### learnings.md

Things Ralph discovered that future iterations should know:

```markdown
# Learnings

## Build System
- Must run `npm run codegen` before `npm run build`
- Tests require `DATABASE_URL` env var even for unit tests

## Codebase Patterns
- All API routes are in `src/routes/api/` with `+server.ts` naming
- Database queries go through `src/lib/db.ts`, never direct Prisma calls

## Dependencies
- Using date-fns v3, not v2 - API changed significantly
- Auth is handled by lucia, not next-auth
```

#### gotchas.md

Mistakes Ralph made that it shouldn't repeat:

```markdown
# Gotchas - Don't Repeat These Mistakes

## 2024-01-10
- DON'T: Import from `@prisma/client` directly
- DO: Import from `src/lib/db.ts` which re-exports with extensions

## 2024-01-11
- DON'T: Use `fs.writeFileSync` in API routes (edge runtime)
- DO: Use the blob storage helper in `src/lib/storage.ts`
```

#### decisions/ - Architecture Decision Records

Use a directory with individual files for each decision. This allows Ralph to:
- Load only relevant decisions (saves context window)
- List decisions without reading content (`ls .ralph/decisions/`)
- Link to specific decisions in prompts

**Naming convention:** `NNN-short-description.md` (e.g., `001-use-tokio-runtime.md`)

**Template (.ralph/decisions/template.md):**

```markdown
# N. Title

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Related:** specs/foo.md, PRD item-001

## Context

What is the issue that we're seeing that motivates this decision?

## Options Considered

1. **Option A** - Description
   - Pro: ...
   - Con: ...

2. **Option B** - Description
   - Pro: ...
   - Con: ...

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or harder as a result of this decision?
```

**Example (.ralph/decisions/001-use-tokio-runtime.md):**

```markdown
# 1. Use Tokio as Async Runtime

**Status:** Accepted
**Date:** 2025-01-10
**Related:** specs/core/async.md

## Context

We need an async runtime for concurrent operations. The main options
in the Rust ecosystem are Tokio and async-std.

## Options Considered

1. **Tokio** - Most popular, extensive ecosystem
   - Pro: Best documentation, most crates support it
   - Con: Heavier dependency

2. **async-std** - Mirrors std library
   - Pro: Familiar API
   - Con: Smaller ecosystem

## Decision

Use Tokio with the "full" feature set.

## Consequences

- Can use tokio-specific crates (reqwest, tonic, etc.)
- Must use `#[tokio::main]` and `#[tokio::test]`
- Team needs familiarity with Tokio patterns
```

#### Prompt Integration

Tell Ralph to use and update `.ralph/`:

```markdown
Before starting work:
1. Study @.ralph/learnings.md for codebase knowledge
2. Study @.ralph/gotchas.md to avoid known mistakes
3. List @.ralph/decisions/ and study relevant ADRs

After completing work:
- If you discovered something useful, add it to @.ralph/learnings.md
- If you made a mistake and recovered, document it in @.ralph/gotchas.md
- If you made an architectural decision, create a new ADR in @.ralph/decisions/
```

---

## The Loop Prompt

### Basic Structure

```markdown
1. Study @specs/* for functional specifications
2. Study @CLAUDE.md for technical standards
3. Study @.ralph/learnings.md, @.ralph/gotchas.md, and list @.ralph/decisions/
4. Study @prd.json for current progress and task priorities
5. Choose the highest priority pending task (lowest priority number)
6. Search codebase before implementing (don't assume not implemented)
7. Implement the feature
8. Run feedback loops (types, tests, lint)
9. Verify ALL items in the task's verification array pass
10. Update @prd.json - move completed task to "completed" array
11. Update @.ralph/ (learnings, gotchas, or create new ADR in decisions/)
12. Git commit with conventional commit message
13. If all tasks complete (tasks array empty), output <promise>COMPLETE</promise>
```

### Critical Instructions

**Prevent assumptions:**
```
Before making changes, search codebase (don't assume an item is not implemented) using parallel subagents. Think hard.
```

**Enforce quality:**
```
DO NOT IMPLEMENT PLACEHOLDER OR SIMPLE IMPLEMENTATIONS. WE WANT FULL IMPLEMENTATIONS.
```

**Capture learnings:**
```
When you learn something new about how to run the project, update @AGENT.md using a subagent.
```

**Document reasoning:**
```
When authoring tests, capture WHY the test exists and its importance in documentation.
```

---

## Feedback Loops

Feedback loops are the quality gates that prevent bad code from being committed.

| Loop | What It Catches | Priority |
|------|-----------------|----------|
| Type checker | Type mismatches, missing props | High |
| Unit tests | Broken logic, regressions | High |
| Linting | Code style, potential bugs | Medium |
| E2E tests | Integration issues | Medium |
| Pre-commit hooks | Blocks bad commits entirely | Critical |

**In the prompt:**
```
After implementing functionality, run tests for that unit of code.
If tests fail, fix before committing.
Do NOT commit if any feedback loop fails.
```

### Language Considerations

Languages with strong type systems and fast compilers work best:
- **Rust/Haskell**: Exceptional compiler errors loop back well, but slow compilation
- **TypeScript**: Good balance of types and speed
- **Python with Pyright/mypy**: Add static analysis as feedback loop
- **Dynamic languages**: Wire in static analyzers (Dialyzer for Erlang, etc.)

---

## Subagents

Subagents extend the effective context window by delegating work to fresh contexts.

### When to Use Subagents

- **Searching the codebase** - Parallel exploration
- **Writing files** - Parallel edits to independent files
- **Summarizing results** - Expensive analysis in separate context

### When NOT to Use Subagents

- **Build/test operations** - Only 1 subagent to prevent backpressure
- **Sequential dependencies** - Operations that must happen in order

**In the prompt:**
```
You may use up to 500 parallel subagents for all operations but only 1 subagent for build/tests.
```

---

## Two Operating Modes

### HITL (Human-in-the-Loop)

Run one iteration at a time, watching and intervening as needed.

```bash
# ralph-once.sh
claude -p "$(cat PROMPT.md)"
```

You're present, so no sandbox needed - you can intervene if something goes wrong.

**Best for:**
- Learning the technique
- Refining prompts
- Risky/architectural work
- Early project phases

### AFK (Away From Keyboard)

Run in a loop with a maximum iteration cap. Use Docker for isolation when unattended.

```bash
# ralph.sh
#!/bin/bash
set -e

MAX_ITERATIONS=${1:-10}
PROMPT=$(cat PROMPT.md)

for ((i=1; i<=MAX_ITERATIONS; i++)); do
  echo "=== Iteration $i of $MAX_ITERATIONS ==="

  # Stream output in real-time so you can watch progress
  result=$(docker sandbox run claude \
    -p "$PROMPT" \
    --output-format stream-json \
    2>&1 | tee /dev/stderr)

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "Complete, exiting."
    exit 0
  fi
done

echo "Reached max iterations ($MAX_ITERATIONS)"
```

Options:
- `--output-format stream-json` - streams output in real-time as JSON chunks
- `--output-format text` - waits for completion, returns plain text (default)
- Add `--dangerously-skip-permissions` if Claude prompts for permissions block the loop

The `docker sandbox` command isolates file system access to the current directory, preventing access to system files, SSH keys, and other sensitive data.

**Best for:**
- Bulk implementation work
- Low-risk tasks
- Well-defined scope
- After prompt is refined via HITL

**Always cap iterations** - Infinite loops with stochastic systems are dangerous.

---

## Task Prioritization

Without guidance, Ralph picks easy tasks. Guide it to tackle risk first:

| Priority | Task Type | Why |
|----------|-----------|-----|
| 1 | Architectural decisions | Cascade through codebase |
| 2 | Integration points | Reveals incompatibilities early |
| 3 | Unknown unknowns / spikes | Fail fast on risky work |
| 4 | Standard features | Foundation is proven |
| 5 | Polish / quick wins | Easy to slot in anytime |

**In the prompt:**
```
Choose the task YOU decide has highest priority - not necessarily first in the list.
Prioritize risky architectural work over quick wins.
```

---

## Progress Tracking

### The prd.json File

A structured task list with verification steps that Ralph maintains:

```json
{
  "project": "myapp",
  "version": "0.1.0",
  "tasks": [
    {
      "id": "auth-001",
      "title": "Implement user authentication",
      "priority": 1,
      "status": "pending",
      "category": "core",
      "verification": [
        "POST /api/login with valid creds returns 200 + JWT",
        "POST /api/login with invalid creds returns 401"
      ],
      "dependencies": []
    }
  ],
  "completed": []
}
```

### The progress.txt File

Session-specific log for context between iterations:

```
## Iteration 3 - 2025-01-10
- Completed: User authentication (specs/auth.md)
- Files changed: src/auth/*, tests/auth/*
- Decision: Used JWT over sessions for statelessness
- Blocker: None
- Next: Database migrations
```

**Delete progress.txt after each sprint** - It's session-specific, not permanent.

### PRD Items with Verification (Recommended for AFK)

The key insight from Anthropic's research on long-running agents: **don't just describe what to build, describe how to verify it's done.**

#### Schema

```json
{
  "id": "auth-001",
  "category": "functional",
  "priority": 1,
  "description": "User login with email/password",
  "verification": [
    "POST /api/login with valid creds returns 200 + JWT",
    "POST /api/login with invalid creds returns 401",
    "Empty fields return validation errors"
  ],
  "passes": false
}
```

#### Fields

| Field | Purpose |
|-------|---------|
| `id` | Unique identifier for tracking and references |
| `category` | Groups items: `functional`, `security`, `performance`, `ui` |
| `priority` | 1 (highest) to 5 (lowest) - Ralph works on lowest number first |
| `description` | What the feature is |
| `verification` | Specific, testable behaviors that define "done" |
| `passes` | `false` until ALL verification steps pass |

#### Priority Levels

| Priority | Use For | Examples |
|----------|---------|----------|
| 1 | Architectural decisions, blockers | Core abstractions, database schema |
| 2 | Integration points, risky work | API contracts, auth flow |
| 3 | Standard features | CRUD operations, UI components |
| 4 | Polish, edge cases | Error messages, loading states |
| 5 | Nice-to-haves | Animations, optimizations |

#### Why Verification Steps Matter

Simple TODO:
```markdown
- [ ] Implement user authentication
```

Ralph might skip edge cases, forget error handling, or declare victory without testing.

With verification steps, Ralph knows exactly what "done" means. Each step is a testable acceptance criterion.

#### Full Example (prd.json)

```json
[
  {
    "id": "auth-001",
    "category": "functional",
    "priority": 1,
    "description": "User login",
    "verification": [
      "POST /api/login with valid creds returns 200 + JWT",
      "POST /api/login with invalid creds returns 401",
      "JWT contains user ID and expires in 24h"
    ],
    "passes": false
  },
  {
    "id": "auth-002",
    "category": "security",
    "priority": 1,
    "description": "Passwords stored securely",
    "verification": [
      "Passwords hashed with bcrypt (cost >= 10)",
      "Raw password never logged or stored",
      "Password not returned in API responses"
    ],
    "passes": false
  },
  {
    "id": "api-001",
    "category": "functional",
    "priority": 2,
    "description": "Protected routes require auth",
    "verification": [
      "GET /api/profile without token returns 401",
      "GET /api/profile with valid token returns 200",
      "GET /api/profile with expired token returns 401"
    ],
    "passes": false
  },
  {
    "id": "ui-001",
    "category": "ui",
    "priority": 3,
    "description": "Login form",
    "verification": [
      "Form displays email and password fields",
      "Submit button disabled while loading",
      "Error message displays on failed login"
    ],
    "passes": false
  }
]
```

#### Prompt Integration

```markdown
Study @prd.json for requirements.

1. Find incomplete items (passes: false)
2. Select the item with lowest priority number
3. Read its verification steps carefully
4. Implement the feature
5. Test EACH verification step explicitly
6. Only set passes: true if ALL verifications pass
7. Commit and update prd.json
```

#### Checking Progress

```bash
# Count remaining items
jq '[.[] | select(.passes == false)] | length' prd.json

# List incomplete items by priority
jq -r '.[] | select(.passes == false) | "\(.priority) \(.id): \(.description)"' prd.json | sort -n

# What's blocking? (priority 1 items not done)
jq '.[] | select(.passes == false and .priority == 1)' prd.json
```

#### When to Use Each Format

prd.json is the recommended format for both HITL and AFK modes because:
- Structured data is easier for the LLM to parse and update
- Verification steps define clear "done" criteria
- Priority numbers guide task selection
- Status tracking is explicit

The mental shift: **you're not writing a TODO list, you're writing a test specification.**

---

## Common Failure Modes & Fixes

| Failure | Symptom | Fix |
|---------|---------|-----|
| Duplicate implementations | Same feature built twice | Add "search before implementing" instruction |
| Placeholder code | `// TODO` or minimal stubs | Add explicit "full implementations only" instruction |
| Skipped edge cases | "Done" but missing coverage | Define explicit scope in specs |
| Context rot | Quality degrades late in loop | Keep tasks smaller, use more subagents |
| Infinite loops | Never declares complete | Add explicit stop condition |
| Wrong patterns | Doesn't match codebase style | Update stdlib rules, codebase wins |

---

## Sample Prompts

### Implementation Loop

```markdown
# Context
0a. Study @specs/* to learn about specifications
0b. Study @.ralph/learnings.md for codebase knowledge
0c. Study @.ralph/gotchas.md to avoid known mistakes
0d. List @.ralph/decisions/ and read relevant ADRs
0e. Study @prd.json for current progress and task priorities

# Work
1. Choose the highest priority pending task (lowest priority number)
2. Search codebase before implementing (don't assume not implemented)
3. Implement using parallel subagents
4. Run tests for the changed code
5. Verify ALL items in the task's verification array pass

# Update state
6. Update @prd.json - move completed task to "completed" array
7. If you learned something new, add it to @.ralph/learnings.md
8. If you made a mistake and fixed it, document in @.ralph/gotchas.md
9. If you made an architectural decision, create ADR in @.ralph/decisions/
10. Git commit with conventional message
11. If all tasks complete (tasks array empty), output <promise>COMPLETE</promise>

IMPORTANT: DO NOT IMPLEMENT PLACEHOLDER IMPLEMENTATIONS.
```

### Planning Loop

```markdown
Study @specs/* and existing source code in src/
Study @.ralph/learnings.md and @.ralph/gotchas.md
List @.ralph/decisions/ to understand previous architectural decisions.

Use up to 100 subagents to:
1. Compare source against specifications
2. Find TODOs, placeholders, minimal implementations
3. Identify missing functionality

Create/update @prd.json with new tasks including:
- Unique id, title, description
- Priority (1-5, lower = more important)
- Category (setup, core, feature, polish)
- Verification steps (specific, testable criteria)
- Dependencies (task ids that must complete first)

If architectural decisions are needed, create ADRs in @.ralph/decisions/
```

### Test Coverage Loop

```markdown
@coverage-report.txt
@.ralph/learnings.md

Find uncovered lines in the coverage report.
Write tests for the most critical uncovered paths.
Run coverage again and update report.
Target: 80% minimum coverage.

If you discover testing patterns that work well, add them to @.ralph/learnings.md
```

### Learning Extraction Loop

Use this periodically to consolidate Ralph's learnings:

```markdown
Study the git log and recent changes.
Study @.ralph/learnings.md and @.ralph/gotchas.md
List @.ralph/decisions/ for existing ADRs.

Analyze:
1. What patterns are emerging in the codebase?
2. What mistakes were made and corrected?
3. What decisions were made implicitly that should be explicit?

Update:
- @.ralph/learnings.md - consolidate and organize by topic
- @.ralph/gotchas.md - remove resolved issues, add new ones
- @.ralph/decisions/ - create new ADRs for implicit decisions

Remove duplicates and keep files focused.
```

---

## Safety Considerations

### Docker Sandboxes

**Always use Docker for AFK Ralph.** Docker provides a built-in sandbox command for AI agents:

```bash
docker sandbox run claude -p "$(cat PROMPT.md)"
```

The sandbox:
- Mounts only the current working directory
- Blocks access to home directory, SSH keys, system files
- Prevents destructive system commands
- Handles credentials automatically

Additional options:
```bash
# Mount extra directories
docker sandbox run -v /path/to/data:/data claude -p "..."

# Set environment variables
docker sandbox run -e MY_VAR=value claude -p "..."

# Run detached (background)
docker sandbox run -d --name my-ralph claude -p "..."
```

For HITL Ralph, Docker is optional since you're actively watching and can intervene.

### Git as Safety Net

- Commit after every feature
- Creates clean rollback points
- `git reset --hard` to recover from bad runs

### Cost Management

- HITL Ralph: Normal usage patterns
- AFK Ralph: Can run up significant costs overnight
- Cap iterations to control spend
- ~$10.50/hour for Sonnet running overnight (reported costs)

---

## Getting Started Checklist

1. [ ] Create `specs/` directory with functional requirements
2. [ ] Create `SPECS.md` overview document
3. [ ] Create `CLAUDE.md` with main project instructions
4. [ ] Create `.claude/rules/` with modular rules (code-style.md, testing.md, etc.)
5. [ ] Create `.ralph/` directory with `learnings.md`, `gotchas.md`, `decisions/template.md`
6. [ ] Create `AGENT.md` with build/run instructions
7. [ ] Create `prd.json` with initial tasks and verification steps
8. [ ] Write `PROMPT.md` with loop instructions
9. [ ] Set up feedback loops (types, tests, lint)
10. [ ] Create `ralph-once.sh` for HITL mode
11. [ ] Create `ralph.sh` for AFK mode (with iteration cap)
12. [ ] Start with HITL to refine prompt
13. [ ] Graduate to AFK once confident

---

## Key Quotes

> "Ralph can replace the majority of outsourcing at most companies for greenfield projects."

> "Any problem created by AI can be resolved through a different series of prompts."

> "The limiting factor is now screen space, not engineering capacity."

> "Engineers are still needed. Anyone claiming tools can do 100% without an engineer is peddling horseshit."

> "This works best for bootstrapping greenfield, with the expectation you'll get 90% done with it."

---

## Sources

- Geoffrey Huntley - [From Design Doc to Code](https://ghuntley.com/specs)
- Geoffrey Huntley - [Ralph Wiggum as a Software Engineer](https://ghuntley.com/ralph/)
- Matt Pocock - [11 Tips for AI Coding with Ralph Wiggum](https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum)
- YC Hackathon - [RepoMirror Documentation](https://github.com/repomirrorhq/repomirror)
