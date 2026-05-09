# API Reference

The backend exposes a REST/JSON API at `http://localhost:8000/api`. FastAPI generates interactive documentation automatically — for live, request-shape-accurate reference, prefer Swagger over this file.

- **Swagger UI** — http://localhost:8000/docs
- **ReDoc** — http://localhost:8000/redoc
- **OpenAPI JSON** — http://localhost:8000/openapi.json

## Authentication

All endpoints except `/api/auth/register` and `/api/auth/login*` require a JWT bearer token.

```
Authorization: Bearer <access_token>
```

Tokens are HS256, 30-minute expiry by default (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES` in `.env`).

### `POST /api/auth/register`
Body: `{ email, username, full_name, password, role }`

### `POST /api/auth/login`
OAuth2 form-encoded `{ username, password }`. Returns `{ access_token, token_type }`.

### `POST /api/auth/login/json`
JSON body `{ username, password }` — equivalent to the form variant; provided for the React client.

## Routers

| Prefix | Router file | Concern |
|---|---|---|
| `/api/auth` | `routes/auth.py` | Registration & login |
| `/api/ponds` | `routes/ponds.py` | Pond CRUD + basic batch creation |
| `/api/operations` | `routes/operations.py` | Daily ops: water quality, feeding, mortality, additives |
| `/api/batches` | `routes/batches.py` | Batch lifecycle + history + per-batch metrics |
| `/api/samplings` | `routes/samplings.py` | Periodic weight sampling (computes SGR) |
| `/api/transfers` | `routes/transfers.py` | Inter-pond transfer (with pre-flight `/validate`) |
| `/api/predictions` | `routes/predictions.py` | Weight & harvest-date predictions |
| `/api/alerts` | `routes/alerts.py` | Alert listing, unread counts, mark-read, resolve |
| `/api/harvests` | `routes/harvests.py` | Harvest creation, ready-to-harvest, summaries |
| `/api/feeding` | `routes/feeding.py` | Daily feed-amount calculation per stage |
| `/api/analytics` | `routes/analytics.py` | Water-quality summary & SGR/FCR correlation |

## Highlights

- **`GET /api/batches/{id}/metrics`** — the dashboard payload. Aggregates FCR, SGR, mortality, survival, feeding schedule, harvest predictions, and active alerts in a single response.
- **`POST /api/transfers/validate`** — checks count ≤ current_count, distinct ponds, batch active. Call before `POST /api/transfers`.
- **`GET /api/harvests/ready`** — batches in fattening with avg weight in the harvest window (350–600 g).
- **`POST /api/predictions/batch/{id}`** — runs the SGR-based exponential growth model (`W × e^(SGR × days / 100)`).
- **`GET /api/alerts/unread`** — polled by the frontend `AlertBell` every 30 seconds.

## Conventions

- All timestamps are timezone-aware UTC.
- Weights are grams; biomass is kg.
- Validation errors return HTTP 422 with Pydantic's standard error envelope.
- Domain validation errors (e.g. transfer count > current count) return HTTP 400 with `{ detail: "..." }`.
- 401 responses are intercepted by the frontend axios layer and cause a redirect to `/login`.

## Quick cURL

Login:

```bash
curl -X POST http://localhost:8000/api/auth/login/json \
  -H "Content-Type: application/json" \
  -d '{"username":"engineer1","password":"password123"}'
```

Active batches:

```bash
curl http://localhost:8000/api/batches/active \
  -H "Authorization: Bearer $TOKEN"
```

Record a water-quality reading:

```bash
curl -X POST http://localhost:8000/api/operations/water-quality \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pond_id":1,"do":7.2,"ph":7.8,"temperature":28.0,"tan":0.3,"alkalinity":135.0,"floc":32.0,"measured_by":"engineer1"}'
```

For the full request/response schemas including all optional fields, **use Swagger** — it stays in sync with the code automatically; this file does not.
