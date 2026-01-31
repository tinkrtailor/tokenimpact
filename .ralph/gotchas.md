# Gotchas

Mistakes made that shouldn't be repeated.

Format:
```
## YYYY-MM-DD
- DON'T: [What went wrong]
- DO: [What to do instead]
```

---

## 2026-01-31

- DON'T: Assume `bun` is available just because CLAUDE.md mentions it
- DO: Check for `bun` with `which bun`, fall back to `npm` if unavailable

- DON'T: Run `create-next-app` in directory with existing files
- DO: Manually create package.json, tsconfig.json, etc. when directory has existing files
