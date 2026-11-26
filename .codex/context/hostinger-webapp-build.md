# Hostinger webapp build

## Status

Adjusted and locally verified on 2026-10-19.

## Deployment path

- Hostinger builds the operations webapp through the root `pnpm build:app` script.
- That script intentionally enters `apps/webapp-mbt` and invokes the local Next.js CLI directly. A previous Hostinger fix replaced the Turbo-filtered command with this form; do not revert it without new deployment evidence.
- Keep `apps/webapp-mbt`'s own `build` script aligned because `turbo run build` and package-scoped checks use it.

## Required compatibility settings

- Use `next build --webpack` for production builds of `apps/webapp-mbt`. Hostinger fails while Turbopack processes `src/app/globals.css`, reporting that its Node helper exited before Turbopack could connect.
- Keep `nodeLinker: hoisted` in the root `pnpm-workspace.yaml`. It gives deployment installs a flat `node_modules` layout without pnpm's isolated symlink structure.
- The root workspace lockfile remains the dependency source of truth. Changing the linker layout does not itself change dependency resolution, so `pnpm-lock.yaml` should not need content changes.

## Verification

Run the exact deployment command:

```sh
pnpm install --frozen-lockfile
pnpm build:app
```

The verified build identified itself as `Next.js 16.2.4 (webpack)` and completed all 45 static-page generation steps.

The repository requires Node 22.x. A local check under Node 26 can establish that the build succeeds, but its engine and `module.register()` deprecation warnings are not representative of Hostinger's expected Node 22 environment.
