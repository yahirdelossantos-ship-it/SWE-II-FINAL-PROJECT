# Repository map

## Sources of truth

- `AGENTS.md`: repository formatting and readability rules.
- `apps/webapp-mbt/AGENTS.md`: instructions applying to the operations webapp.
- `docs/MBT.md`: maintenance posture; preserve current stability while improving an under-documented system.
- `packages/database/prisma/schema.prisma`: current data model.
- `packages/database/prisma/migrations/`: persisted schema history.

## Active operations request path

The maintained operations UI is `apps/webapp-mbt`. Feature modules live below `apps/webapp-mbt/src/features`, not directly below the application directory.

Client mutations use `apps/webapp-mbt/src/lib/api/client.ts`, which calls `/api/backend`. The catch-all route at `apps/webapp-mbt/src/app/api/backend/[...path]/route.ts` adds the session token and forwards through `apps/webapp-mbt/src/lib/api/server.ts` to `/api/v2` on `mbt-api`.

The v2 router is assembled in `apps/mbt-api/src/routes/v2/index.ts`. Routes mounted after `requireV2Auth` are authenticated. Business validation still belongs in the individual route or an extracted v2 core/domain helper.

Shared persistence is provided by `@repo/database` from `packages/database`. A foreign key proves that a referenced record exists; it does not prove a related `Place` has the business-required `kind`.

## Legacy boundary

`apps/mbt-api/src/routes/v1` and `apps/mbt-app` support the old business application. They are scheduled for removal after remaining v2 gaps are closed. Do not implement parallel fixes there unless explicitly requested.

Legacy writers may explain existing inconsistent records. Account for that possibility when changing reads, migrations, or validation, but do not let it silently expand an otherwise v2-only task.

## Efficient discovery

- Start with `rg --files` when a supplied path may be abbreviated or stale.
- Use targeted `rg -n` searches across the relevant app, API, and Prisma package.
- Read applicable `AGENTS.md` files before edits.
- Inspect the package's scripts before selecting checks.
- Avoid repository-wide formatting and broad builds when package-scoped checks provide the needed evidence.

Common scoped commands, subject to the files changed:

```sh
pnpm exec prettier --write <explicit-file-list>
pnpm --filter mbt-api build
pnpm --filter mbt-api test:v2
pnpm --filter webapp-mbt lint
pnpm --filter webapp-mbt build
pnpm --filter @repo/database prisma:validate
git diff --check
```

The API test script consumes compiled tests under `dist`, so build the API before relying on `test:v2` after TypeScript test changes.
