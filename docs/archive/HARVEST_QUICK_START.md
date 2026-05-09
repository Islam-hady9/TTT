# 🚀 Quick Start: Harvest System / دليل البدء السريع: نظام الحصاد

---

## ⚡ 3 خطوات فقط / Just 3 Steps!

### الخطوة 1: تشغيل Migration / Step 1: Run Migration

```bash
cd backend
python migrations/migrate_harvest.py
```

**الناتج المتوقع:**
```
✅ Migration completed successfully!
✅ Harvests table exists
✅ Table has 21 columns
✅ Table has 5 indexes
```

---

### الخطوة 2: إعادة تشغيل Backend / Step 2: Restart Backend

```bash
# إيقاف Backend الحالي (Ctrl+C)

# تشغيل من جديد
python run.py
```

**الناتج المتوقع:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

---

### الخطوة 3: تحديث Frontend / Step 3: Refresh Frontend

```
في المتصفح: F5
```

**ثم:**
1. افتح القائمة الجانبية
2. اضغط على "الحصاد" 🎣
3. شاهد الدفعات الجاهزة!

---

## 🧪 اختبار API / Test API

### افتح Swagger Docs:
```
http://localhost:8000/docs
```

### جرب هذه Endpoints:

**1. Get Harvest-Ready Batches:**
```
GET /api/harvests/ready
```

**2. Get Harvest Summary:**
```
GET /api/harvests/summary
```

**3. Create Harvest:**
```
POST /api/harvests
{
  "batch_id": 5,
  "harvest_count": 2400,
  "avg_weight": 380.0,
  "harvested_by": "engineer1",
  "harvest_date": "2026-05-09T10:00:00"
}
```

---

## ✅ التحقق من النجاح / Verify Success

### في Frontend:
- ✅ صفحة الحصاد تظهر
- ✅ البطاقات الإحصائية تعمل
- ✅ الدفعات الجاهزة تظهر
- ✅ درجة الجاهزية محسوبة

### في Backend:
- ✅ جدول harvests موجود
- ✅ 8 endpoints متاحة
- ✅ لا توجد أخطاء

---

## 🐛 حل المشاكل / Troubleshooting

### مشكلة: Migration فشل
**الحل:**
```bash
# تحقق من وجود قاعدة البيانات
ls backend/tibyan.db

# جرب مرة أخرى
python migrations/migrate_harvest.py
```

---

### مشكلة: Backend لا يعمل
**الحل:**
```bash
# تحقق من المنفذ
netstat -ano | findstr :8000

# أوقف العملية القديمة
taskkill /PID <PID> /F

# شغل من جديد
python run.py
```

---

### مشكلة: Frontend لا يجلب البيانات
**الحل:**
1. تحقق من Backend يعمل: `http://localhost:8000/health`
2. تحقق من Token موجود: افتح Console → Application → Local Storage
3. سجل دخول من جديد

---

## 📚 الوثائق الكاملة / Full Documentation

- **Frontend**: `HARVEST_PAGE_ADDED.md`
- **Backend**: `HARVEST_BACKEND_COMPLETE.md`
- **API Docs**: `http://localhost:8000/docs`

---

## 🎉 كل شيء جاهز! / All Set!

الآن يمكنك:
- ✅ عرض الدفعات الجاهزة للحصاد
- ✅ تسجيل عمليات الحصاد
- ✅ مراجعة الإحصائيات
- ✅ تتبع الإيرادات
- ✅ تصنيف الجودة

**استمتع بنظام الحصاد! 🐟✨**

**Enjoy the Harvest System! 🐟✨**
