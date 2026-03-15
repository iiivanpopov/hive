# AGENTS.md

Guidance for coding agents working in this repository.

## Project Overview

- Monorepo managed with Bun workspaces.
- Workspace packages:
  - `backend` (`hive-backend`): Hono + Drizzle + Bun runtime.
  - `frontend` (`hive-frontend`): React + Vite + TanStack Router.
- Top-level shared lint config lives in `eslint.config.ts`.
- TypeScript is strict in both packages.

## Repository Rules Discovery

- Checked for Cursor rules:
  - `.cursorrules`: not present.
  - `.cursor/rules/`: not present.
- Checked for Copilot rules:
  - `.github/copilot-instructions.md`: not present.
- If these files are added later, treat them as highest-priority agent instructions.

## Install And Setup

- Install dependencies from repo root:
  - `bun install`
- Husky hooks are configured via `prepare` script.
- Pre-commit runs build, tests, and lint-staged (see "Git Hooks").

## Build / Dev / Lint / Test Commands

Run commands from repository root unless noted.

### Root Commands

- Dev (all workspaces):
  - `bun dev`
- Production run (all workspaces):
  - `bun prod`
- Build all in development mode:
  - `bun build:dev`
- Build all in production mode:
  - `bun build:prod`
- Lint all workspaces:
  - `bun lint`
- Lint frontend CSS:
  - `bun lint:css`
- Run backend unit tests:
  - `bun test:unit`
- Run backend integration tests:
  - `bun test:it`
- Run all tests:
  - `bun test`

### Backend Commands

- Start backend dev server:
  - `bun --filter hive-backend dev`
- Run backend production entry:
  - `bun --filter hive-backend prod`
- Build backend (dev/prod):
  - `bun --filter hive-backend build:dev`
  - `bun --filter hive-backend build:prod`
- Lint backend:
  - `bun --filter hive-backend lint`
- DB operations:
  - `bun --filter hive-backend db:generate`
  - `bun --filter hive-backend db:push`
  - `bun --filter hive-backend db:studio`

### Frontend Commands

- Start frontend dev server:
  - `bun --filter hive-frontend dev`
- Run frontend preview/prod mode:
  - `bun --filter hive-frontend prod`
- Build frontend (dev/prod):
  - `bun --filter hive-frontend build:dev`
  - `bun --filter hive-frontend build:prod`
- Lint frontend TS/JS:
  - `bun --filter hive-frontend lint`
- Lint frontend CSS:
  - `bun --filter hive-frontend lint:css`
- Generate API client:
  - `bun --filter hive-frontend api:generate`
- Frontend test script currently prints a placeholder message.

## Running A Single Test (Important)

Backend uses Bun test with preload setup files.

- Single backend unit test file:
  - `bun test ./backend/tests/unit/lib/utils.test.ts --preload ./backend/tests/global.setup.ts`
- Single backend integration test file:
  - `bun test ./backend/tests/it/auth/auth.router.test.ts --preload ./backend/tests/global.setup.ts --preload ./backend/tests/it/setup.it.ts`
- Single test case by name pattern:
  - `bun test ./backend/tests/unit --preload ./backend/tests/global.setup.ts -t "should return a string of length 16"`
- Combine file + name filter:
  - `bun test ./backend/tests/it/messages/messages.router.test.ts --preload ./backend/tests/global.setup.ts --preload ./backend/tests/it/setup.it.ts -t "creates message"`

Notes:

- Prefer direct `bun test ...` commands for one-off targeting.
- `bun test:unit` and `bun test:it` are broad suite scripts, not single-test scripts.

## Git Hooks

- `.husky/pre-commit` runs:
  - `bun build:dev`
  - `bun run test`
  - `bun lint-staged`
- `.husky/prepare-commit-msg` prepends a random emoji to commit messages.
- Expect commit to fail if build/tests/lint fail.

## Code Style Guidelines

### Formatting

