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
git clone (https://github.com/majid1222/inventory-management-task)
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
  - Stock updates persisted to `data/transfers.json` and `data/stock.json`
  - Transfer history view
- Low Stock Alert & Reorder System
  - Aggregates stock across warehouses
  - Categories: critical, low, adequate, overstocked
  - Reorder recommendations and recommended quantities
  - Alerts lifecycle persisted in `data/alerts.json` (NEW → ACKNOWLEDGED → ORDERED → RESOLVED)

---

## Project structure (key files)

- src/pages/
  - `index.js` — Dashboard
  - `transfers.js` — Transfers UI and form
  - `alerts.js` — Alerts management UI
  - `api/` — API routes for products, warehouses, stock, transfers, alerts
- lib/
  - `data.js` — centralized business logic (load/save, transfers, alerts, metrics)
- data/
  - `products.json`, `warehouses.json`, `stock.json`, `transfers.json`, `alerts.json`
- `package.json` — scripts and dependencies

---

## Manual test checklist

1. Start the app:
   ```bash
   npm install
   npm run dev
   ```
2. Dashboard (`/`)
   - KPIs render, chart displays, inventory list shows items.
   - Resize browser to confirm responsiveness (cards stack, chart scales, table scrolls).
3. Transfers (`/transfers`)
   - Successful transfer: source decreases, destination increases, history shows entry.
   - Error cases:
     - `quantity > available` → validation error
     - `fromWarehouse === toWarehouse` → validation error
     - `quantity <= 0` → validation error
4. Alerts (`/alerts`)
   - Generate alerts by refreshing page or calling `/api/alerts`.
   - NEW alerts appear for low/critical products with recommendations.
   - Use workflow actions to ACK / ORDER / RESOLVE.
   - Simulate replenishment by editing `data/stock.json` and refresh to auto‑resolve.

API sanity checks
- Confirm endpoints return arrays where expected: `/api/products`, `/api/warehouses`, `/api/stock`, `/api/transfers`, `/api/alerts`.

---

## Code Explanation (3–4 minutes) — notes for the video

Key technical decisions and approach
- Centralized business logic in `lib/data.js` so APIs and pages reuse the same authoritative functions (`load/save`, `performStockTransfer`, `generateAlerts`, `updateAlertStatus`, derived metrics).
- JSON file persistence to keep the demo self‑contained and easy to evaluate; tradeoff: not concurrent‑safe — recommend a DB (Postgres/Mongo) for production.
- Material‑UI for fast, accessible responsive UI; Recharts for charts.
- Defensive APIs and client code: always normalize responses (Array.isArray checks) to prevent runtime `.map` failures.

Most challenging aspects and solutions
- Maintaining data integrity when updating stock and recording transfers: apply stock changes first and persist them before appending transfer history to ensure consistency.
- Alerts lifecycle and auto‑resolve logic: `generateAlerts()` refreshes categories and updates workflow statuses cleanly.
- Responsive inventory layout: used `TableContainer` with horizontal scroll and provided a card/grid alternative to avoid layout breakage on small screens.

Code structure highlights
- `lib/data.js` — single source of truth for data operations and business rules
- `pages/api/*` — thin wrappers calling `lib` functions and returning normalized JSON
- `pages/index.js`, `pages/transfers.js`, `pages/alerts.js` — UI pages with defensive fetch and clear user feedback
- `data/*.json` — persistent storage files; ensure they exist and start as arrays (even empty `[]`)  

Record the 3–4 minute section showing these points and open the key files while narrating.

---

## Reflection (1–2 minutes) — notes for the video

What I'm proud of
- Clear separation of UI and business logic (`lib/data.js`) so flows are easy to reason about and test.
- Defensive coding to avoid common runtime crashes (e.g., ensuring API returns arrays).
- A compact, usable workflow for transfers and alerts that demonstrates business value.

Known limitations or trade‑offs
- JSON persistence is not suitable for concurrent access or production workloads.
- No authentication/authorization layer.
- No automated tests; alerts are generated on demand rather than by a background worker.

What I'd improve with more time
- Replace JSON files with a transactional database and migrations.
- Add role‑based access control and audit logging for transfers and alerts.
- Implement a background worker to continuously generate alerts and send notifications (email/SMS).
- Add unit and E2E tests and CI checks.

---

## Dependencies added

Ensure these (or equivalent) are listed in `package.json` if used:
- @mui/material
- @mui/icons-material
- @emotion/react
- @emotion/styled
- recharts

---

## Implementation summary (completed)

**Name:** Sonny  
**Completion time:** 2025-11-08 13:25 (UTC+03:30)

### Features completed
- Task 1: Redesigned responsive Dashboard — KPI cards, Recharts warehouse chart, inventory overview
- Task 2: Stock Transfer System — API endpoints, validation, persistence (`data/transfers.json`), UI, history
- Task 3: Low Stock Alert & Reorder System — alerts generation, categories, reorder recommendations, workflow persisted (`data/alerts.json`)

### Key technical decisions
- Centralized business logic in `lib/data.js` for clarity and reuse
- JSON files for demo persistence to keep the project self-contained and easy to evaluate
- Material UI (MUI) for responsive UI components and Recharts for visualizations
- Defensive API responses and client-side fallbacks (Array checks) to prevent runtime errors

### Known limitations
- JSON persistence not concurrent-safe; migrate to a DB for production workloads
- No authentication or role-based permissions
- No automated tests (unit or E2E)
- Date-based IDs used for simplicity (consider UUIDs in production)

### Testing instructions
1. Install and run:
   ```bash
   npm install
   npm run dev
   ```
2. Visit:
   - `/` — Dashboard
   - `/transfers` — Transfer form and history
   - `/alerts` — Alerts and workflows
3. Modify `data/*.json` to simulate scenarios and re-check pages or call API endpoints (e.g., `/api/alerts`) to regenerate alerts.

---

## Commits and submission notes

- Keep commits small and descriptive (examples: `feat: dashboard layout`, `fix: transfer validation`, `feat: alerts system`).
- Verify `data/transfers.json` and `data/alerts.json` exist and are valid arrays (`[]`) to prevent UI runtime errors.

---
