# Fenmo Expense Tracker

A modern, full-stack expense tracking application built for the Fenmo assignment. It leverages Next.js 14, TypeScript, Tailwind CSS, Prisma, and SQLite to deliver a fast, responsive, and robust financial dashboard.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create the environment file:
```bash
copy .env.example .env
```

3. Generate the Prisma client and sync the database:
```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to view the application.

## Architecture

- **Frontend**: Next.js 14 App Router, using Client Components (`"use client"`) for interactivity (forms, filtering, dynamic lists).
- **Backend**: Next.js Route Handlers (`src/app/api/...`) providing a clean RESTful API interface.
- **Styling**: Tailwind CSS with native Dark Mode support and responsive design.
- **Database**: SQLite handled through Prisma ORM for strict type-safety and seamless migrations.

## API Endpoints

- `GET /api/expenses` - List expenses (supports sorting and category filtering)
- `POST /api/expenses` - Create a new expense (supports idempotency keys to prevent duplicates)
- `PATCH /api/expenses/:id` - Update an existing expense
- `DELETE /api/expenses/:id` - Delete an expense

---

## Assignment Notes

### Key Design Decisions
- **Next.js App Router**: Chosen for its seamless integration of frontend UI and backend API routes. This eliminates the overhead of running and maintaining a separate backend service.
- **SQLite over PostgreSQL/MySQL**: Selected to ensure the application is portable and immediately runnable by reviewers without requiring external database servers or Docker containers.
- **Zod Validation**: Used extensively for strict payload validation in the API. It guarantees that malformed data never touches the database and provides excellent TypeScript inference.
- **Idempotency Keys**: Implemented on the `POST` endpoint to safely handle network retries and prevent accidental duplicate expense submissions.

### Trade-offs Made Because of the Timebox
- **Authentication**: A full JWT authentication system was explored but ultimately stripped out. To respect the timebox and minimize setup friction for reviewers, the app currently operates as a single-tenant workspace.
- **State Management**: Opted for standard React hooks (`useState`, `useMemo`, `useEffect`) rather than introducing complex state libraries like Redux or Zustand. The app's current scale makes local state completely sufficient.
- **Data Fetching**: Built a lightweight, custom HTTP wrapper (`requestJson`) with built-in retry logic instead of pulling in heavier caching libraries like React Query or SWR.

### What Was Intentionally NOT Done
- **Server-Side Pagination**: The expense list fetches all data at once and relies on client-side filtering. For a massive production dataset, cursor-based server pagination would be required.
- **Multi-User Architecture**: The database currently tracks expenses globally. Associating expenses with specific user IDs was intentionally omitted to keep the review process simple.
- **E2E Testing**: Comprehensive End-to-End browser testing (e.g., Cypress/Playwright) was skipped in favor of focusing on core logic, type safety, and a polished UI delivery.
