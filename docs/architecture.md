# Architecture

A short, current map of the codebase. Pair this with [`api.md`](api.md) for the API surface and with [`specs/`](specs/) for intended behavior.

## High-level

```
┌──────────────────────┐    REST/JSON     ┌──────────────────────┐
│  React + Vite SPA    │ ───────────────▶ │  FastAPI service      │
│  frontend/           │   JWT bearer     │  backend/             │
│  :3000               │                  │  :8000                │
└──────────────────────┘                  └────────┬─────────────┘
                                                   │ SQLAlchemy
                                                   ▼
                                          ┌──────────────────┐
                                          │ SQLite (tibyan.db)│
                                          └──────────────────┘
```

The frontend stores the JWT in `localStorage`; an axios interceptor (`frontend/src/services/api.js`) injects `Authorization: Bearer <token>` into every request and clears the token on a 401. CORS in `backend/app/main.py` is currently `allow_origins=["*"]` for development — tighten before deploy.

## Backend

### Wiring
- Entry: `backend/run.py` → uvicorn → `backend/app/main.py`.
- Tables auto-created at startup via `Base.metadata.create_all()` (Alembic is in `requirements.txt` but not yet wired; expect to switch over before any production deploy).
- Settings: `backend/app/core/config.py` (Pydantic `BaseSettings`, env-driven, no hardcoded `SECRET_KEY`).

### Auth & security
- `backend/app/core/security.py` — bcrypt hashing (with explicit 72-byte truncation) + JWT (HS256, 30 min).
- `backend/app/api/deps.py` — `get_current_user` / `get_current_active_user` dependencies.
- `backend/app/api/routes/auth.py` — register, login (OAuth2 form + JSON variants).
- A `role` field exists on `User` but is **not enforced** anywhere yet — RBAC is a TODO.

### Domain models (`backend/app/models/`)

| Model | Role | Notes |
|---|---|---|
| `User` | Auth principal | role enum: owner / manager / engineer / sales / purchasing |
| `Pond` | Production unit | `unit_type` ∈ hatchery / growout / fattening |
| `Batch` | Cohort of fish (lifecycle entity) | `stage` ∈ fry / nursery / juveniles / fattening / harvest; carries derived KPIs |
| `BatchHistory` | Audit trail | `action_type` ∈ created / transfer / sampling / mortality / feeding / water_quality / harvest |
| `WaterQuality` | Daily readings | DO, pH, temperature, TAN, alkalinity, floc, ammonia |
| `Feeding` | Per-feeding record | feed amount/type, time, duration, consumption |
| `Mortality` | Death log | count, rate, cause |
| `Sampling` | Periodic weight sampling | computes SGR; updates `previous_avg_weight` |
| `Transfer` | Inter-pond movement | from/to pond, count, stage at transfer |
| `Harvest` | Terminal event | grade A/B/C counts, final FCR, revenue |
| `Alert` | Auto-generated notifications | type + severity (info/warning/critical) |

### Service layer (centralized domain logic)

- `LifecycleManager` — stage thresholds + automatic transitions on weight crossings; embeds `STAGE_INFO` (duration, feed type, meals/day, feeding rate %).
- Calculators — Biomass (count × avg_weight), FCR (feed / weight gained), SGR (`(ln W2 − ln W1) / days × 100`), WeightPredictor (`W × e^(SGR × days / 100)`), HarvestPredictor.
- `HarvestManager` — readiness scoring (fattening + 350–600 g window).
- `HistoryTracker` — appends a `BatchHistory` row on every significant mutation.

### Routes (`backend/app/api/routes/`)

11 routers under `/api/*`: `auth`, `ponds`, `operations`, `batches`, `samplings`, `transfers`, `predictions`, `alerts`, `harvests`, `feeding`, `analytics`. Highlights:

- `batches.py` → `GET /{id}/metrics` is the dashboard payload (FCR, SGR, mortality, survival, feeding schedule, harvest predictions, active alerts).
- `samplings.py` recomputes SGR, may auto-transition stage, may emit alerts.
- `transfers.py` exposes `POST /validate` before `POST /` for pre-flight checks.
- `harvests.py` does grading, revenue capture, readiness summaries.
- `predictions.py` runs the exponential growth model with confidence based on data freshness.

