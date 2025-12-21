# Hive Project - AI Coding Agent Instructions

## Architecture Overview

Hive is a **monorepo** full-stack application with:
- **Backend**: Hono API server (Bun runtime) with SQLite + Drizzle ORM
- **Frontend**: React SPA with TanStack Router and Tailwind CSS v4
- **Deployment**: Docker Compose with nginx reverse proxy

The backend and frontend are **separate workspaces** managed by Bun's workspace feature, with the frontend importing backend types for end-to-end type safety.

## Tech Stack Specifics

### Backend (Bun + Hono)
- **Runtime**: Bun (not Node.js) - use `Bun.serve()`, `Bun.env`, `Bun.password.hash()`
- **Framework**: Hono with `hono-openapi` for typed routes and automatic OpenAPI docs
- **Database**: SQLite with Drizzle ORM (not Prisma)
- **Scheduled Tasks**: Croner library (see [auth.scheduled.ts](../backend/src/modules/auth/auth.scheduled.ts))
- **Email**: Nodemailer with SMTP configuration from env vars

### Frontend (React + Vite)
- **Router**: TanStack Router with file-based routing (auto-generated [routeTree.gen.ts](../frontend/src/routeTree.gen.ts))
- **Styling**: Tailwind CSS v4 with `@tailwindcss/vite` plugin
- **UI Components**: Base UI React + shadcn-style patterns (see [button.tsx](../frontend/src/components/ui/button.tsx))
- **API Client**: Hono's RPC client with full type inference from backend via `hc<App>()`

## Critical Patterns

### Backend Module Structure
Every feature module follows this pattern (see [auth](../backend/src/modules/auth/)):
```
modules/<feature>/
  ├── <feature>.router.ts    # Hono routes with OpenAPI descriptions
  ├── <feature>.service.ts   # Business logic and DB operations
  ├── <feature>.scheduled.ts # Optional cron jobs
  └── schema/                # Zod validation schemas
      └── index.ts
```

Routes are registered in [backend/src/app/router.ts](../backend/src/app/router.ts), not the entrypoint.

### Factory Pattern for Type Safety
Backend uses a **custom factory** ([lib/factory.ts](../backend/src/lib/factory.ts)) that extends Hono with typed context variables:
```typescript
export const factory = createFactory<Env>()  // Env defines Variables like { user: User }
```
All routers MUST use `factory.createApp()` instead of `new Hono()` to maintain type inference.

### Error Handling
Use [ApiException](../backend/src/lib/api-exception.ts) class for all business logic errors:
```typescript
throw ApiException.BadRequest('User already exists', 'USER_EXISTS')
```
The [errorMiddleware](../backend/src/middleware/error.middleware.ts) automatically formats responses with `{ error: { code, message, details } }`.

### Validation
Use the custom [validator middleware](../backend/src/middleware/validator.middleware.ts) that wraps `hono-openapi` validator:
- Automatically returns validation errors with field paths
- Integrates with OpenAPI schema generation
- Example: `validator('json', RegisterBodySchema)`

### Database Schema
- Schemas in [backend/src/db/schema/](../backend/src/db/schema/) using Drizzle's SQLite core
- Relations defined in [backend/src/db/relations.ts](../backend/src/db/relations.ts)
- Use `sql\`(unixepoch())\`` for timestamps (SQLite convention)
- Generate migrations: `bun db:generate`, apply with `bun db:push`

### Frontend Type Safety
Frontend imports backend types directly:
```typescript
import type { App } from 'hive-backend'  // From workspace dependency
export const client = hc<App>(...)       // Full type inference
```

### Path Aliases
Both backend and frontend use `@/*` aliases:
- Backend: `@/config`, `@/db`, `@/modules`, etc.
- Frontend: `@/components`, `@/lib`, `@/routes`, etc.

## Development Workflow

### Running Locally
```bash
bun dev              # Runs both workspaces in parallel
bun --filter ./backend dev   # Backend only (port 5656)
bun --filter ./frontend dev  # Frontend only (port 5173)
```

### Building
```bash
bun build:dev        # Development build (both workspaces)
bun build:prod       # Production build with minification
```

Backend uses a [custom build script](../backend/build.script.ts) that bundles the server with `Bun.build()`.

### Database Management
```bash
bun db:generate      # Generate Drizzle migrations from schema changes
bun db:push          # Apply migrations to database
bun db:studio        # Open Drizzle Studio
```

Migrations run automatically on server startup via `migrate(db, { migrationsFolder: './drizzle' })`.

### Testing
Backend tests use Bun's built-in test runner (not Jest):
```bash
bun test             # Run all tests in backend/test/
```

### Linting
```bash
bun lint             # ESLint for both workspaces
bun lint:css         # Stylelint for frontend CSS
```

Uses [@antfu/eslint-config](https://github.com/antfu/eslint-config) with auto-formatting.

## Production Deployment

Docker Compose setup ([compose.yaml](../compose.yaml)):
- Backend: Port 5656, SQLite volume-mounted at `/app/database.sqlite`
- Frontend: nginx serving static files on port 80, proxies API to backend
- Network: Bridge network `hive-network` for inter-container communication

## Configuration

### Environment Variables (Backend)
Key vars (see [env.config.ts](../backend/src/config/env.config.ts)):
- `NODE_ENV`: development|production|test (Bun.env.NODE_ENV)
- `PORT`: Server port (default 5656)
- `DB_URL`: SQLite database path
- `SMTP_ENABLE`: Enable email sending
- `SMTP_USER`, `SMTP_PASS`, `SMTP_HOST`, `SMTP_PORT`: Email config
- `FRONTEND_URL`: For email confirmation links

### Frontend Environment
- `VITE_BACKEND_URL`: API endpoint (default: http://localhost:5656)

## Key Files to Reference

- [backend/src/app/entrypoint.ts](../backend/src/app/entrypoint.ts) - Server setup, middleware chain, OpenAPI docs
- [backend/src/lib/factory.ts](../backend/src/lib/factory.ts) - Typed Hono factory
- [frontend/src/lib/api.ts](../frontend/src/lib/api.ts) - API client setup
- [backend/src/modules/auth/auth.service.ts](../backend/src/modules/auth/auth.service.ts) - Example service layer pattern

## Common Pitfalls

1. **Don't use `new Hono()`** - always use `factory.createApp()` for type safety
2. **Router registration**: Add routes in `router.ts`, not `entrypoint.ts`
3. **Scheduled tasks**: Import in `entrypoint.ts` to execute (see [auth.scheduled.ts](../backend/src/modules/auth/auth.scheduled.ts))
4. **OpenAPI**: Use `describeRoute()` and `resolver()` for all routes to generate docs
5. **Bun-specific**: Use `Bun.env`, `Bun.password`, `Bun.serve()` - not Node.js equivalents
6. **Frontend routing**: Routes auto-generated by TanStack Router plugin - don't manually edit `routeTree.gen.ts`
