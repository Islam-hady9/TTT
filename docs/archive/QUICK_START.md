# ⚡ Quick Start Guide - Tibyan Aquaculture System

## 🚀 System is Ready!

Both servers are running:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🎯 First Time Setup (5 minutes)

### Step 1: Create Your First User

**Open**: http://localhost:8000/docs

1. Find **POST /api/auth/register**
2. Click **"Try it out"**
3. Paste this JSON:

```json
{
  "email": "engineer@tibyan.com",
  "username": "engineer1",
  "full_name": "أحمد محمد",
  "password": "password123",
  "role": "engineer"
}
```

4. Click **"Execute"**
5. ✅ User created!

### Step 2: Login to the App

**Open**: http://localhost:3000

1. You'll see the login page
2. Enter:
   - **Username**: `engineer1`
   - **Password**: `password123`
3. Click **"تسجيل الدخول"**
4. ✅ You're in!

### Step 3: Create Your First Pond

**In Swagger UI** (http://localhost:8000/docs):

1. Click **"Authorize"** button (top right)
2. Login with username/password
3. Find **POST /api/ponds**
4. Click **"Try it out"**
5. Paste:

```json
{
  "pond_code": "H001",
  "unit_type": "hatchery",
  "capacity": 50.0
}
```

6. Click **"Execute"**
7. ✅ Pond created!

### Step 4: Record Water Quality

**In the App** (http://localhost:3000):

1. Go to **Dashboard**
2. Click on **"حوض H001"**
3. Click **"قياس جودة المياه"** button
4. Fill the form:
   - DO: `7.2`
   - pH: `7.8`
   - Temperature: `28`
   - Measured By: `أحمد محمد`
5. Click **"حفظ القياسات"**
6. ✅ Data saved!

---

## 📊 Verify Your Data

### Option 1: API Docs
1. Go to http://localhost:8000/docs
2. Find **GET /api/operations/water-quality/pond/{pond_id}**
3. Enter pond_id: `1`
4. Click **"Execute"**
5. See your data!

### Option 2: Database
```bash
cd backend
sqlite3 tibyan.db
SELECT * FROM water_quality;
.exit
```

---

## 🎯 What You Can Do Now

### ✅ Data Entry
- Record water quality (7 parameters)
- Record feeding operations
- Record mortality events
- Add additives (molasses, probiotics, etc.)

### ✅ View Data
- API documentation (Swagger UI)
- Database queries (SQLite)
- Frontend forms (with validation)

### ✅ Authentication
- Login/Logout
- JWT tokens
- Protected routes

---

## 🔧 Useful Commands

### Start Frontend (if stopped)
```bash
npm run dev
```

### Start Backend (if stopped)
```bash
cd backend
python run.py
```

### Check Database
```bash
cd backend
sqlite3 tibyan.db
.tables
SELECT * FROM users;
.exit
```

### Create More Users
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@tibyan.com",
    "username": "manager1",
    "full_name": "محمد أحمد",
    "password": "password123",
    "role": "manager"
  }'
```

---

## 📱 Available Roles

When creating users, you can use these roles:
- `owner` - مالك المزرعة
- `manager` - مدير المزرعة
- `engineer` - مهندس
- `sales` - مسؤول المبيعات
- `purchasing` - مسؤول المشتريات

---

## 🐛 Troubleshooting

### "Network Error" in forms
**Solution**: Make sure backend is running
```bash
cd backend
python run.py
```

### "401 Unauthorized"
**Solution**: Login again (token expired)
- Go to http://localhost:3000/login

### Can't see my pond
**Solution**: Create pond via API first
- Use Swagger UI: http://localhost:8000/docs
- POST /api/ponds

### Backend won't start
**Solution**: Check if port 8000 is free
```bash
# Windows
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID <PID> /F
```

---

## 📚 Full Documentation

- **Integration Guide**: [INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md)
- **Backend API**: [BACKEND_GUIDE.md](./BACKEND_GUIDE.md)
- **Forms Guide**: [DATA_ENTRY_GUIDE.md](./DATA_ENTRY_GUIDE.md)
- **Current Status**: [CURRENT_STATUS.md](./CURRENT_STATUS.md)

---

## 🎉 You're All Set!

The system is fully operational and ready to use.

**Happy Fish Farming! 🐟🇸🇦**
