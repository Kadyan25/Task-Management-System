# Frontend

Next.js App Router frontend for the Task Management System.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Install dependencies: `npm install`.
3. Start dev server: `npm run dev`.

## Routes

- `/`
- `/login`
- `/register`
- `/dashboard`

## Auth Notes

- Access token is kept in local storage.
- Refresh token is managed by backend httpOnly cookie.
- Frontend refreshes access token on app load and retries protected requests on `401`.
