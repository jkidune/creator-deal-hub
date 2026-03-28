# Creator Deal Hub — Product Requirements Document

**Version:** 1.0
**Date:** 2026-03-28
**Status:** In Development

---

## 1. Overview

**Creator Deal Hub** is a SaaS deal-management platform for content creators. It replaces ad-hoc spreadsheets and email threads with a single workspace to track brand deals, long-term partnerships, payment alerts, and personal projects — all in one Linear-inspired dark interface.

---

## 2. Problem Statement

Content creators managing brand deals face:
- No single source of truth for deal status, deadlines, and payment state
- Missed invoices and overdue payments go unnoticed
- Long-term partnership activity (ambassador, speaking, co-development) is scattered
- No easy way to see what needs action today vs. this week

---

## 3. Target Users

| Persona | Description |
|---|---|
| Solo creator | 5–50 active brand deals/year, manages everything themselves |
| Creator with manager | Manager needs read/edit access to the same pipeline |
| Agency managing creators | Multiple creator workspaces under one login (future tier) |

---

## 4. Goals

- **v1 (current):** Auth + DB + all core features. No billing.
- **v2:** Stripe subscription, team seats, email/WhatsApp notifications.
- **v3:** Multi-creator agency workspace, API integrations (Gmail parsing, Notion sync).

---

## 5. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 App Router | Server Actions, RSC, file-based routing |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| Database | PostgreSQL (Supabase) | Managed, free tier, realtime options |
| ORM | Prisma 7 | Type-safe queries, migrations |
| Auth | Supabase Auth | Email/password + social, session management |
| Deployment | Vercel | Zero-config Next.js |

---

## 6. Design System

| Token | Value |
|---|---|
| Background | `#0a0a0b` |
| Surface | `#111113` |
| Border | `rgba(255,255,255,0.06)` |
| Accent | `#5e6ad2` (Linear purple) |
| Text primary | `#e2e2e2` |
| Text muted | `#8b8d97` |
| Text dim | `#4e5058` |
| Font | Inter |

---

## 7. Core Features — v1 Scope

### 7.1 Auth
- Email/password sign-up and login via Supabase Auth
- Protected routes — middleware redirects unauthenticated users to `/login`
- Session stored in cookies (SSR-compatible)

### 7.2 Deal Pipeline
**Route:** `/deals`

The primary workspace. A creator's full pipeline of brand deals.

**Deal fields:**
| Field | Type | Notes |
|---|---|---|
| `brand` | string | Brand name |
| `contact` | string | Contact person |
| `value` | int | Deal value in USD cents |
| `status` | enum | See statuses below |
| `section` | enum | ACTIVE / HOT / INBOUND / CLOSED |
| `postDate` | date? | When content goes live |
| `depositPaid` | bool | |
| `contentMade` | bool | |
| `posted` | bool | |
| `paidInFull` | bool | |
| `conceptDone` | bool | |
| `nextAction` | string? | |
| `requirements` | string? | Hashtags, tags, bio link duration |
| `invoiceNotes` | string? | |
| `notes` | string? | Private notes |

**Deal statuses:**
`FILMING` · `POST_NOW` · `SIGNED` · `NEGOTIATING` · `BRIEF_RECEIVED` · `AWAITING_REPLY` · `NO_RESPONSE` · `STALLED` · `COMPLETE` · `PASSED`

**UI:**
- Topbar with deal count + "New deal" button
- Filter bar: All / Needs Action / Awaiting Reply / No Response / Closed
- Grouped rows by section (Active, Hot, Inbound, Closed)
- Expandable row — inline edit all fields
- CSV export of all deals

### 7.3 Partnerships
**Route:** `/partnerships`

Long-term brand relationships beyond single deals.

**Objects:**
- **Partnership** — brand name, role/title, contract value, renewal date, status
- **Deadline** — label, due date, linked to a partnership
- **Speaking Slot** — event name, date, time, fee, linked to partnership
- **Partner Product** — name, status (`CONCEPT` · `IN_DEVELOPMENT` · `LAUNCHED` · `PAUSED`)

**UI:**
- One card per partner brand
- Tabs within card: Overview / Deadlines / Speaking / Products

### 7.4 Alerts & Money
**Route:** `/alerts`

Invoice and payment flag management.

**Alert types:** `OVERDUE` · `WARNING` · `CONFIRMED` · `INFO`

**Fields:** `title`, `description`, `amount` (optional), `dueDate` (optional), `type`

**UI:**
- Color-coded cards (red/amber/green/blue)
- Quick dismiss (delete) action
- Sorted by type severity then date

### 7.5 Projects
**Route:** `/projects`

Long-term personal builds tracked separately from brand deals.

**Objects:**
- **Project** — title, description
- **ProjectItem** — text, done (bool), belongs to project

**UI:**
- 2-column card grid
- Progress bar per card (done/total)
- Inline add-item input (Enter to add)
- Click item to toggle done
- Delete project button

---

## 8. Data Model (Prisma)

```prisma
model User {
  id           String        @id @default(cuid())
  authId       String        @unique
  email        String        @unique
  name         String?
  deals        Deal[]
  partnerships Partnership[]
  alerts       Alert[]
  projects     Project[]
}

model Deal {
  id           String      @id @default(cuid())
  userId       String
  user         User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  brand        String
  contact      String?
  value        Int         @default(0)
  status       DealStatus  @default(AWAITING_REPLY)
  section      DealSection @default(INBOUND)
  postDate     DateTime?
  depositPaid  Boolean     @default(false)
  contentMade  Boolean     @default(false)
  posted       Boolean     @default(false)
  paidInFull   Boolean     @default(false)
  conceptDone  Boolean     @default(false)
  nextAction   String?
  requirements String?
  invoiceNotes String?
  notes        String?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

model Partnership {
  id           String         @id @default(cuid())
  userId       String
  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  brand        String
  role         String?
  value        Int            @default(0)
  renewalDate  DateTime?
  status       String?
  deadlines    Deadline[]
  speakingSlots SpeakingSlot[]
  products     PartnerProduct[]
  createdAt    DateTime       @default(now())
}

model Alert {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  description String?
  amount      Int?
  dueDate     DateTime?
  type        AlertType @default(INFO)
  createdAt   DateTime  @default(now())
}

model Project {
  id          String        @id @default(cuid())
  userId      String
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  description String?
  items       ProjectItem[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model ProjectItem {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  text      String
  done      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## 9. Routes & Pages

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing / redirect to `/deals` if authed |
| `/login` | Public | Email + password login |
| `/signup` | Public | Account creation |
| `/deals` | Auth required | Deal pipeline |
| `/partnerships` | Auth required | Long-term partnerships |
| `/alerts` | Auth required | Invoice alerts |
| `/projects` | Auth required | Personal projects |

---

## 10. Out of Scope — v1

- Billing / Stripe subscriptions
- Team seats / shared workspaces
- Email notifications
- WhatsApp/SMS notifications
- Gmail integration (deal parsing from email)
- Mobile app
- Public deal room / media kit

---

## 11. Success Metrics — v1

| Metric | Target |
|---|---|
| Auth flow (signup → dashboard) | < 30 seconds |
| Deal CRUD round-trip | < 500ms |
| All 4 core pages functional | 100% |
| Zero broken server actions | 100% |
| `.env` credentials never committed | 100% |

---

## 12. Roadmap

| Version | Focus |
|---|---|
| v1.0 | Auth + DB + 4 core pages (current) |
| v1.1 | Polish: search, sort, drag-to-reorder deals |
| v2.0 | Stripe billing, team seats, notifications |
| v3.0 | Agency multi-creator workspace, integrations |
