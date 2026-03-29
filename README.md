# Transaction Management Dashboard

A production-style admin dashboard built with Next.js App Router, TypeScript, Tailwind CSS, shadcn-style UI primitives, TanStack Query, Recharts, React Hook Form, and Zod.

## Features

- Mock authentication flow with protected dashboard routes
- Dashboard overview with KPI cards, recent activity, and charts
- Searchable, filterable, sortable transaction list with pagination
- Dynamic transaction detail page with status updates and internal notes
- Lightweight mock backend powered by Next.js route handlers
- Responsive desktop and tablet layout with collapsible mobile navigation

## Tech Stack

- Next.js 16 App Router
- React 19 + TypeScript
- Tailwind CSS 4
- shadcn/ui-style component architecture
- TanStack Query
- Recharts
- React Hook Form + Zod

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000).

## Demo Login

- Email: `olivia@northstarops.com`
- Password: `admin12345`

## Available Routes

- `/login`
- `/dashboard`
- `/dashboard/transactions`
- `/dashboard/transactions/[id]`

## Mock API Endpoints

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `GET /api/transactions`
- `GET /api/transactions/[id]`
- `PATCH /api/transactions/[id]`
- `POST /api/transactions/[id]/notes`

## Project Notes

- The mock backend uses an in-memory transaction store seeded from local mock data.
- Authentication is simulated with a secure cookie plus client-side session storage.
- TanStack Query handles server-state fetching, caching, and mutation flows.
