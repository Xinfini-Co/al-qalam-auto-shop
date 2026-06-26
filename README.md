# Al Qalam Auto Shop (AQAS)

A premium, demo-ready **auto repair shop management** web app for **Al Qalam Auto Maintenance Workshop**, Sharjah – U.A.E. Single shop (not multi-tenant), English only, dark-first with a light toggle. Built to look great on a phone for clients tracking jobs and on desktop for the workshop admin.

> ⚡ The frontend runs **standalone on mock data** — `cd frontend && npm install && npm run dev` and you have a full working demo with **no backend needed**. The NestJS + Prisma backend is fully wired and can be switched on with one env var.

```
al-qalam-auto-shop/
├── frontend/   Next.js 14 (App Router) · TypeScript · Tailwind · shadcn-style UI · Recharts · TanStack Query · react-to-print
├── backend/    NestJS · Prisma · SQLite (Postgres-ready) · JWT auth · class-validator
├── shared/     Shared TypeScript domain types (type-only, used by both apps)
└── README.md
```

## Brand

Signature gradient — **electric red → magenta → blue** (`#E31937 → #9B1C8E → #2563EB`) used for the AQAS logo, primary-button hover, active nav and chart accents. Everything else stays neutral charcoal/gray so the gradient stays special.

| Token | Hex |
|---|---|
| Primary (red) | `#E31937` |
| Mid (magenta) | `#9B1C8E` |
| Secondary (blue) | `#2563EB` |
| Background dark | `#0A0A0B` |
| Surfaces | `#18181B` / `#27272A` |
| Success / Warning / Danger | `#22C55E` / `#F59E0B` / `#EF4444` |

The animated **AQAS** monogram lives in [`frontend/components/brand/Logo.tsx`](frontend/components/brand/Logo.tsx) (`size`, `variant`, `animated` props; respects `prefers-reduced-motion`) and as `frontend/app/icon.svg` (favicon).

---

## Quick start (demo — frontend only)

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

That's it. Explore:

- **/** — landing page (hero, services, CTA)
- **/track** — track a job by phone or invoice (try invoice **0457** or phone **055-6620775**)
- **/services**, **/contact**
- **/admin/login** — sign in with the demo credentials below
- **/admin** — dashboard, clients, vehicles, jobs, payments, reports, settings

### Demo credentials

```
admin@alqalam.ae  /  admin123
```

---

## Running the full stack (frontend + backend)

### 1. Backend (NestJS + Prisma + SQLite)

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init   # creates dev.db + tables
npm run seed                         # 8 clients, 12 vehicles, 15 jobs (incl. invoice 0457)
npm run start:dev                    # http://localhost:4000
```

### 2. Point the frontend at the backend

```bash
cd frontend
cp .env.local.example .env.local
# set NEXT_PUBLIC_USE_BACKEND=true
npm run dev
```

The frontend's data layer ([`frontend/lib/api.ts`](frontend/lib/api.ts)) has identical signatures for mock and real API, so flipping that one variable is the only change.

---

## Key features

- **Public site** — landing, services, contact, and a mobile-optimised **/track** with a status timeline (Pending → In progress → Completed → Ready for pickup), estimate, amount paid and remaining balance.
- **Admin dashboard** — today's revenue, active jobs, cars in shop, total outstanding, a 30-day revenue chart, jobs-by-status donut, recent jobs and outstanding list (all Recharts).
- **Clients / Vehicles** — searchable tables with add/edit/delete and a client profile (vehicles + full job history + total spent + outstanding).
- **Jobs & Invoice Entry Form** — auto-numbered invoices (starting **0457**), inline new client/vehicle, an editable **S.No · Description · Qty · Rate · Amount** line-item table with live totals, transport type, and an initial-payment section that shows the remaining balance.
- **Payments / accounting** — multiple partial payments per job, prominent remaining balance, Paid/Partial/Unpaid badges, Cash/Card/Bank methods, daily cash report, monthly revenue and a debtors list.
- **Reports** — revenue by period (7/30/90 days), revenue by service type, top clients, outstanding receivables.
- **Invoices** — print-ready A4 **Client invoice** and **Shop copy** (react-to-print) recreating the Al Qalam paper estimate with **Dhs · Fils** columns, totals, paid and remaining-balance rows, and signature lines.

## Architecture notes

- **No multi-tenancy** — single shop, no organization/tenant tables. Structured cleanly so it can grow into SaaS later.
- **Money math is centralised** — never computed in UI components. See [`frontend/lib/money.ts`](frontend/lib/money.ts) and [`backend/src/common/money.ts`](backend/src/common/money.ts) (kept in sync).
- **Shared types** — [`shared/index.ts`](shared/index.ts) is imported by both apps via the `@shared` path alias. It is intentionally **type-only**, so nothing crosses the package boundary at runtime.
- **Currency** — AED (Dhs.), formatted in `en-AE`.

## Scripts

| Location | Command | Does |
|---|---|---|
| `frontend` | `npm run dev` | Next.js dev server on :3000 |
| `frontend` | `npm run build` / `npm run typecheck` | Production build / TS check |
| `backend` | `npm run start:dev` | NestJS watch mode on :4000 |
| `backend` | `npm run migrate` | Prisma migrate (creates SQLite db) |
| `backend` | `npm run seed` | Seed demo data |

From the repo root you can also use `npm run dev:frontend` / `npm run dev:backend` (see root `package.json`).
