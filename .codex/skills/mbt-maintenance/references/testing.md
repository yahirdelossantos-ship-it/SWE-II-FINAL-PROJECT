# Testing strategy

## Existing baseline

The API uses Node's built-in `node:test` runner with `node:assert/strict`. Tests are colocated as `*.test.ts`; `test:v2` runs their compiled JavaScript from `dist`. Current v2 tests primarily cover pure helpers under `src/routes/v2/core`.

The operations webapp currently exposes lint and build scripts but no established component-test runner. Do not introduce a frontend testing stack for a small change without first justifying the repository-wide pattern it creates.

## Choose the test level from the behavior

- Put deterministic business decisions and transformations in a focused v2 core/domain helper and test them directly.
- Use route-level tests when the contract depends on request parsing, authentication placement, HTTP status/error mapping, or persistence orchestration.
- Use database integration tests when correctness depends on Prisma behavior, relations, constraints, or transaction semantics.
- Use frontend tests only when meaningful UI behavior cannot be covered by type checking, linting, or API/domain tests and a maintainable runner is in scope.

Do not substitute source-text assertions for behavioral tests. Do not mock Prisma's fluent internals separately in each test file.

## Establish reusable seams

If the task introduces the first HTTP route test, establish shared infrastructure that later v2 route tests can reuse. Prefer an application factory that does not call `listen`, explicit dependency or database setup, centralized authentication handling, and shared request/cleanup helpers. Keep server startup in a thin entry point.

If that architectural work is disproportionate to the requested change, extract and test the business rule as a pure helper, clearly report the missing route-level coverage, and propose the reusable harness separately. Do not hide a one-off Express application inside one endpoint's test.

For database-backed integration tests, use an explicitly configured non-production database, deterministic fixtures, and cleanup that cannot target production. Never infer permission to migrate, truncate, or reseed a database.

## Test design

Cover externally meaningful outcomes and boundaries:

- accepted valid classifications;
- rejected invalid or missing referenced records;
- each service/type branch affected by the rule;
- unchanged behavior for out-of-scope branches;
- stable error codes where clients may depend on them.

Name tests by observable behavior. Keep fixtures minimal and make failures identify the broken invariant.

## Verification reporting

Run the narrowest checks that exercise changed code. Report the exact commands and outcomes. Distinguish tests that ran from checks that were unavailable, skipped, or blocked by missing infrastructure.
