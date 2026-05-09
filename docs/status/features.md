# 🎯 Tibyan Dashboard - Features Overview

## 🖥️ Main Dashboard

### KPI Cards (6 metrics)
```
┌─────────────────┬─────────────────┬─────────────────┐
│ Total Biomass   │ Average Weight  │ FCR             │
│ 12,450 kg       │ 285 g           │ 1.35            │
│ ↑ +8.2%         │ ↑ +12.5%        │ ↑ -0.15         │
└─────────────────┴─────────────────┴─────────────────┘
┌─────────────────┬─────────────────┬─────────────────┐
│ Mortality       │ Feed Consumed   │ Harvest Ready   │
│ 6.2%            │ 3,240 kg        │ 8 ponds         │
│ ↓ -1.3%         │ ↑ +5.8%         │ ↑ +2            │
└─────────────────┴─────────────────┴─────────────────┘
```

### Production Units (3 cards)
```
┌──────────────────────────────────────┐
│ 🌊 Hatchery Unit (RAS)              │
│ 10 ponds • 8 active batches          │
│                                      │
│ Total Fish: 45,000                   │
│ Avg Weight: 12 g                     │
│ Biomass: 540 kg                      │
│ FCR: 1.2 ✓                           │
│ Mortality: 8.5% ✓                    │
│                                      │
│ [View Details →]                     │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ 🐟 Grow-out Unit (Biofloc)          │
│ 15 ponds • 12 active batches         │
│                                      │
│ Total Fish: 28,000                   │
│ Avg Weight: 125 g                    │
│ Biomass: 3,500 kg                    │
│ FCR: 1.35 ✓                          │
│ Mortality: 6.2% ✓                    │
│                                      │
│ [View Details →]                     │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ 📈 Fattening Unit (Biofloc)         │
│ 12 ponds • 10 active batches         │
│                                      │
│ Total Fish: 18,000                   │
│ Avg Weight: 425 g                    │
│ Biomass: 7,650 kg                    │
│ FCR: 1.45 ⚠                          │
│ Mortality: 5.8% ✓                    │
│                                      │
│ [View Details →]                     │
└──────────────────────────────────────┘
```

### Water Quality Monitoring
```
┌──────────────────────────────────────┐
│ 💧 Water Quality                     │
│ Last updated: 15 minutes ago         │
│                                      │
│ ✓ Dissolved Oxygen    7.2 mg/L      │
│   Optimal: 6.0-8.0 mg/L    [OPTIMAL]│
│                                      │
│ ✓ pH Level            7.8            │
│   Optimal: 7.0-8.3         [OPTIMAL]│
│                                      │
│ ✓ Temperature         28°C           │
│   Optimal: 25-30°C         [OPTIMAL]│
│                                      │
│ ✓ TAN                 0.3 mg/L       │
│   Optimal: 0-0.5 mg/L      [OPTIMAL]│
│                                      │
│ ✓ Total Alkalinity    135 mg/L      │
│   Optimal: 120-150 mg/L    [OPTIMAL]│
│                                      │
│ ✓ Floc Level          32             │
│   Optimal: 30-35           [OPTIMAL]│
└──────────────────────────────────────┘
```

### Inventory Management
```
┌──────────────────────────────────────┐
│ 📦 Inventory Management              │
│                                      │
│ Feed                    2,500 kg     │
│ ████████████████░░░░ 250% [IN STOCK]│
│ Min: 1,000 kg                        │
│                                      │
│ ⚠ Medicines              45 kg       │
│ ████████░░░░░░░░░░ 90%  [LOW STOCK] │
│ Min: 50 kg                           │
│                                      │
│ Probiotics              120 kg       │
│ ████████████████░░░░ 150% [IN STOCK]│
│ Min: 80 kg                           │
│                                      │
│ ⚠ Molasses              350 L        │
│ ██████░░░░░░░░░░░░ 70%  [LOW STOCK] │
│ Min: 500 L                           │
│                                      │
│ Disinfectants            85 L        │
│ ████████████░░░░░░ 142% [IN STOCK]  │
│ Min: 60 L                            │
└──────────────────────────────────────┘
```