- Use TypeScript everywhere (`.ts`/`.tsx`).
- Use single quotes.
- Omit semicolons.
- Keep trailing commas in multiline literals/params.
- Prefer concise arrow functions when readable.
- Follow existing wrapping/line-break style from nearby files.

### Imports

- Import ordering is enforced by ESLint (`perfectionist/sort-imports`).
- Use `import type` for type-only imports.
- Prefer alias imports (`@/...`) over long relative paths.
- Keep side-effect imports explicit (example: `import '@/styles/global.css'`).
- Keep grouped import blocks separated by blank lines as in existing code.

### Types And Safety

- TypeScript strict mode is enabled; keep code type-safe.
- Avoid `any`; use specific types, generics, or `unknown` with narrowing.
- Reuse shared types/schemas rather than re-declaring inline types.
- Prefer schema-driven validation (Zod + validator middleware) for request data.
- Preserve existing tsconfig constraints (`verbatimModuleSyntax`, strict checks).

### Naming Conventions

- Classes: `PascalCase` (e.g. `AuthService`, `AuthRouter`).
- Functions/variables: `camelCase`.
- Constants: `UPPER_SNAKE_CASE` for true constants (e.g. local storage keys).
- File names: `kebab-case` with domain suffixes (`*.service.ts`, `*.router.ts`, `*.schema.ts`).
- Route files in frontend follow TanStack Router conventions; do not rename generated route artifacts manually.

### Backend Patterns

- Keep route handlers thin; move business logic into `*.service.ts`.
- Use `ApiException` for domain/application errors.
- Return structured JSON errors through `errorMiddleware`.
- Reuse middleware (`session`, `validator`, role checks) instead of ad-hoc checks.
- Use Drizzle query APIs consistently with existing table modules.
- Prefer repository abstractions for token/session workflows.

### Frontend Patterns

- Use functional React components.
- Keep reusable UI in `src/components/ui`.
- Keep hooks in `src/hooks` and route-specific hooks near route components.
- Use shared providers in `src/providers` for cross-cutting concerns (theme/i18n).
- Use `cn` helper and variant utilities for class composition.
- Preserve generated files such as `src/routeTree.gen.ts` (lint ignore exists for this file).

### Error Handling

- Backend:
  - Throw `ApiException.*` variants for expected failures.
  - Include stable error codes where available.
  - Let unexpected errors bubble to middleware logger/500 response.
- Frontend:
  - Respect existing API interceptor behavior for toast errors.
  - Do not swallow errors silently; either surface UI feedback or rethrow.

### Testing Conventions

- Use Bun test APIs (`describe`, `it`, `expect`, `expectTypeOf`).
- Place backend tests under:
  - `backend/tests/unit/**`
  - `backend/tests/it/**`
- Keep test names explicit and behavior-focused.
- Reuse preload setup files for environment/bootstrap consistency.

## Lint Configuration Notes

- Base config: `@antfu/eslint-config` with TypeScript + stylistic + imports enabled.
- Repo-level rule customizations include:
  - `antfu/no-top-level-await`: off
  - `node/prefer-global/buffer`: off
  - `ts/ban-ts-comment`: off
  - `ts/no-redeclare`: off
- Backend additional overrides:
  - `unicorn/throw-new-error`: off
  - `no-new`: off
- Frontend additional setup:
  - React + formatters enabled
  - Better Tailwind CSS plugin enabled
  - `routeTree.gen.ts` ignored by ESLint

## Agent Execution Checklist

- Before finishing a change:
  - Run targeted tests for touched areas.
  - Run lint in affected package(s).
  - For significant changes, run `bun build:dev`.
- Before committing:
  - Ensure pre-commit commands are likely to pass.
- When editing:
  - Match local file conventions first.
  - Prefer minimal, focused diffs.

## Practical Defaults For Agents

- Default package manager/runtime: Bun.
- Default import alias: `@/`.
- Default backend test mode for logic changes: unit test first, then integration if API behavior changed.
- Default frontend validation: lint + type/build checks (tests are not implemented yet).
