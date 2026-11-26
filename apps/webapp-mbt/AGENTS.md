# Website Base: Agent Instructions

This repository is a reusable website starter. Treat it as a neutral base that can become many different sites.

## Core Rules

- Keep reusable components in `src/components` brand-neutral.
- Use CSS custom properties from `src/app/globals.css` for colors, focus rings, surfaces, text, and accent states.
- Do not hard-code project-specific brand colors in shared components.
- Put site-specific copy, business data, and contact links in `src/config` and translation files.
- Put page-specific composition and one-off styling in `src/views` or route files, not in reusable primitives.
- Prefer existing local patterns and helpers such as `cn`, `Button`, `Dropdown`, `Drawer`, and form components.

## Theming

Primary theme tokens live in `src/app/globals.css`.

The theme follows the styling model in `docs/styling.md`: light and dark mode each get their own brand-derived skin. `--app-page` is the main page skin, `--app-white` is for white/transition sections in light mode and a dark non-black equivalent in dark mode, and `--app-deep-section` is for deep high-contrast sections such as footers or strong section bands. Use `--app-primary` and `--app-accent` for original brand colors, buttons, highlights, and active states.

When a component needs color, prefer one of:

- `--app-page`
- `--app-white`
- `--app-surface`
- `--app-surface-muted`
- `--app-border`
- `--app-text`
- `--app-text-muted`
- `--app-primary`
- `--app-primary-foreground`
- `--app-accent`
- `--app-accent-foreground`
- `--app-focus`
- `--app-deep-section`
- `--app-deep-text`
- semantic tokens like `--app-danger`, `--app-success`, `--app-warning`, and `--app-info`

Use `color-mix(...)` with existing tokens for hover, border, and soft states when that keeps the component reusable. Add a new token only when a reusable component has a real semantic need that existing tokens cannot express.

## Components

- Keep `src/components/ui` low-level and composable.
- Keep `src/components/layout` generic enough to reuse across websites.
- Keep `src/components/form` accessible and theme-token based.
- Use semantic `Button` variants. Prefer `cta` for prominent call-to-action buttons.
- Avoid names like `websiteCta`, company names, destination names, or campaign-specific names inside reusable components.

## Checks

Before finishing code changes, run:

```bash
npm run lint
```

If route structure, build configuration, metadata, or server code changed, also run:

```bash
npm run build
```

Report any pre-existing warnings or unrelated failures clearly instead of hiding them.
