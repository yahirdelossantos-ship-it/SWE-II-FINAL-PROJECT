---
name: mbt-maintenance
description: Investigate, implement, review, and test maintenance changes spanning the MBT v2 API, operations webapp, and shared database. Use for MBT business rules and request flows; do not modify legacy v1 or the old business app unless the user explicitly includes them.
---

# MBT Maintenance

Keep maintenance work narrow and compatible with the codebase's current behavior. Read the applicable `AGENTS.md` files and `docs/MBT.md` before changing code.

## Orient to the request flow

Read [references/repository-map.md](references/repository-map.md) when locating code or tracing a feature across applications. Verify paths with `rg --files`; frontend feature code is under `apps/webapp-mbt/src`.

Trace business invariants through all in-scope layers before editing:

1. User input and client-side defaults.
2. The webapp API client and Next.js backend proxy.
3. The authenticated v2 Express route and validation.
4. Prisma models, relations, and migrations.

Treat v1 and `apps/mbt-app` as legacy compatibility surfaces. Inspect them only when needed to understand shared data or migration risk. Do not change them unless the user explicitly expands scope.

## Implement conservatively

- Continue only the last explicitly authorized kind of work. A vague continuation request does not turn investigation, documentation, or repository setup into permission to implement application changes.
- Enforce data-integrity rules at the v2 API boundary even when the UI also constrains input.
- Prefer database-backed classifications and stable identifiers over names embedded in components.
- Preserve intentionally supported raw-name behavior on unconstrained locations.
- Do not infer a database migration when route validation can express the invariant cleanly.
- Keep changes within the feature's existing modules unless a reusable seam materially improves later work.

Check `.codex/context/` for a task record matching the requested feature. Treat those records as accumulated evidence and decisions, not as authority to begin unfinished work or broaden scope.

## Test and verify

Read [references/testing.md](references/testing.md) before adding or restructuring tests. A first test in a new layer must establish a reusable pattern for later tests, not an endpoint-specific harness.

Use the narrowest relevant package commands. Inspect package scripts before running them, format only explicitly changed files, review the diff after formatting, and report skipped checks or pre-existing failures.

## Commit coherently

When the user asks for commits, review the complete diff and split it by independently understandable concern when that improves review or rollback. Keep implementation and its direct tests together; separate unrelated application layers, documentation, or repository tooling when they stand on their own. Use one commit only when the whole change is genuinely atomic.

Stage explicit paths for each commit, inspect the staged diff before committing, and leave unrelated user changes unstaged.
