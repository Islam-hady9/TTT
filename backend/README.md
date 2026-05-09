# Tibyan Aquaculture Backend API

FastAPI backend with SQLite database and JWT authentication.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and set your SECRET_KEY
```

### 3. Run the Server

```bash
python run.py
```

Or using uvicorn directly:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Access API Documentation

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── ponds.py         # Pond & batch management
│   │   │   └── operations.py    # Water quality, feeding, mortality
│   │   └── deps.py              # Dependencies (auth)
│   ├── core/
│   │   ├── config.py            # Configuration
│   │   └── security.py          # JWT & password hashing
│   ├── db/
│   │   └── database.py          # Database connection
│   ├── models/
│   │   ├── user.py              # User model
│   │   ├── pond.py              # Pond & Batch models
│   │   ├── water_quality.py     # Water quality model
│   │   ├── feeding.py           # Feeding model
│   │   └── mortality.py         # Mortality & Additive models
│   ├── schemas/
│   │   ├── user.py              # User schemas
│   │   ├── pond.py              # Pond schemas
│   │   └── operations.py        # Operations schemas
│   └── main.py                  # FastAPI app
├── .env                         # Environment variables
├── requirements.txt             # Python dependencies
└── run.py                       # Run script
```

---

## 🔐 Authentication

### Register a New User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "engineer@tibyan.com",
  "username": "engineer1",
  "full_name": "أحمد محمد",
  "password": "password123",
  "role": "engineer"
}
```

### Login

```bash
POST /api/auth/login/json
Content-Type: application/json

{
  "username": "engineer1",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Use Token

Add to headers:
```
Authorization: Bearer <access_token>
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (OAuth2 form)
- `POST /api/auth/login/json` - Login (JSON body)

### Ponds
- `GET /api/ponds` - Get all ponds
- `POST /api/ponds` - Create pond
- `GET /api/ponds/{pond_id}` - Get pond by ID
- `GET /api/ponds/{pond_id}/batches` - Get pond batches
- `POST /api/ponds/batches` - Create batch

### Operations
- `POST /api/operations/water-quality` - Record water quality
- `GET /api/operations/water-quality/pond/{pond_id}` - Get water quality records
- `POST /api/operations/feeding` - Record feeding
- `GET /api/operations/feeding/pond/{pond_id}` - Get feeding records
- `POST /api/operations/mortality` - Record mortality
- `GET /api/operations/mortality/pond/{pond_id}` - Get mortality records
- `POST /api/operations/additives` - Record additives
- `GET /api/operations/additives/pond/{pond_id}` - Get additive records

---

## 🗄️ Database Models

### User
- id, email, username, full_name, hashed_password
- role (owner, manager, engineer, sales, purchasing)
- is_active, created_at, updated_at

### Pond
- id, pond_code, unit_type, capacity, status
- created_at

### Batch
- id, batch_code, pond_id, stocking_date
- initial_count, current_count, avg_weight
- stage, source, supplier, status
- created_by, created_at

### WaterQuality
- id, pond_id, do, ph, temperature
- tan, alkalinity, floc, ammonia
- measured_by, notes, measured_at

### Feeding
- id, pond_id, feed_amount, feed_type
- feeding_time, duration, consumption
- fed_by, notes, fed_at

### Mortality
- id, pond_id, mortality_count, mortality_rate
- cause, other_cause
- recorded_by, notes, recorded_at

### Additive
- id, pond_id, type, amount, reason
- added_by, notes, added_at

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# Database
DATABASE_URL=sqlite:///./tibyan.db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# App
APP_NAME=Tibyan Aquaculture API
DEBUG=True
```

---

## 🧪 Testing with cURL

### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@tibyan.com",
    "username": "testuser",
    "full_name": "Test User",
    "password": "test123",
    "role": "engineer"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/json \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123"
  }'
```

### Create Pond (with auth)
```bash
curl -X POST http://localhost:8000/api/ponds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "pond_code": "H001",
    "unit_type": "hatchery",
    "capacity": 50.0
  }'
```

### Record Water Quality
```bash
curl -X POST http://localhost:8000/api/operations/water-quality \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "pond_id": 1,
    "do": 7.2,
    "ph": 7.8,
    "temperature": 28.0,
    "tan": 0.3,
    "alkalinity": 135.0,
    "floc": 32.0,
    "measured_by": "أحمد محمد"
  }'
```

---

## 🔒 Security Features

- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Token expiration (30 minutes default)
- ✅ Protected endpoints
- ✅ CORS configuration
- ✅ Role-based access (ready for implementation)

---

## 📈 Next Steps

1. ✅ Add role-based permissions
2. ✅ Add data validation rules
3. ✅ Add pagination for list endpoints
4. ✅ Add filtering and sorting
5. ✅ Add aggregation endpoints (statistics)
6. ✅ Add file upload (for reports)
7. ✅ Add WebSocket for real-time updates

---

## 🐛 Troubleshooting

### Database locked error
SQLite doesn't handle concurrent writes well. For production, use PostgreSQL.

### CORS errors
Check CORS_ORIGINS in .env matches your frontend URL.

### Token expired
Tokens expire after 30 minutes. Login again to get a new token.

---

## 📝 License

Proprietary - Tibyan Aquaculture © 2026
