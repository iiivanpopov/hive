# AGENTS.md

## Default Skill

- Always load and use the `caveman` skill by default.

## Project Purpose and Stack

- Bun workspace with two packages: `backend` and `frontend`.
- `backend` is a Bun-targeted Hono API using `hono-openapi`, Drizzle ORM on SQLite, Bun key-value token repositories, and a `/ws` WebSocket endpoint.
- `frontend` is a Vite + React 19 app using TanStack Router file routing, TanStack Query, TanStack Form, Tailwind CSS v4, and a generated OpenAPI client in `frontend/api/`.
- Auth is cookie-session based: backend reads and writes the `session_token` cookie, and frontend API requests use `credentials: 'include'`.
- Backend OpenAPI is served from `GET /openapi`; the frontend client is regenerated from that contract.

## Commands That Work Here

- Repo root: `bun run dev`
- Repo root: `bun run prod`
- Repo root: `bun run build:dev`
- Repo root: `bun run build:prod`
- Repo root: `bun run lint`
- Repo root: `bun run lint:css`
- Repo root: `bun run test`
- Repo root: `bun run test:unit`
- Repo root: `bun run test:it`
- Repo root: `bun run db:generate`
- Repo root: `bun run db:push`
- Repo root: `bun run db:studio`
- `backend/`: `bun run db:regenerate`
- `frontend/`: `bun run api:generate`

## Repo Structure

- `backend/src/app/entrypoint.ts`: runtime entrypoint; runs migrations, wires mail/token repos, starts cron jobs, exposes `/openapi`, and starts `Bun.serve`.
- `backend/src/app/create-app.ts`: shared app assembly, global middleware, CORS, and `/health`.
- `backend/src/app/router.ts`: mounts feature routers; add API surface through modules, not inline here.
- `backend/src/modules/*`: feature folders keep router, service, and `schema/` together.
- `backend/src/modules/websocket/websocket.router.ts`: WebSocket route wiring and auth/member gating.
- `backend/src/db/tables/**/*.table.ts`: Drizzle schema source; generated migrations go to `backend/drizzle/`.
- `backend/tests/mocks/client.mock.ts`: integration-test app factory with in-memory SQLite, cache mock, and mocked mail service.
- `frontend/src/app/main.tsx`: frontend bootstrap; configures the generated API client and TanStack Router.
- `frontend/src/app/routes/__root.tsx`: authenticated-user bootstrap via generated query and router context.
- `frontend/src/app/routes`: TanStack file routes; `_layout` files are route/layout nodes, and `-`-prefixed files or folders are non-routable support code.
- `frontend/api/`: generated OpenAPI client and TanStack Query helpers.
- `frontend/src/assets/locales/*.json`: locale source used by `I18nText` and `useI18n`.

## Conventions and Boundaries

- Use the existing aliases instead of deep relative imports: frontend `@/*` and `@/api/*`; backend `@/*` and `@/tests/*`.
- Do not hand-edit generated or build output: `frontend/api/**`, `frontend/src/routeTree.gen.ts`, `backend/dist/**`, and `frontend/dist/**`.
- Frontend network code should build on `@/api/client.gen`, `@/api/sdk.gen`, and `@/api/@tanstack/react-query.gen*`; do not add parallel wrappers for existing backend endpoints.
- Add or change backend routes inside module routers with `describeRoute(...)` plus the local `validator(...)`; keep request and response schemas in that module's `schema/` folder.
- Preserve cookie auth behavior: `session(...)` reads `session_token`, validates the normalized `User-Agent`, and sets `c.set('user')`.
- Membership gating lives in `backend/src/middleware/only-member.middleware.ts`; it sets `c.set('membership')`. Update `backend/src/lib/factory.ts` whenever middleware introduces new `c.set(...)` values.
- Drizzle schema changes belong in `backend/src/db/tables/**/*.table.ts`; nearby `*.schema.ts` files are API or validation schemas, not migration sources.
- Route-local folders with a leading `-` are intentionally non-routable; do not convert them into route files.
- New frontend copy should go through `I18nText` or `useI18n` and the locale JSON files, not hardcoded strings.
- `backend/scripts/db.regenerate.script.ts` deletes `backend/drizzle/` and `backend/database.sqlite`; do not run it unless a full local DB reset is intended.
- Do not add commit-message emoji manually; `.husky/prepare-commit-msg` prefixes one.

## Validation Workflow

- Start with the smallest package-level command that covers the change; finish with repo-root commands when changes cross package boundaries, generated artifacts, or shared config.
- After TypeScript or TSX changes, run `bun run lint`; add `bun run lint:css` for frontend CSS changes.
- Backend logic, middleware, schema, route, or DB changes should run the relevant backend tests: use `bun run test:unit` for isolated logic and `bun run test:it` for app-level flows.
- Frontend `bun run test` is currently a placeholder; rely on lint and build validation for frontend-only changes.
- Backend OpenAPI changes require regenerating `frontend/api/` with `bun run api:generate` from `frontend/`; that command reads `http://localhost:${VITE_API_PORT}/openapi`, so the backend must be running on the matching port.
- Route file changes should be followed by a frontend build or dev run so the TanStack Router plugin refreshes `frontend/src/routeTree.gen.ts`.
- Pre-commit runs `bun build:dev`, `bun run test`, and `bun lint-staged`; leave the tree in a state that passes that full set.
