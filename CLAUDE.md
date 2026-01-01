# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
bun install          # Install dependencies
bun run build        # Build all packages (TypeScript check + Vite build)
bun run dev          # Start dev servers for all apps concurrently
bun run lint         # Biome lint and format check
bun run lint:fix     # Biome lint and format with auto-fix
bun run format       # Biome format only
```

## Architecture

This is a Turborepo monorepo using Bun as the package manager.

### Apps (`apps/`)

- **web**, **docs**: Vanilla Vite + TypeScript apps. Both consume `@repo/ui` for shared components. Build outputs to `dist/`.

### Packages (`packages/`)

- **@repo/ui**: Shared component library with `Counter()` and `Header({ title })` components, plus `setupCounter()` utility
- **@repo/typescript-config**: Shared TypeScript configs (`base.json` for libraries, `vite.json` for apps)

### Build Pipeline

Turbo orchestrates builds with dependency-aware caching. The `build` task depends on upstream package builds (`^build`). Dev servers run in persistent watch mode without caching.
