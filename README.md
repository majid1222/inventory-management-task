# Multi-Warehouse Inventory Management System

## Overview
Enhance the existing Multi-Warehouse Inventory Management System built with Next.js and Material-UI (MUI) for GreenSupply Co, a sustainable product distribution company. The current system is functional but needs significant improvements to be production-ready.

## 🎯 Business Context
GreenSupply Co distributes eco-friendly products across multiple warehouse locations throughout North America. They need to efficiently track inventory across warehouses, manage stock movements, monitor inventory values, and prevent stockouts. This system is critical for their daily operations and customer satisfaction.

## 🛠️ Tech Stack
- [Next.js](https://nextjs.org/) - React framework
- [Material-UI (MUI)](https://mui.com/) - UI component library
- [React](https://reactjs.org/) - JavaScript library
- JSON file storage (for this assessment)

## 📋 Current Features (Already Implemented)
The basic system includes:
- ✅ Products management (CRUD operations)
- ✅ Warehouse management (CRUD operations)
- ✅ Stock level tracking per warehouse
- ✅ Basic dashboard with inventory overview
- ✅ Navigation between pages
- ✅ Data persistence using JSON files

**⚠️ Note:** The current UI is intentionally basic. We want to see YOUR design skills and creativity.

Name: [Your full name] Completion Time: [YYYY-MM-DD HH:MM (timezone)]

Features completed
Task 1: Redesigned Dashboard — responsive KPIs, warehouse chart, inventory overview

Task 2: Stock Transfer System — validated API, persistence, UI, transfer history

Task 3: Low Stock Alerts — alert generation, categories, reorder recommendations, workflows

Key technical decisions
Centralized business logic in lib/data.js (load/save, transfers, alerts, metrics)

JSON files for persistence to keep the demo self-contained

Material UI (MUI) for layout and components

Recharts for visualization

Defensive API responses (ensure arrays) to prevent runtime .map errors

Known limitations
JSON file persistence not safe for concurrent writes — use a real DB in production

No authentication/authorization

No automated tests (unit or E2E)

Date-based IDs for simplicity (consider UUIDs in production)

Testing instructions
Start app:

bash
npm install
npm run dev
Visit:

/ — Dashboard

/transfers — Transfer form and history

/alerts — Alerts and workflows

Use provided sample data in /data or modify JSON files to simulate scenarios.

Video walkthrough link
[Paste your unlisted video URL here]

New dependencies added
List all dependencies you added (example):

@mui/material

@mui/icons-material

@emotion/react

@emotion/styled

recharts

Final notes
Keep commits granular and descriptive (e.g., feat: add alerts generation, fix: transfers validation).

Verify that data/transfers.json and data/alerts.json exist and are valid arrays ([]) to prevent UI runtime errors.

If you want, add a short troubleshooting section listing any known startup errors and fixes.---

**Setup issues?** Verify Node.js is installed and you're using a modern browser. If problems persist, document them in your submission.
