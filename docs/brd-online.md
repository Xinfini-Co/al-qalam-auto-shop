# Business Requirements Document
## Al Qalam Auto Shop — Invoice System (Online / Cloud)

**Version:** 1.0
**Date:** 2026-06-29
**Prepared by:** Xinfini
**Client:** Al Qalam Auto Shop
**Delivery:** Flutter Application (Windows + Web) — Cloud-Connected via Supabase

---

## 1. Executive Summary

Al Qalam Auto Shop requires a cloud-connected invoicing system accessible from any device. The application is built with Flutter and connects directly to Supabase (PostgreSQL + Auth + Storage) — no separate backend server is needed, reducing infrastructure cost and complexity. Data is stored securely in the cloud and accessible from any authorized device.

---

## 2. Scope

### In Scope
- All features from the offline version
- Secure multi-device access (login from PC, laptop, tablet)
- Cloud database with real-time sync (Supabase)
- Invoice PDF storage in Supabase Storage
- User authentication and role-based access
- Automatic cloud backup (no manual backup needed)
- Software updates delivered automatically

### Out of Scope
- Customer-facing public portal (future phase)
- Integration with external accounting software (future phase)
- Mobile (iOS/Android) app (future phase — easy to add with Flutter)

---

## 3. Stakeholders

| Role | Name |
|---|---|
| Client / Owner | Al Qalam Auto Shop |
| Development | Xinfini |
| Cloud Provider | Supabase |

---

## 4. Functional Requirements

### 4.1 Authentication & Access
- Email + password login via Supabase Auth
- Role-based access: Admin (full access), Staff (view + create jobs/invoices, no settings/reports)
- Session persistence — stay logged in across app restarts
- Password reset via email

### 4.2 Client Management
- Add, edit, deactivate clients
- Fields: full name, phone, email, address
- Search and filter by name or phone
- Client history: all jobs and invoices linked

### 4.3 Vehicle Management
- Add, edit vehicles linked to a client
- Fields: make, model, year, color, plate number, VIN (optional)
- View all vehicles per client

### 4.4 Job / Repair Order
- Create jobs linked to client + vehicle
- Line items: description, quantity, unit price (labor and parts)
- Status: Draft → In Progress → Completed
- Notes / remarks
- Auto-calculated subtotal, tax (configurable %), total

### 4.5 Invoice Generation
- Auto-generate invoice from completed job
- Invoice number: auto-increment with configurable prefix
- Invoice date and due date
- Shop branding on invoice: logo (from Supabase Storage), name, address, phone, CR/VAT number
- Line items table with subtotal, tax, total
- Notes / terms and conditions

### 4.6 Invoice Preview & Export
- On-screen preview
- Export to PDF — saved to Supabase Storage and downloadable locally
- Print directly from app
- Share invoice link (optional, if public URL enabled)

### 4.7 Payment Recording
- Full or partial payment recording
- Payment methods: Cash, Card, Bank Transfer, Other
- Invoice status: Unpaid, Partially Paid, Paid
- Payment history log per invoice

### 4.8 Outstanding Payments
- Dashboard list of unpaid and partially paid invoices
- Total outstanding amount summary
- Overdue highlighting (past due date)

### 4.9 Reports
- Revenue by date range
- Jobs count by status
- Outstanding balance report
- Top clients by revenue
- Export reports to PDF or CSV

### 4.10 Settings
- Shop profile: name, logo upload, address, phone, CR/VAT number
- Tax rate configuration
- Invoice prefix and starting number
- Currency symbol
- User management (Admin only): invite/remove staff

### 4.11 Notifications (Basic)
- In-app alert for overdue invoices
- Email notification to client on invoice creation (optional, via Supabase email)

---

## 5. Non-Functional Requirements

| Requirement | Detail |
|---|---|
| Platform | Windows 10/11 Desktop + Browser (Flutter Web) |
| Framework | Flutter |
| Backend | Supabase (no custom server) |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| File Storage | Supabase Storage (logos, PDFs) |
| Connectivity | Requires internet for all operations |
| Security | Row-Level Security (RLS) on all Supabase tables |
| Performance | Invoice generation < 3s, page loads < 2s |
| Updates | Auto-updated via web; desktop installer updated via new release |

---

## 6. User Interface Requirements

- Clean, modern UI suitable for non-technical shop manager
- Arabic and English language support (RTL-ready)
- Light and dark mode
- Responsive layout for use on tablet or laptop if needed

---

## 7. Architecture Overview

```
Flutter App (Desktop / Web)
        │
        ▼
  Supabase Client SDK
        │
   ┌────┴─────────────────┐
   │                      │
Supabase DB          Supabase Storage
(PostgreSQL + RLS)   (Logos, PDFs)
   │
Supabase Auth
(Email/Password, JWT)
```

No custom backend. All business logic lives in the Flutter app and Supabase Row-Level Security policies.

---

## 8. Data Model (Summary)

```
profiles           → linked to Supabase Auth users, stores role
clients            → shop's clients
vehicles           → linked to clients
jobs               → linked to vehicles + clients, with line_items (JSONB)
invoices           → linked to jobs
payments           → linked to invoices
settings           → shop config (single row per account)
```

---

## 9. Assumptions & Constraints

- Stable internet required at the shop (minimum 5 Mbps)
- Supabase free tier sufficient for early stage; paid plan (~$25/month) for growth
- Client is responsible for Supabase subscription after handover (or Xinfini manages it)
- VAT defaults to 15% (Saudi regulations), configurable

---

## 10. Acceptance Criteria

- Login and role-based access working correctly
- All CRUD operations for clients, vehicles, jobs, invoices function correctly
- Invoice PDF generated, stored in Supabase Storage, and downloadable
- Data persists and syncs correctly across two devices logged into the same account
- RLS policies prevent unauthorized data access

---

## 11. Delivery Milestones

| Milestone | Deliverable |
|---|---|
| M1 — Design | UI mockups, navigation flow, Supabase schema design, approved by client |
| M2 — Auth & Setup | Supabase project setup, auth, RLS policies, Flutter project scaffold |
| M3 — Core Modules | Client, vehicle, job modules working with cloud sync |
| M4 — Invoicing | Invoice generation, PDF export + storage, payments |
| M5 — Reports & Settings | Reports, shop settings, user management |
| M6 — QA & Delivery | Testing, deployment, handover + training |
