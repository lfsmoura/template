# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
bun install          # Install dependencies
bun run build        # Build all packages
bun run dev          # Start dev servers for all apps concurrently
bun run typecheck    # Type check with tsgo (TypeScript native preview)
bun run lint         # Biome lint and format check
bun run lint:fix     # Biome lint and format with auto-fix
bun run format       # Biome format only
```

## Architecture

This is a Turborepo monorepo using Bun as the package manager.

### Apps (`apps/`)

- **web**: TanStack Start app with React, TailwindCSS, and file-based routing. Uses `@tanstack/react-router` for routing with auto-generated route tree.
- **docs**: Vanilla Vite + TypeScript app. Consumes `@repo/ui` for shared components.

### Packages (`packages/`)

- **@repo/ui**: Shared component library with `Counter()` and `Header({ title })` components, plus `setupCounter()` utility
- **@repo/typescript-config**: Shared TypeScript configs (`base.json` for libraries, `vite.json` for apps)

### Build Pipeline

Turbo orchestrates builds with dependency-aware caching. The `build` task depends on upstream package builds (`^build`). Dev servers run in persistent watch mode without caching.

### Tooling

- **Biome**: Used for linting and formatting (replaces ESLint + Prettier). Config in `biome.json`.
- **tsgo**: TypeScript native preview compiler for fast type checking. Run via `bun run typecheck`.
- **TanStack Router**: File-based routing in `apps/web/src/routes/`. Route tree is auto-generated to `routeTree.gen.ts`.
