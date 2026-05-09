# 🐟 مزرعة الإنتاج الوطني - Quick Start Guide

## System Access

### Frontend (User Interface)
**URL**: http://localhost:3000
**Login**: 
- Username: `engineer1`
- Password: `password123`

### Backend API
**URL**: http://localhost:8000
**API Documentation**: http://localhost:8000/docs

---

## What's New? ✨

### 1. Real Farm Data Imported
✅ **48 ponds** from your production report
✅ **10 Nursery ponds** (NUR-A-01 to NUR-B-05)
✅ **14 Pregrow ponds** (PGRW-A-01 to PGRW-B-07)
✅ **24 Grow out ponds** (GRW-A-01 to GRW-B-12)
✅ **Water quality data** (9 records)
✅ **Feeding data** (8,126.91 kg total)
✅ **Mortality data** (4 records)

### 2. Farm Name Updated
✅ **Arabic**: مزرعة الإنتاج الوطني
✅ **English**: National Production Farm
✅ **Visible in**: Sidebar, page titles, API

---

## How to Use the System

### 📊 Dashboard
**URL**: http://localhost:3000/dashboard

View overview of:
- Total biomass across all units
- Active batches
- Water quality status
- Feed consumption
- Harvest-ready ponds

### 🐟 Nursery Unit (وحدة التحضين)
**URL**: http://localhost:3000/hatchery

- View 10 nursery ponds
- Stage: Fingerlings (إصبعيات)
- Weight range: 0.5g - 40g
- Monitor fry and fingerlings

### 🐠 Pregrow Unit (وحدة التربية)
**URL**: http://localhost:3000/growout

- View 14 pregrow ponds
- Stage: Juveniles (تربية)
- Weight range: 40g - 200g
- Track juvenile growth

### 🎣 Grow out Unit (وحدة التسمين)
**URL**: http://localhost:3000/fattening

- View 24 grow out ponds
- Stage: Fattening (تسمين)
- Weight range: 200g+
- Prepare for harvest (350-600g)

### 📦 Harvest Management
**URL**: http://localhost:3000/harvest

- View batches ready for harvest
- Record harvest operations
- Track harvest metrics (FCR, survival rate)
- Calculate revenue

### 🔄 Batch Management
**URL**: http://localhost:3000/batches

- View all batches across units
- Filter by stage, status, pond
- Track batch lifecycle
- Monitor performance metrics

### 📈 Analytics
**URL**: http://localhost:3000/analytics

**3 Analysis Tools**:
1. **Daily Feed Calculation** - Calculate optimal feeding amounts
2. **Water Quality Impact** - Analyze correlation with growth
3. **Batch Comparison** - Compare performance across batches

---

## Daily Operations

### 1. Record Water Quality
1. Go to pond details
2. Click "Add Water Quality Reading"
3. Enter: DO, pH, Temperature, TAN, Alkalinity, Floc
4. Save

### 2. Record Feeding
1. Go to pond details
2. Click "Record Feeding"
3. Enter: Amount, Feed type, Time
4. Save

### 3. Record Sampling (Weight Measurement)
1. Go to pond details
2. Click "Record Sampling"
3. Enter: Sample count, Total weight
4. System calculates average weight
5. Save

### 4. Transfer Fish Between Ponds
1. Go to source pond
2. Click "Transfer"
3. Select target pond
4. Enter fish count
5. Confirm transfer

### 5. Record Harvest
1. Go to Harvest page
2. Find ready batch (350-600g)
3. Click "Record Harvest"
4. Enter: Count, Price, Buyer
5. Confirm harvest

---

## Lifecycle Stages

### Stage 1: Fry (زريعة)
- **Weight**: 0 - 0.5g
- **Location**: Nursery
- **Duration**: ~30 days
- **Feed**: Starter (0.5mm)

### Stage 2: Fingerlings (إصبعيات)
- **Weight**: 0.5g - 40g
- **Location**: Nursery
- **Duration**: ~60 days
- **Feed**: Starter/Grower (1-2mm)
- **Transfer**: At 40g → Move to Pregrow

### Stage 3: Juveniles (تربية)
- **Weight**: 40g - 200g
- **Location**: Pregrow
- **Duration**: ~90 days
- **Feed**: Grower (3-4mm)
- **Transfer**: At 200g → Move to Grow out

### Stage 4: Fattening (تسمين)
- **Weight**: 200g - 600g
- **Location**: Grow out
- **Duration**: ~120 days
- **Feed**: Finisher/Fattening (5-6mm)
- **Harvest**: At 350-600g (optimal: 400-600g)

---

## Key Performance Indicators (KPIs)

### FCR (Feed Conversion Ratio)
**Formula**: Total Feed (kg) / Weight Gain (kg)

**Targets**:
- ✅ Excellent: < 1.2
- ✅ Good: 1.2 - 1.5
- ⚠️ Acceptable: 1.5 - 1.8
- ❌ Poor: > 1.8