---

## 🏭 Hatchery Unit Page

### Summary Statistics
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Fish   │ Avg Weight   │ Biomass      │ Mortality    │
│ 45,000       │ 18 g         │ 810 kg       │ 7.2% ✓       │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Pond Grid (10 ponds)
```
┌─────────────────────────────┐ ┌─────────────────────────────┐
│ Pond H001          [READY]  │ │ Pond H002         [ACTIVE]  │
│ Batch: 001-1                │ │ Batch: 001-2                │
│                             │ │                             │
│ Fish Count:    4,500        │ │ Fish Count:    4,500        │
│ Avg Weight:    12 g         │ │ Avg Weight:    14 g         │
│ Biomass:       54.0 kg      │ │ Biomass:       63.0 kg      │
│ Age:           25 days      │ │ Age:           28 days      │
│ FCR:           1.20 ✓       │ │ FCR:           1.25 ✓       │
│ Mortality:     8.5% ✓       │ │ Mortality:     8.2% ✓       │
│                             │ │                             │
│ 🐟 Ready for transfer       │ │                             │
└─────────────────────────────┘ └─────────────────────────────┘

┌─────────────────────────────┐ ┌─────────────────────────────┐
│ Pond H003         [ACTIVE]  │ │ Pond H004         [ACTIVE]  │
│ Batch: 001-3                │ │ Batch: 001-4                │
│ ...                         │ │ ...                         │
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## 🐟 Pond Details Page

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back                                                       │
│                                                              │
│ Pond H001                                                    │
│ Batch: 001-1 • Age: 28 days                                 │
└─────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Fish Count   │ Avg Weight   │ Biomass      │ FCR          │
│ 4,500        │ 18 g         │ 81 kg        │ 1.25 ✓       │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌─────────────────────────────┐ ┌─────────────────────────────┐
│ Batch Information           │ │ Water Quality               │
│                             │ │                             │
│ Batch Code:    001-1        │ │ DO:           7.2 mg/L ✓    │
│ Stocking Date: 2026-04-15   │ │ pH:           7.8 ✓         │
│ Age:           28 days      │ │ Temperature:  28°C ✓        │
│ Mortality:     7.8% ✓       │ │ TAN:          0.3 mg/L ✓    │
│                             │ │ Alkalinity:   135 mg/L ✓    │
│                             │ │ Floc:         32 ✓          │
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## 🎨 Design System

### Colors
- **Primary Blue:** #1890ff (buttons, links, highlights)
- **Success Green:** #52c41a (positive metrics, optimal status)
- **Warning Yellow:** #faad14 (warnings, low stock)
- **Danger Red:** #ff4d4f (critical alerts, high mortality)
- **Gray Scale:** 50-900 (text, backgrounds, borders)

### Typography
- **Font:** Cairo (Arabic), System fonts (English)
- **Sizes:** 
  - Headings: 2xl (24px), xl (20px), lg (18px)
  - Body: base (16px), sm (14px), xs (12px)
  - Stats: 3xl (30px), 2xl (24px)

### Components
- **Cards:** White background, subtle shadow, rounded corners
- **Badges:** Colored pills for status indicators
- **Buttons:** Primary (blue), Secondary (gray), Success, Danger
- **Stats:** Large numbers with trend indicators
- **Progress Bars:** Colored bars for inventory levels

### Icons
- Lucide React icons throughout
- Consistent 20px (w-5 h-5) size
- Colored to match context

---

## 📱 Responsive Breakpoints

```
Mobile:  < 768px   (1 column layout)
Tablet:  768-1024px (2 column layout)
Desktop: > 1024px   (3-6 column layout)
```

### Mobile View
- Sidebar collapses to hamburger menu
- KPI cards stack vertically
- Unit cards stack vertically
- Tables become scrollable

### Tablet View
- Sidebar remains visible
- KPI cards in 2 columns
- Unit cards in 2 columns
- Comfortable spacing

### Desktop View
- Full sidebar navigation
- KPI cards in 6 columns
- Unit cards in 3 columns
- Optimal data density

---

## 🌐 Internationalization

### Language Toggle
```
Header: [🌐 EN] ←→ [🌐 عربي]
```

### RTL/LTR Support
- **Arabic (RTL):**
  - Text flows right to left
  - Sidebar on right side
  - Icons flip horizontally
  - Numbers remain LTR

- **English (LTR):**
  - Text flows left to right
  - Sidebar on left side
  - Standard icon orientation
  - Standard number format

### Translation Coverage
- ✅ Navigation menu
- ✅ Dashboard labels
- ✅ KPI names
- ✅ Unit names
- ✅ Water quality parameters
- ✅ Inventory items
- ✅ Status labels
- ✅ Common actions (View, Edit, Delete, etc.)

---

## 🔔 Notifications (Planned)

```
┌─────────────────────────────────────────┐
│ 🔴 Critical Alert                       │
│ DO level below 4.0 mg/L in Pond H003    │
│ Action required immediately             │
│ 2 minutes ago                           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ⚠️ Warning                               │
│ Medicines inventory below minimum       │
│ Current: 45 kg, Min: 50 kg              │
│ 15 minutes ago                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ✅ Success                               │
│ Pond H001 ready for transfer            │
│ Target weight achieved                  │
│ 1 hour ago                              │
└─────────────────────────────────────────┘
```

---

## 📊 Charts (Ready to Implement)

### Growth Chart
```
Weight (g)
  600 │                                    ●
      │                              ●
  400 │                        ●
      │                  ●
  200 │            ●
      │      ●
    0 └──────┴──────┴──────┴──────┴──────┴──
      0     30    60    90   120   150  Days
