# Task Management System

Track A full-stack implementation:

- `backend`: Node.js + TypeScript + Express + Prisma + PostgreSQL
- `frontend`: Next.js (App Router) + TypeScript

## Prerequisites

- Node.js 20+
- Node Version Manager (`nvm` or `nvm-windows`) recommended for managing Node versions
- Docker Desktop (for local PostgreSQL)

## 1. Start Backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:up
npm run prisma:migrate -- --name init
npm run dev
```

Backend runs at `http://localhost:5000`.

## 2. Start Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Smoke Test (Backend)

With backend running:

```bash
cd backend
npm run test:smoke
```

## Implemented Scope

- JWT auth (`/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`)
- Protected task API with ownership
- Task CRUD + toggle + pagination + filtering + search
- Responsive web UI for auth and dashboard
- Dashboard integrated with live backend APIs

