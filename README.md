# Turborepo + TanStack Start Template

A monorepo template using Turborepo, Bun, and Biome.

## Getting Started

```sh
bun install
bun run dev
```

## What's inside?

### Apps (`apps/`)

- **web**: [TanStack Start](https://tanstack.com/start) app with React, TailwindCSS, and file-based routing
- **docs**: Vanilla [Vite](https://vitejs.dev) + TypeScript app

### Packages (`packages/`)

- **@repo/ui**: Shared component library consumed by apps
- **@repo/typescript-config**: Shared TypeScript configs (`base.json` for libraries, `vite.json` for apps)

Each package and app is 100% [TypeScript](https://www.typescriptlang.org/).

## Commands

```bash
bun install          # Install dependencies
bun run dev          # Start dev servers for all apps
bun run build        # Build all packages
bun run typecheck    # Type check with tsgo (TypeScript native)
bun run lint         # Biome lint and format check
bun run lint:fix     # Biome lint and format with auto-fix
bun run format       # Biome format only
```

## Utilities

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [tsgo](https://github.com/nicolo-ribaudo/tsgo) (TypeScript native) for fast type checking
- [Biome](https://biomejs.dev/) for linting and formatting
- [Turborepo](https://turbo.build/) for monorepo orchestration
