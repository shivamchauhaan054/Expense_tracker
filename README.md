# Expense Tracker (Next.js 14 + Prisma + SQLite)

Minimal, production-ready starter for a full-stack expense tracker using:

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Prisma
- SQLite

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
copy .env.example .env
```

3. Generate Prisma client and run first migration:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Run the app:

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Architecture

- `src/app`: Next.js App Router UI and API routes.
- `src/app/api/expenses`: CRUD endpoints for expenses.
- `src/components`: client components (form/list).
- `src/lib/prisma.ts`: singleton Prisma client.
- `prisma/schema.prisma`: DB schema.

## API Endpoints

- `GET /api/expenses` - list expenses
- `POST /api/expenses` - create expense
- `PATCH /api/expenses/:id` - update expense
- `DELETE /api/expenses/:id` - delete expense
