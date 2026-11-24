# Business Requirements Document
## Al Qalam Auto Shop — Invoice System (Offline Desktop)

**Version:** 1.0
**Date:** 2026-06-29
**Prepared by:** Xinfini
**Client:** Al Qalam Auto Shop
**Delivery:** Flutter Desktop Application (Windows) — Offline / Standalone

---

## 1. Executive Summary

Al Qalam Auto Shop requires a standalone desktop invoicing system that operates fully offline. The application will be installed on the shop's Windows PC and store all data locally using SQLite. No internet connection is required for any core operation. PDF invoices can be printed or saved locally.

---

## 2. Scope

### In Scope
- Client management
- Vehicle management
- Job / repair order creation and management
- Invoice generation, preview, and PDF export
- Payment recording and tracking
- Basic financial reports
- Shop branding configuration (logo, name, address on invoices)
- Local data backup and restore

### Out of Scope
- Online access or cloud sync
- Multi-device or multi-user access (single workstation)
- Customer-facing portal or tracking page
- Integration with external accounting software (future phase)

---

## 3. Stakeholders

| Role | Name |
|---|---|
| Client / Owner | Al Qalam Auto Shop |
| Development | Xinfini |

---

## 4. Functional Requirements

### 4.1 Client Management
- Add, edit, deactivate clients
- Fields: full name, phone number, email (optional), address (optional)
- Search and filter clients by name or phone

### 4.2 Vehicle Management
- Add, edit vehicles linked to a client
- Fields: make, model, year, color, plate number, VIN (optional)
- View all vehicles for a given client

### 4.3 Job / Repair Order
- Create a job linked to a client and vehicle
- Add line items: description, quantity, unit price (labor and parts)
- Set job status: Draft → In Progress → Completed
- Notes / remarks field
- Auto-calculated subtotal, tax (configurable %), and total

### 4.4 Invoice Generation
- Auto-generate invoice from a completed job
- Invoice number (auto-increment, configurable prefix e.g. AQ-0001)
- Invoice date and due date
- Shop branding: logo, name, address, phone, CR number
- Line items table with subtotal, tax, and total
- Notes / terms and conditions field

### 4.5 Invoice Preview & Export
- Full on-screen print preview
- Export to PDF (saved locally)
- Print directly from the app

### 4.6 Payment Recording
- Record full or partial payments against an invoice
- Payment methods: Cash, Card, Bank Transfer, Other
- Mark invoice as: Unpaid, Partially Paid, Paid
- Payment history log per invoice

### 4.7 Outstanding Payments
- Dashboard list of all unpaid and partially paid invoices
- Total outstanding amount summary

### 4.8 Reports
- Revenue report by date range
- Jobs count by status
- Outstanding balance report
- Export reports to PDF or CSV

### 4.9 Settings
- Shop profile: name, logo, address, phone, CR/VAT number
- Tax rate configuration
- Invoice number prefix and starting number
- Currency symbol

### 4.10 Data Backup & Restore
- Manual backup: export full database to a file
- Restore from backup file
- Backup reminder notification (configurable interval)

---

## 5. Non-Functional Requirements

| Requirement | Detail |
|---|---|
| Platform | Windows 10 / 11 (64-bit) |
| Framework | Flutter (Desktop) |
| Database | SQLite (local) |
| Offline | 100% — no internet dependency |
| Performance | App launch < 3s, invoice generation < 2s |
| PDF Generation | Local, no external service |
| Installer | Windows `.exe` installer (NSIS or Inno Setup) |
| Updates | Manual update via new installer package |

---

## 6. User Interface Requirements

- Clean, modern UI suitable for a non-technical shop manager
- Arabic and English language support (RTL-ready)
- Light and dark mode
- Single-user, no login required (optional PIN lock for settings)

---

## 7. Data Model (Summary)

```
Client         → has many Vehicles
Vehicle        → belongs to Client, has many Jobs
Job            → belongs to Vehicle + Client, has many LineItems, has one Invoice
Invoice        → belongs to Job, has many Payments
Payment        → belongs to Invoice
Settings       → single-row config table
```

---

## 8. Assumptions & Constraints

- Single workstation installation (not networked)
- Data is not synced to any cloud service
- Client is responsible for regular manual backups
- VAT/tax logic follows local Saudi regulations (15% default, configurable)

---

## 9. Acceptance Criteria

- All CRUD operations for clients, vehicles, jobs, invoices function correctly
- Invoice PDF matches the preview exactly
- Backup and restore successfully round-trips all data
- App runs without internet on a clean Windows 11 machine

---

## 10. Delivery Milestones

| Milestone | Deliverable |
|---|---|
| M1 — Design | UI mockups, navigation flow, approved by client |
| M2 — Core | Client, vehicle, job modules working |
| M3 — Invoicing | Invoice generation, PDF export, payments |
| M4 — Reports & Settings | Reports, shop settings, backup/restore |
| M5 — QA & Delivery | Testing, installer, handover + training |
