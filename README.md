# Creator Deal Hub

A SaaS brand deal management platform for content creators — built with Next.js, Supabase, and Prisma.

## Stack

- **Framework:** Next.js 16 App Router (TypeScript)
- **Database:** PostgreSQL via Supabase + Prisma 7 ORM
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS (Linear-inspired dark aesthetic)
- **Deployment:** Vercel

## Features

- **Deal Pipeline** — full CRUD, status tracking, lifecycle checkboxes (deposit/content/posted/paid), CSV export
- **Partnerships** — long-term brand relationships with deadlines, speaking slots, and co-development products
- **Alerts & Money** — color-coded invoice and payment flags
- **Projects** — personal project tracker with progress checklists

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd creatordashboard
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 3. Run database migrations

Generate the SQL and run it in the Supabase SQL Editor, or push directly if port 5432 is accessible:

```bash
npx prisma db push
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    (dashboard)/          # Protected dashboard routes
      deals/              # Deal pipeline
      partnerships/       # Long-term partnerships
      alerts/             # Invoice alerts
      projects/           # Personal projects
    actions/              # Server Actions (DB mutations)
    login/                # Auth pages
    signup/
  components/
    Sidebar.tsx           # Nav sidebar
  lib/
    prisma.ts             # Prisma client
    supabase/             # Supabase SSR clients
prisma/
  schema.prisma           # Full data model
prisma.config.ts          # Prisma 7 datasource config
```

## Docs

See [PRD.md](./PRD.md) for the full Product Requirements Document.
