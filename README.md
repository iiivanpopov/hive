# Hive

Preview: [YouTube](https://youtu.be/0AEoUT2c8OY) [Google Drive](https://drive.google.com/file/d/1D_329qt76FcbQsQiTiZSMrFAJHZ7TXR9/view)

Hive is a Discord-style community chat application focused on real-time messaging and typed integration between backend and frontend.

## Key Facts

* Bun workspace with two packages: `backend` and `frontend`
* Backend: Hono API, Drizzle ORM, SQLite, Redis-backed sessions, WebSocket endpoint
* Frontend: React 19, Vite, TanStack Router, TanStack Query, TanStack Form, Tailwind CSS
* Authentication: email/password, Google OAuth, email confirmation, password reset
* Core product surface: communities, channels, invitations, profiles, settings, real-time chat, message editing and deletion
* Frontend API client in `frontend/api` is generated from backend OpenAPI at `GET /openapi`
* Authentication uses cookie-based server sessions, sessions stored at Redis.
* Expired invitations are cleaned up by a scheduled job
