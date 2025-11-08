# Multi-Warehouse Inventory Management System

A compact inventory management demo built with Next.js and Material‑UI (MUI).  
Implements a redesigned responsive dashboard, a stock transfer workflow with validation and history, and a low‑stock alert & reorder system with recommendations and workflow tracking.

---

## Quick start

Prerequisites
- Node.js 16+ (18+ recommended)
- npm

Run locally
```bash
git clone <your-repo-url>
cd <your-repo-folder>
npm install
npm run dev
# open http://localhost:3000
```

---

## Features (high level)

- Dashboard
  - Responsive KPI cards (products, warehouses, inventory value)
  - Warehouse stock bar chart (Recharts)
  - Inventory list with search and category filters
- Stock Transfer System
  - Transfer form with client/server validation
  - Stock updates persisted to data/transfers.json and data/stock.json
  - Transfer history view
- Low Stock Alert & Reorder System
  - Aggregates stock across warehouses
  - Categories: critical, low, adequate, overstocked
  - Reorder recommendations and recommended quantities
  - Alerts lifecycle persisted in data/alerts.json (NEW → ACKNOWLEDGED → ORDERED → RESOLVED)

---

## Project structure (key files)

- src/pages/
  - index.js — Dashboard
  - transfers.js — Transfers UI and form
  - alerts.js — Alerts management UI
  - api/ — API routes for products, warehouses, stock, transfers, alerts
- lib/
  - data.js — centralized business logic (load/save, transfers, alerts, metrics)
- data/
  - products.json, warehouses.json, stock.json, transfers.json, alerts.json
- package.json — scripts and dependencies

---

## Manual test checklist

1. Start the app:
   - npm install && npm run dev
2. Dashboard (/)
   - KPIs render, chart displays, inventory list shows items.
   - Resize browser to confirm responsiveness (cards stack, chart scales, table scrolls).
3. Transfers (/transfers)
   - Successful transfer: source decreases, destination increases, history shows entry.
   - Error cases:
     - quantity > available → validation error
     - fromWarehouse === toWarehouse → validation error
     - quantity ≤ 0 → validation error
4. Alerts (/alerts)
   - Generate alerts by refreshing page or calling /api/alerts.
   - NEW alerts appear for low/critical products with recommendations.
   - Use workflow actions to ACK / ORDER / RESOLVE.
   - Simulate replenishment by editing data/stock.json and refresh to auto‑resolve.

API sanity checks
- Confirm endpoints return arrays where expected: /api/products, /api/warehouses, /api/stock, /api/transfers, /api/alerts.

---

## Code Explanation (3–4 minutes) — notes for the video

Key technical decisions and approach
- Centralized business logic in lib/data.js so APIs and pages reuse the same authoritative functions (load/save, performStockTransfer, generateAlerts, updateAlertStatus, derived metrics).
- JSON file persistence to keep the demo self‑contained and easy to evaluate; tradeoff: not concurrent‑safe — recommend a DB (Postgres/Mongo) for production.
- Material‑UI for fast, accessible responsive UI; Recharts for charts.
- Defensive APIs and client code: always normalize responses (Array.isArray checks) to prevent runtime .map failures.

Most challenging aspects and solutions
- Maintaining data integrity when updating stock and recording transfers: solved by applying stock changes first and persisting before appending transfer history.
- Alerts lifecycle and auto‑resolve logic: designed generateAlerts() to refresh categories and set workflow statuses cleanly.
- Responsive inventory layout: used TableContainer with overflowX for table responsiveness and provided an alternative Grid/card layout pattern.

Code structure highlights
- lib/data.js — single source of truth for data operations and business rules
- pages/api/* — thin wrappers that call lib functions and return normalized JSON
- pages/index.js, pages/transfers.js, pages/alerts.js — UI pages with defensive fetch and clear user feedback
- data/*.json — persistent storage files; ensure they exist and start as arrays (even empty [])  

Record a 3–4 minute section showing these points and open the key files while narrating.

---

## Reflection (1–2 minutes) — notes for the video

What I'm proud of
- Clear separation of UI and business logic (lib/data.js) so flows are easy to reason about and test.
- Defensive coding to avoid common runtime crashes (e.g., ensuring API returns arrays).
- A compact, usable workflow for transfers and alerts that demonstrates business value.

Known limitations or trade‑offs
- JSON persistence is not suitable for concurrent access or production workloads.
- No authentication/authorization layer.
- No automated tests; no background job processing for alerts (alerts generated on demand).

What I'd improve with more time
- Replace JSON files with a transactional database and migrations.
- Add role‑based access and audit logging for transfers and alerts.
- Implement background worker to continuously generate alerts and send notifications (email/SMS).
- Add unit and E2E tests and CI checks.

---

## Dependencies added (examples)

List any packages you added here (fill before submission):
- @mui/material
- @mui/icons-material
- @emotion/react
- @emotion/styled
- recharts

Ensure package.json is updated accordingly.

---

## Implementation summary (fill before submitting)

**Name:** [Your name]  
**Completion time:** [YYYY-MM-DD HH:MM timezone]  

### Features completed
- Task 1: Redesigned responsive Dashboard — KPI cards, chart, inventory overview
- Task 2: Stock Transfer System — API, validation, persistence, UI, history
- Task 3: Low Stock Alert & Reorder System — alerts generation, recommendations, workflows

### Key technical decisions
- Centralized business logic in lib/data.js
- JSON for demo persistence to keep the repo self-contained
- MUI + Recharts for UI and charts
- Defensive API responses and client fallbacks

### Known limitations
- JSON persistence not concurrent-safe
- No authentication
- No automated tests

### Testing instructions
1. npm install && npm run dev
2. Visit: /, /transfers, /alerts
3. Modify data/*.json to simulate scenarios and retry endpoints

### Video walkthrough link
[Paste your unlisted YouTube / Loom link here]

---

If you want, I will:
- Insert your name and completion time into the Implementation Summary and produce the final README.md file (ready to paste), or
- Create a downloadable README.md and provide it as a file card. Which would you prefer?
