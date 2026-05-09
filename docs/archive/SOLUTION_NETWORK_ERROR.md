# 🔧 Solution: Network Error on Dashboard

## Problem Diagnosis / تشخيص المشكلة

**Error Message**: "Error loading dashboard - Network Error"

**Root Cause / السبب الجذري**: 
The user is not authenticated. All API endpoints require a valid authentication token, but no token is present or the token has expired.

**Technical Details**:
- Backend API is running ✅ (Port 8000)
- Frontend is running ✅
- CORS is configured correctly ✅
- **Issue**: No valid JWT token in localStorage ❌

---

## ✅ Solution / الحل

### Step 1: Login to the System / تسجيل الدخول

You need to login first before accessing the dashboard.

#### Option A: Use the Login Page (Recommended)

1. **Navigate to Login Page**:
   - If you see the dashboard with error, refresh the page
   - You should be redirected to `/login`
   - Or manually go to: `http://localhost:5173/login`

2. **Enter Credentials**:
   ```
   Username: engineer1
   Password: password123
   ```

3. **Click "تسجيل الدخول" (Login)**

4. **You will be redirected to Dashboard** with real data!

#### Option B: Login via API (For Testing)

If the login page doesn't work, you can get a token manually:

1. **Open Browser Console** (F12)

2. **Run this code**:
```javascript
fetch('http://localhost:8000/api/auth/login/json', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'engineer1',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => {
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  console.log('✅ Logged in successfully!');
  window.location.reload();
});
```

3. **Press Enter** - The page will reload with data!

---

## 🔍 Verification / التحقق

After logging in, you should see:

✅ **Dashboard loads successfully**
✅ **Real data displayed**:
   - Total Biomass (الكتلة الحية الكلية)
   - Average Weight (متوسط الوزن)
   - FCR (معامل التحويل الغذائي)
   - Mortality Rate (معدل النفوق)
   - Active Batches (الدفعات النشطة)
   - Harvest Ready (جاهز للحصاد)

✅ **Units show data**:
   - Hatchery (المفرخ)
   - Growout (التحضين)
   - Fattening (التسمين)

---

## 🚨 If Login Page Doesn't Exist

If you don't have a login page component, here's a quick fix:

### Check if Login Route Exists

1. Open `src/App.jsx`
2. Look for: `<Route path="/login" element={<Login />} />`

If it doesn't exist, the login page needs to be created. Let me know and I'll create it!

---

## 🔐 User Credentials / بيانات الدخول

**Default User**:
- Username: `engineer1`
- Password: `password123`
- Role: Engineer (مهندس)

**Create More Users** (via Swagger):
1. Go to: http://localhost:8000/docs
2. POST /api/auth/register
3. Use this JSON:
```json
{
  "email": "manager@tibyan.com",
  "username": "manager1",
  "full_name": "مدير المزرعة",
  "password": "password123",
  "role": "manager"
}
```

---

## 🔧 Technical Details

### Why This Happens

1. **JWT Token Required**: All API endpoints use `Depends(get_current_user)`
2. **Token Storage**: Token stored in `localStorage.getItem('token')`
3. **Token Expiry**: Tokens expire after 30 minutes
4. **Axios Interceptor**: Automatically adds token to requests

### API Request Flow

```
Frontend Request
    ↓
Axios Interceptor (adds token from localStorage)
    ↓
Backend API (validates token)
    ↓
If valid: Return data ✅
If invalid: Return 401 Unauthorized ❌
    ↓
Frontend: Redirect to /login
```

### Current Issue

```
Frontend Request
    ↓
Axios Interceptor (NO TOKEN in localStorage) ❌
    ↓
Backend API: 401 Unauthorized
    ↓
Frontend: Shows "Network Error"
```

---

## 📝 Next Steps

1. **Login** using credentials above
2. **Dashboard will load** with real data
3. **Start using the system**:
   - View batches
   - Record samplings
   - Execute transfers
   - View alerts
   - Generate predictions

---

## 🆘 Still Having Issues?

If you still see the error after logging in:

1. **Clear Browser Cache**:
   - Press `Ctrl + Shift + Delete`
   - Clear "Cached images and files"
   - Clear "Cookies and site data"

2. **Check Backend is Running**:
   ```bash
   cd backend
   python run.py
   ```
   Should show: `Uvicorn running on http://0.0.0.0:8000`

3. **Check Frontend is Running**:
   ```bash
   npm run dev
   ```
   Should show: `Local: http://localhost:5173/`

4. **Check Browser Console** (F12):
   - Look for red errors
   - Check Network tab for failed requests
   - Share the error message

---

## ✅ Summary / الملخص

**Problem**: Not authenticated  
**Solution**: Login with `engineer1` / `password123`  
**Result**: Dashboard loads with real data! 🎉

**المشكلة**: غير مصادق عليه  
**الحل**: تسجيل الدخول باستخدام `engineer1` / `password123`  
**النتيجة**: لوحة التحكم تعمل مع البيانات الحقيقية! 🎉
