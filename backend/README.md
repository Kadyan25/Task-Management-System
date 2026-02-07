# Backend

Node.js + TypeScript + Express + Prisma + PostgreSQL API.

## Quick Start

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL with Docker: `npm run db:up`.
3. Generate Prisma client: `npm run prisma:generate`.
4. Run migrations: `npm run prisma:migrate`.
5. Start API in dev mode: `npm run dev`.

## Health Check

- `GET /health` returns `{ "status": "ok" }`.

## Auth Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

## Task Endpoints (Protected)

Use `Authorization: Bearer <access_token>`.

- `POST /tasks`
- `GET /tasks` (supports `page`, `limit`, `status`, `search`)
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `PATCH /tasks/:id/toggle`

