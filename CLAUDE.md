# NextNova HRMS Portal

> **Official project name:** NextNova HRMS Portal
> **Owner:** Dheeraj Rawat (rawatdhiraj007@gmail.com)
> **Status (June 2026):** ✅ Shippable. On hold while owner starts a new project.

This file is the canonical project memory. Any future Claude Code session
opened in this folder should read this first to resume work without losing context.

---

## How to resume in a future session

1. `cd /Users/dheerajrawat/Downloads/josmef-hrms-complete`
2. `claude` (or open this folder in Claude Code / VS Code)
3. Say: *"Resume work on NextNova HRMS Portal — read CLAUDE.md first."*
4. Claude will load this file and have full context.

---

## What this product is

**NextNova HRMS Portal** — a premium AI SaaS HRMS platform targeting clinics,
healthcare distributors, and SMEs in the Philippines. Inspired by Zoho People
in layout and Stripe/Linear in polish.

This is **Product #1** of a planned NextNova multi-product platform. Future
products (CRM, Sales Track, Clinical, Compliance) are NOT in this repo and are
parked for now.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript (strict, target es5) |
| Styling | Tailwind CSS with CSS-var theme (`--primary-*`, `--accent-*`) |
| Icons | Lucide |
| Font | Inter |
| State | React + localStorage (`nn:checkin`, `nn:workspace`, `nn:theme:applied`, `nn:sidebar:collapsed`) |
| Backend | Node + Express on Render → `https://josmef-hrms-backend.onrender.com` |
| Frontend deploy | Vercel (prod) — deploy with `npx vercel --prod --yes` from project root |
| Repo | https://github.com/rawatdhiraj007-sketch/josmef-hrms-.git (branch: `main`) |

---

## Folder layout

```
josmef-hrms-complete/        ← project root (folder name is legacy, product is NextNova HRMS Portal)
├── frontend/                ← Next.js app (all UI work happens here)
│   ├── src/app/
│   │   ├── dashboard/       ← HR/Admin side (Organization view)
│   │   ├── portal/          ← Employee self-service (My Space)
│   │   ├── kiosk/           ← Clock in/out kiosk
│   │   └── apply/           ← Public job application form
│   ├── src/components/
│   │   ├── layout/          ← Sidebar, Topbar, CheckInWidget
│   │   ├── portal/          ← FlipCounter, etc.
│   │   └── ...
│   └── public/branding/nextnova-logo.png   ← 1536×1024 official PNG
├── backend/                 ← Node/Express API (deployed to Render)
└── CLAUDE.md                ← THIS FILE
```

---

## What's complete ✅

**Core HRMS (production-ready):**
- Employees (201 file, licenses, contracts)
- Attendance (kiosk + online check-in/out widget in topbar with live HH:MM:SS timer)
- Leave management
- Payroll + 13th-month pay + Bonus runs
- Shift scheduling
- Training (Graphy API auto-sync)
- Compliance + PH gov reports (SSS / PhilHealth / BIR)
- Disciplinary, NTE, Incident Reports, Work Certificates
- Loans, Exit Clearance
- Audit log
- Analytics dashboards
- AI Hub (10 modules)

**Platform:**
- Authentication + RBAC (TESTING_OPEN_MODE is OFF — verify before deploys)
- Workspace branding + Theme Studio
- Landing page (premium, particles, theme showcase)
- Login + Apply page
- Employee Self-Service Portal (`/portal`) — Zoho-style My Space Overview with
  flip-counter clock, profile card, announcements feed
- Topbar (Zoho-style): My Space / Organization tabs, check-in widget,
  notifications, AI credits, apps grid
- Sidebar (Zoho-style): 78px dark navy icon column + "More" popover
- Dual-variant logo (PNG for light bg, SVG+HTML for dark bg)

---

## What's open 🟡

| Item | Notes |
|---|---|
| **Phase 2A** — Employees hub sub-tabs (Overview/Dashboard/Calendar/Delegation) | Started, not finished |
| **Leave Tracker page** (Zoho-style: My Data / Team / Holidays tabs with Leave Summary cards) | Designed in screenshot, not built |
| Landing page restructure as multi-product storefront | Discussed with owner, parked |

---

## Known tech debt 🔴

1. **35 themeColor metadata warnings** — Next.js 14 deprecation, every page. Not breaking, but noisy. ~1 hour to fix (move from `metadata.themeColor` to `viewport.themeColor` export).
2. Static announcements in `/portal` — no backend `/announcements` endpoint exists; mock data only.
3. No automated tests — manual QA only.
4. No error monitoring (Sentry not wired).
5. No marketing-site analytics (PostHog/Plausible not wired).

---

## Hard rules (do not break)

These were repeated guardrails from the owner throughout the build:

1. **DO NOT redesign the official logo.** Use `/branding/nextnova-logo.png` verbatim. Already wired via `@/components/Logo`.
2. **DO NOT modify backend APIs, database schema, routes, or authentication** without explicit owner approval. UI changes only.
3. **DO NOT enable `TESTING_OPEN_MODE`** — it auto-logs in as admin and is a security hole.
4. **DO NOT commit `.env` or any secrets.**
5. **DO NOT use force push to main.**
6. Folder name stays `josmef-hrms-complete` (legacy) but the **product name is "NextNova HRMS Portal"** everywhere user-facing.

---

## Deploy procedure

```bash
# from project root (NOT frontend/)
cd /Users/dheerajrawat/Downloads/josmef-hrms-complete

# verify build
cd frontend && npm run build && cd ..

# commit
git add -A
git commit -m "feat(scope): description"

# push
git push origin main

# deploy to Vercel prod
npx vercel --prod --yes
```

Vercel auto-deploys from `main`, but the manual `vercel --prod --yes` is the
reliable path. Backend on Render auto-deploys from `main` as well.

---

## Future vision (parked)

Owner sketched out a Zoho-style multi-product platform:

| Product | Status |
|---|---|
| **NextNova HRMS Portal** (this repo) | ✅ Built |
| NextNova CRM | ❌ Not built (and owner does not have an existing CRM despite earlier saying so) |
| NextNova Sales Track | ❌ Not built (likely merges into CRM) |
| NextNova Clinical | ❌ Not built (might be HRMS add-on, not standalone) |
| NextNova Compliance | ❌ Not built (compliance *module* exists inside HRMS) |

Owner's stated model: subdomains per product (hr.nextnova.ai, crm.nextnova.ai, etc.),
unified login at app.nextnova.ai, per-product subscriptions with a Suite bundle.
**Do not start building these inside this repo** — each should be its own codebase.

---

## Recent commit history (last 5)

```
f852e58 feat(portal): My Space Overview with flip-counter clock + activity feed
d1b492e feat(attendance): online Check-In / Check-Out widget with live timer
2b33a46 feat(shell): Zoho People-inspired layout — vertical icon column + topbar tabs
f42cc9d feat(brand): dual-variant logo for legible wordmark on dark surfaces
83c3551 feat(brand): increase logo prominence across the application
```

Always run `git log --oneline -10` at the start of a new session to see what shipped recently.