### SGR (Specific Growth Rate)
**Formula**: ((ln(Final Weight) - ln(Initial Weight)) / Days) × 100

**Target**: > 2% per day

### Survival Rate
**Formula**: (Current Count / Initial Count) × 100

**Target**: > 85%

### Mortality Rate
**Formula**: (Dead Fish / Initial Count) × 100

**Target**: < 15%

---

## Water Quality Optimal Ranges

### Dissolved Oxygen (DO)
- **Optimal**: 5-8 mg/L
- **Warning**: 4-5 mg/L or 8-10 mg/L
- **Critical**: < 4 mg/L or > 10 mg/L

### pH
- **Optimal**: 7.0-8.5
- **Warning**: 6.5-7.0 or 8.5-9.0
- **Critical**: < 6.5 or > 9.0

### Temperature
- **Optimal**: 26-30°C
- **Warning**: 24-26°C or 30-32°C
- **Critical**: < 24°C or > 32°C

### TAN (Total Ammonia Nitrogen)
- **Optimal**: < 1 mg/L
- **Warning**: 1-2 mg/L
- **Critical**: > 2 mg/L

### Alkalinity
- **Optimal**: 100-200 mg/L
- **Warning**: 80-100 mg/L or 200-250 mg/L
- **Critical**: < 80 mg/L or > 250 mg/L

---

## Feeding Guidelines

### Feeding Rates (% of Biomass per Day)

| Stage | Weight Range | Feeding Rate | Meals/Day |
|-------|-------------|--------------|-----------|
| Fry | 0-0.5g | 10-15% | 6-8 |
| Fingerlings | 0.5-40g | 5-8% | 4-6 |
| Juveniles | 40-200g | 3-5% | 3-4 |
| Fattening | 200g+ | 2-3% | 2-3 |

### Feed Types

| Stage | Feed Size | Protein % |
|-------|-----------|-----------|
| Fry | 0.5mm | 45-50% |
| Fingerlings | 1-2mm | 40-45% |
| Juveniles | 3-4mm | 35-40% |
| Fattening | 5-6mm | 30-35% |

---

## Troubleshooting

### Problem: Cannot see ponds
**Solution**: 
1. Check you're logged in
2. Refresh the page (F5)
3. Check backend is running: http://localhost:8000/docs

### Problem: Data not updating
**Solution**:
1. Click refresh button
2. Clear browser cache (Ctrl+Shift+Delete)
3. Restart backend: `cd backend && python run.py`

### Problem: Login not working
**Solution**:
- Username: `engineer1`
- Password: `password123`
- Check backend is running

### Problem: Backend not responding
**Solution**:
```bash
cd backend
python run.py
```

### Problem: Frontend not loading
**Solution**:
```bash
npm run dev
```

---

## Data Files Location

**Excel Files**: `C:\Users\ENG\Downloads\TTT\DATA`

Files imported:
1. `تقرير قطاع الانتاج الاسماك 1 إبريل 2026 - Copy.xlsx`
2. `المتابعة الدورية لجودة المياه للدورة 001 شركةلانا ( نظام البيوفلوك )-2.xlsx`
3. `اجمالى التغذية للدورة 001 شركة لانا ( نظام البيوفلوك )-2.xlsx`
4. `معدلات النافق 001 شركة لانا ( نظام البيوفلوك )-2.xlsx`

**Database**: `backend/tibyan.db`

---

## Support & Documentation

### Documentation Files
- `FARM_DATA_IMPORTED.md` - Import details
- `FISH_LIFECYCLE_LOGIC.md` - Lifecycle stages
- `HARVEST_SYSTEM_READY.md` - Harvest system
- `ADVANCED_FEATURES_COMPLETE.md` - Advanced features
- `DATA_ENTRY_GUIDE.md` - Data entry guide

### API Documentation
**URL**: http://localhost:8000/docs

Explore all API endpoints:
- Ponds
- Batches
- Water Quality
- Feeding
- Mortality
- Sampling
- Transfers
- Harvest
- Analytics

---

## Next Steps

### Immediate Actions
1. ✅ Login to system
2. ✅ View Dashboard
3. ✅ Check Nursery, Pregrow, Grow out units
4. ✅ Verify pond data matches your records

### Daily Tasks
1. 🔄 Record water quality (morning & evening)
2. 🔄 Record feeding (per schedule)
3. 🔄 Monitor fish behavior
4. 🔄 Check alerts and notifications

### Weekly Tasks
1. 📊 Record weight sampling
2. 📊 Review FCR and SGR
3. 📊 Analyze water quality trends
4. 📊 Plan transfers if needed

### Monthly Tasks
1. 📈 Generate performance reports
2. 📈 Compare batch performance
3. 📈 Review inventory levels
4. 📈 Plan harvest schedule

---

**System Status**: ✅ Ready to Use
**Farm Name**: مزرعة الإنتاج الوطني
**Date**: May 9, 2026
**Version**: 1.0

---

**Need Help?**
- Check API docs: http://localhost:8000/docs
- Review documentation files in project root
- Contact system administrator
