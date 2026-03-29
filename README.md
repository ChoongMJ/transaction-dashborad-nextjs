# Transaction Management Dashboard

A production-style operations dashboard for reviewing, filtering, and managing payment transactions. The app is designed to feel like a real internal business product, with protected routes, role-based access control, mock backend workflows, optimistic mutations, and a clean admin-facing UX.

## Project Overview

This project showcases a frontend-heavy dashboard built with modern React and Next.js patterns while keeping the developer experience practical and scalable. It combines a polished UI with realistic data flows, API boundaries, and state management choices that mirror how an internal SaaS operations tool would be structured in production.

## Tech Stack

- Next.js 16 App Router
- React 19 + TypeScript
- Tailwind CSS 4
- shadcn/ui-style component architecture
- TanStack Query
- Recharts
- React Hook Form
- Zod

## Features

- Mock authentication with protected dashboard routes
- Role-based access control for `admin` and `viewer`
- KPI overview with summary cards, charts, and recent activity
- Transactions table with search, filtering, sorting, pagination, and URL-synced state
- Bulk actions for admins, including bulk status updates and mock delete flows
- Transaction detail view with status history and internal notes
- Loading, empty, and error states designed for dashboard UX
- Lightweight mock backend implemented with Next.js API routes

## Screenshots

Add screenshots or short GIFs here before sharing externally:

```md
![Dashboard Overview](./docs/screenshots/dashboard-overview.png)
![Transactions Table](./docs/screenshots/transactions-table.png)
![Transaction Detail](./docs/screenshots/transaction-detail.png)
```

## Demo Accounts

- Admin: `olivia@northstarops.com` / `admin12345`
- Viewer: `liam.viewer@northstarops.com` / `viewer12345`

## Architecture Decisions

### Why Next.js App Router

App Router keeps routing, layouts, server rendering, and API handlers in one cohesive framework. It works well for dashboards because protected sections, nested layouts, and server-aware route boundaries are straightforward to model.

### Why TanStack Query

TanStack Query is used for server state, caching, refetching, and mutations. It keeps data fetching logic predictable and makes optimistic UI updates for transaction actions and bulk operations much cleaner than hand-rolled state management.

### API Route Design

The project uses Next.js route handlers as a lightweight mock backend. Route handlers stay thin, while mock business logic lives in dedicated server/data layers. That separation keeps the frontend realistic without introducing a full database or external API.

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open `http://localhost:3000`

4. Sign in with either the admin or viewer demo account above

## Scripts

- `npm run dev` - Start the local development server
- `npm run build` - Create a production build
- `npm run lint` - Run ESLint

## Future Improvements

- Add test coverage for route handlers, query hooks, and key UI flows
- Persist mock data across restarts with a lightweight local database
- Add audit logs and richer permission scopes beyond `admin` and `viewer`
- Improve mobile table interactions with stacked row details or drawers
- Add export flows for CSV/reporting use cases