```

### FCR Trend
```
FCR
 2.0 │
     │
 1.5 │     ●─────●─────●─────●─────●
     │
 1.0 │
     │
 0.5 └──────┴──────┴──────┴──────┴──────
      Week1  Week2  Week3  Week4  Week5
```

### Mortality Rate
```
Mortality %
  35 │ ●
     │   ╲
  25 │     ●
     │       ╲
  15 │         ●
     │           ╲
   5 │             ●─────●─────●
     └──────┴──────┴──────┴──────┴──────
      Stage1 Stage2 Stage3 Stage4 Stage5
```

---

## 🎯 User Flows

### Farm Owner Daily Check
1. Login → Dashboard
2. Check KPI cards (30 seconds)
3. Review water quality (1 minute)
4. Check inventory alerts (30 seconds)
5. View harvest-ready ponds (1 minute)
**Total: 3 minutes**

### Engineer Data Entry
1. Login → Select Unit
2. Select Pond
3. Enter water quality readings
4. Enter feed amount
5. Record mortality (if any)
6. Save and sync
**Total: 2-3 minutes per pond**

### Manager Weekly Review
1. Login → Dashboard
2. Review all units performance
3. Check FCR trends
4. Review mortality rates
5. Plan next week's activities
6. Generate weekly report
**Total: 15-20 minutes**

---

## ✨ Key Features Summary

### ✅ Implemented
- [x] Bilingual support (Arabic/English)
- [x] RTL/LTR layouts
- [x] Responsive design
- [x] Main dashboard with KPIs
- [x] Production unit cards
- [x] Water quality monitoring
- [x] Inventory tracking
- [x] Hatchery unit page
- [x] Pond details page
- [x] Navigation system
- [x] Status badges
- [x] Trend indicators

### ⏳ In Progress
- [ ] Grow-out unit details
- [ ] Fattening unit details
- [ ] Inventory management page
- [ ] Reports page
- [ ] Settings page

### 📋 Planned
- [ ] Data visualization charts
- [ ] User authentication
- [ ] Real-time updates
- [ ] Offline support
- [ ] Mobile app
- [ ] IoT integration
- [ ] Notifications
- [ ] Advanced analytics

---

**Built with modern web technologies for optimal performance and user experience.**
