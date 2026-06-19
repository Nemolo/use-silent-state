# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm test                  # run tests once
pnpm test:coverage         # run tests with v8 coverage report
pnpm typecheck             # tsc --noEmit
pnpm lint                  # eslint src only
pnpm build                 # tsup → dist/

pnpm playground            # start Vite dev server for the playground app

pnpm release               # bump patch, update CHANGELOG, commit, annotated tag, push
pnpm release:minor
pnpm release:major
```

To run a single test file or test name:

```bash
pnpm vitest run src/useSilentState.test.ts
pnpm vitest run -t "does not re-render"
```

## Architecture

This is a pnpm workspace with two packages:

- **root** (`src/`) — the published library (`use-silent-state`)
- **`playground/`** — a standalone Vite + React app that imports the library via the workspace alias `use-silent-state`

### Library (`src/`)

Two hooks, both exported from `src/index.ts`:

**`useSilentState<T>(initialValue)`** — stores state in a `useRef` (never triggers a re-render on `set()`). Exposes a stable `SilentState<T>` object `{ get, set, subscribe }` memoized with `useMemo`. `subscribe` is the standard external-store pattern: adds a listener, returns an unsubscribe function.

**`useWatchSilentState(state, selector?)`** — wraps `useSyncExternalStore`. Accepts any `Pick<SilentState<T>, 'get' | 'subscribe'>` so it works with partial objects too. Uses TypeScript overloads to infer `D` from the selector. The third argument to `useSyncExternalStore` (SSR snapshot) is marked `/* v8 ignore next */` because jsdom never calls it.

The selector optimizes re-renders: `useSyncExternalStore` compares snapshots with `Object.is`, so a selector returning a **primitive** skips re-renders when the selected value is unchanged. Selectors returning **objects** lose this benefit (new reference on every call = always "changed"). The workaround is to select primitives and shape them outside with `useMemo`.

### ESLint

`eslint.config.js` uses `projectService: true` (typescript-eslint v8) so ESLint auto-discovers the correct `tsconfig.json` for each file in the workspace. This is necessary because `playground/` has its own `tsconfig.json` that differs from the root one.

The playground uses `/* eslint-disable react-hooks/refs */` at file top because it intentionally reads `ref.current` during render for render-count tracking.

### Release pipeline

`scripts/release.mjs` coordinates the full release: `pnpm version` → `auto-changelog -p` → `git commit` → `git tag -a` (annotated) → `git push --follow-tags`.

**Annotated tags are required.** `git push --follow-tags` ignores lightweight tags (`git tag v1.0.0`). Always use `git tag -a v1.0.0 -m "v1.0.0"`.

GitHub Actions (`.github/workflows/publish.yml`) triggers on `v*` tags, publishes to npm using **OIDC Trusted Publisher** (no `NPM_TOKEN` needed — configured on npm), and creates a GitHub Release automatically.

`auto-changelog` config lives in `package.json` under `"auto-changelog"`. Commits prefixed `ci:`, `test:`, `build:`, `style:` are hidden from the changelog; `feat:`, `fix:`, `refactor:` are shown. Use Conventional Commits for all commits.
