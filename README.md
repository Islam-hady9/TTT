# Tibyan — Aquaculture Farm Management

Bilingual (Arabic / English) farm management system for tilapia aquaculture under RAS and Biofloc operating models. React + Vite frontend, FastAPI + SQLite backend, designed for use across hatchery, grow-out, and fattening units.

> **Status:** ~75 % complete against the Kiro `fish-lifecycle-management` spec. Backend, domain logic, and APIs are functionally complete; the frontend still consumes mock data on parts of the dashboard. See [`docs/status/reality-check.md`](docs/status/reality-check.md) and [`docs/status/roadmap.md`](docs/status/roadmap.md) for details.

---

## Features

- **Bilingual UI** — Arabic (default, RTL) and English (LTR), Cairo font, language toggle in the header.
- **Three production units** — Hatchery, Grow-out, Fattening, with per-pond drill-down.
- **Batch lifecycle (6 stages)** — fry → nursery → juveniles → fattening → harvest, with automatic stage transitions based on weight thresholds.
- **KPI tracking** — FCR (Feed Conversion Ratio), SGR (Specific Growth Rate), biomass, mortality, survival rate, total feed consumed.
- **Water-quality monitoring** — DO, pH, temperature, TAN, alkalinity, floc, ammonia.
- **Operational logs** — feedings, sampling, mortality events, additives, inter-pond transfers, harvests.
- **Predictions** — weight prediction (`W × e^(SGR × days / 100)`) and harvest-date prediction.
- **Alerts** — auto-generated for FCR high, SGR low, mortality high, transfer-ready, harvest-ready, water-quality out of range.
- **Harvest grading** — A (≥ 400 g), B (350–400 g), C (< 350 g), with revenue capture.

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS, i18next, axios, react-router v6, recharts, lucide-react |
| Backend | FastAPI ≥ 0.115, SQLAlchemy 2, Pydantic v2, python-jose (JWT), passlib (bcrypt), uvicorn |
| Database | SQLite (auto-created at startup; Alembic available but not yet used) |
| i18n | Arabic + English, ~394 keys per locale |

## Project structure

```
TTT/
├── README.md                  ← you are here
├── .gitignore                 ← root, cross-cutting rules
├── backend/                   ← FastAPI service (see backend/README.md)
│   ├── .gitignore             ← Python-specific
│   ├── app/                   ← API routes, models, services
│   ├── scripts/               ← data import + maintenance utilities
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py
├── frontend/                  ← React + Vite app
│   ├── .gitignore             ← Node/Vite-specific
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── data/                      ← real production Excel files (gitignored)
├── docs/
│   ├── README.md              ← docs index
│   ├── architecture.md
│   ├── api.md
│   ├── data-entry-guide.md
│   ├── specs/                 ← canonical product & feature specs
│   ├── status/                ← curated current-state docs
│   └── archive/               ← historical progress notes (read at your own risk)
├── scripts/                   ← repo-level utilities
└── .kiro/                     ← Kiro IDE artifacts (specs mirrored to docs/specs/)
```

## Prerequisites

- **Node.js 18+** and npm
- **Python 3.11+** and pip
- A local SQLite-capable filesystem (any modern OS)

## Quick start

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env          # then edit SECRET_KEY
python run.py
```

API: `http://localhost:8000`
Swagger UI: `http://localhost:8000/docs`
ReDoc: `http://localhost:8000/redoc`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:3000`

### 3. Log in

Use the demo credentials seeded with the sample data: **`engineer1` / `password123`**.
To create a new user instead, use the `POST /api/auth/register` endpoint (see Swagger).

## How it works

The frontend talks to the backend exclusively over REST at `http://localhost:8000/api`. Authentication is JWT bearer (HS256, 30-minute expiry); the React app stores the token in `localStorage` and an axios interceptor injects it into every request and clears it on a 401. CORS in `backend/app/main.py` is currently wide open for development — tighten before any deploy.

The backend is organized around a single domain: a **batch** (a cohort of fish) sits in a **pond**, accumulates **feeding / mortality / water-quality / sampling / transfer** events, and ends with a **harvest**. Every mutation is appended to **`BatchHistory`** so the full audit trail is queryable. Domain logic lives in service classes — `LifecycleManager` drives stage transitions on weight thresholds; calculators (Biomass, FCR, SGR, weight & harvest predictors) compute KPIs from logged events; `HarvestManager` scores harvest readiness; an alert engine emits typed alerts (FCR high, SGR low, mortality high, transfer-ready, harvest-ready, water-quality) consumed by the frontend's `AlertBell`.

The frontend is a Vite SPA with 12 pages (Dashboard, three unit pages, PondDetails, BatchManagement, Harvest, Analytics, Inventory, Reports, Settings, Login). Modal forms (`src/components/Forms/*`) capture data entry for water quality, feeding, mortality, sampling, transfers, additives, and batches, each posting to the corresponding backend endpoint.

## Importing real farm data

The `backend/scripts/import_farm_data.py` script reads production Excel files from `data/` (pond report, water-quality readings, feeding totals, mortality records) and seeds the database. Run from the `backend/` directory so package imports resolve:

```bash
cd backend
python scripts/import_farm_data.py
python scripts/verify_data.py     # sanity check
```

The `data/` folder is gitignored — keep production data local.

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — what's where in the codebase.
- [`docs/api.md`](docs/api.md) — API reference and Swagger pointers.
- [`docs/data-entry-guide.md`](docs/data-entry-guide.md) — operator-facing usage.
- [`docs/specs/`](docs/specs/) — product and feature specifications.
- [`docs/status/`](docs/status/) — current state and roadmap.
- [`docs/archive/`](docs/archive/) — historical progress notes (often contradictory).

## Bilingual / RTL

Arabic is the default language. The header toggle switches to English; `document.dir` updates accordingly so Tailwind RTL utilities flip layout direction. The Cairo font is loaded from Google Fonts in `frontend/index.html`.

> Known gap: language preference is not persisted across reloads — see [`docs/status/roadmap.md`](docs/status/roadmap.md).

## Known gaps

- Five spec requirements are not yet implemented: daily feed UI, batch reports (PDF/Excel), feed-type recommendations, water-quality → growth correlation, batch comparison analytics.
- Frontend Dashboard and PondDetails still display mock data in places; backend endpoints exist but are not yet wired.
- `User.role` exists but is **not enforced** — every authenticated user has full access.
- Frontend API base URL is hardcoded to `http://localhost:8000/api` in `frontend/src/services/api.js`.
- No git history yet — every file is currently untracked.

The full punch list lives in [`docs/status/roadmap.md`](docs/status/roadmap.md).

## License

Proprietary — Tibyan Aquaculture © 2026.