### Schemas

`backend/app/schemas/` — Pydantic v2. `BatchDetailResponse` nests history/samplings/transfers/alerts; `BatchMetricsResponse` is the canonical dashboard payload.

### Scripts (`backend/scripts/`)

| Script | Purpose |
|---|---|
| `import_farm_data.py` | ETL from `data/` Excel files (48 ponds + readings + feed + mortality) |
| `create_sample_data.py` | Seed minimal demo fixtures |
| `verify_data.py` | Audit pond / batch / WQ / feeding / mortality counts |
| `update_stages.py` | One-off stage migration |
| `remove_batches.py` | One-off batch cleanup |
| `check_excel_columns.py` | Arabic-aware Excel header probing |
| `test_integration.py` | Calculator & lifecycle unit tests |

Run all scripts from the `backend/` directory so package imports (`from app...`) resolve.

## Frontend

### Routing & guards (`frontend/src/`)

- `main.jsx` mounts the root; `App.jsx` defines routes and wraps everything except `/login` in `ProtectedRoute` (gates on `localStorage.getItem('token')`).
- 12 pages: Dashboard, HatcheryUnit, GrowoutUnit, FatteningUnit, PondDetails, Harvest, BatchManagement, Analytics, Inventory, Reports, Settings, Login.
- RTL/LTR set on `document.documentElement.dir` based on i18n language at boot.

### Layout & shell

- `components/Layout/Sidebar.jsx` — 10 NavLinks with lucide icons, RTL-aware active styling.
- `components/Layout/Header.jsx` — language toggle, refresh button, user dropdown, AlertBell.
- `components/Layout/AlertBell.jsx` — polls `/alerts/unread` every 30 s.

### Data layer

- `frontend/src/services/api.js` — single axios instance with hardcoded base URL `http://localhost:8000/api` (TODO: switch to `import.meta.env.VITE_API_BASE_URL`).
- Request interceptor: injects bearer token. Response interceptor: on 401, clears localStorage + redirects to `/login`.
- API modules: `authAPI`, `pondsAPI`, `waterQualityAPI`, `feedingAPI`, `mortalityAPI`, `additivesAPI`, `batchesAPI`, `samplingsAPI`, `transfersAPI`, `predictionsAPI`, `alertsAPI`, `feedingCalculationsAPI`, `harvestsAPI`, `analyticsAPI`.
- `zustand` is a declared dependency but no store is implemented — all state is component-local `useState`.

### Forms (`frontend/src/components/Forms/`)

WaterQualityForm, FeedingForm, MortalityForm, SamplingForm, TransferForm, AdditivesForm, BatchForm — modal-based, real-time threshold visualization for water quality, recommended-value hints (e.g. feed = 3 % biomass).

### Charts

`recharts` is used only on `pages/Reports.jsx` (one BarChart for batch performance, one PieChart for stage distribution). The Dashboard intentionally uses summary cards instead of time-series.

### i18n & theme

- `src/i18n/config.js` + `src/i18n/locales/{ar,en}.json`, ~394 keys per locale, identical structure.
- Language preference is **not persisted** across reloads.
- Tailwind theme uses Ant-Design-flavored tokens; Cairo font from Google Fonts; custom utilities in `src/index.css` (`.card`, `.btn-*`, `.badge-*`, `.input`, animations, RTL helpers).

## Drift to watch

- Dashboard and PondDetails still render mock data in places; backend endpoints exist but are not yet wired.
- Five spec requirements are unstarted: daily feed UI (Req 13), batch reports (15), feed-type recommendations (17), water-quality → growth correlation (18), batch comparison analytics (19).
- `User.role` is decorative — RBAC is not enforced anywhere.
- `frontend/tibyan.db` and a duplicate at the project root (now removed) demonstrated the asymmetry between frontend and backend that this restructure was meant to fix.

See [`status/roadmap.md`](status/roadmap.md) for the punch list.
