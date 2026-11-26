# Repository agent rules

## Formatting

- Follow `.prettierrc.json` and `.editorconfig`: use literal tabs with a width of four columns, LF line endings, a final newline, and no trailing whitespace.
- Format supported files with `pnpm exec prettier --write <explicit-file-list>`. Never run a repository-wide formatter unless the user explicitly requests it.
- Keep formatting changes scoped to files intentionally changed by the task. If an existing file does not yet match the repository format, preserve its current formatting and leave baseline normalization for a separate, explicit formatting change.
- Inspect the diff after formatting. Do not include unrelated whitespace, wrapping, quote, or import-order churn.

## Human-readable code

- Organize modules into clear sections: imports, types, constants, helpers, and the main implementation.
- Separate related concerns with blank lines. In components, visually separate state and hooks, derived data, mutations or effects, event handlers, and rendering.
- Extract repeated or conceptually independent logic into well-named helpers or components when doing so makes the primary flow easier to scan.
- Prefer readable intermediate names over dense nested expressions. Keep concise expressions inline only when their meaning remains immediately clear.

## Collaboration

- Before writing a complex discovery script or a series of exploratory scripts, ask the engineer whether they can provide a direct source, explain the structure, or confirm the business rule. Prefer that collaboration when it saves investigation time or compute.

## Version control

- Keep each commit focused on one coherent purpose. Do not include unrelated changes under the same commit message; in a dirty worktree, stage explicit paths and leave unrelated work untouched.

## Business documentation

- Record validated MB Transfer business rules in `docs/MBT.md`. Keep implementation proposals and time-sensitive external research in focused companion documents, and link them from the business-rules document when useful.
