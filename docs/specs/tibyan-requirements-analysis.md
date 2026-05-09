# Tibyan - Aquaculture Farm Management System
## Comprehensive Requirements Analysis

---

## 📋 Executive Summary

**Project Name:** Tibyan - نظام إدارة مزارع الاستزراع المائي  
**Project Code:** TIBYAN-AQ-2026  
**Version:** 1.0.0  
**Date:** May 4, 2026  
**Domain:** Aquaculture Farm Management System  
**Species:** Tilapia (Oreochromis niloticus)  
**Target Market:** Saudi Arabia  
**Languages:** Arabic & English

### System Purpose
An integrated system for managing tilapia fish farms using RAS (Recirculating Aquaculture System) and Biofloc Technology, tracking all farm data from hatchery to harvest and marketing.

---

## 🎯 Core Business Objectives

1. **Centralized Data Management** - Consolidate all farm operations data in one system
2. **Real-time Monitoring** - Track water quality, feeding, mortality, and growth metrics
3. **Production Optimization** - Achieve target FCR (1.1-1.4) and minimize mortality
4. **Inventory Management** - Prevent stockouts with automated alerts
5. **Traceability** - Full batch tracking from stocking to harvest
6. **Multi-farm Scalability** - Support for future farm expansion

---

## 👥 User Personas & Pain Points

### 1. Farm Owner (مالك المزرعة)
- **Device:** Mac/iPhone
- **Daily Logins:** 5-7 times
- **Current Pain Points:**
  - Spends excessive time on manual follow-ups
  - Not fully dedicated to farm operations
  - Lacks real-time visibility into daily operations
- **Top Needs:**
  - Feed consumption tracking
  - Mortality rates
  - Fish count and biomass
  - FCR monitoring
  - Average fish weight
  - Water quality readings
  - Harvest-ready ponds
  - Inventory shortages
  - Engineer task tracking

### 2. Farm Manager (مدير المزرعة)
- **Device:** Dell/Lenovo Laptop + Android Mobile
- **Daily Logins:** 5-7 times
- **Current Pain Points:**
  - Data scattered across multiple tools
  - Unorganized task management with engineers
  - Difficult coordination with external teams
- **Top Needs:**
  - Feeding schedule management
  - Engineer performance monitoring
  - Site visit coordination
  - Maintenance scheduling
  - Shift handover documentation

### 3. Farm Engineers (مهندسو المزرعة)
- **Count:** 2 engineers
- **Device:** Dell/Lenovo Laptop + Android Mobile
- **Daily Logins:** 7-10 times
- **Current Pain Points:**
  - Manual data entry then re-entry on laptop
  - Scattered data across tools
  - No inventory depletion alerts
- **Top Needs:**
  - Mobile data entry for feeding operations
  - Water quality measurements
  - Mortality tracking
  - Daily task management
  - Pond sorting and transfers
  - Harvest operations monitoring

### 4. Sales Team (المبيعات)
- **Device:** Dell/Lenovo Laptop + Android Mobile
- **Daily Logins:** 1 time daily
- **Current Pain Points:**
  - No system for visit availability
  - No sales operation tracking
- **Top Needs:**
  - Market-weight pond tracking
  - B2B coordination
  - Visit scheduling
  - Harvest timing visibility

### 5. Purchasing Team (المشتريات)
- **Device:** Dell/Lenovo Laptop + Android Mobile
- **Daily Logins:** 1-3 times daily
- **Current Pain Points:**
  - Manual inventory coordination
  - Reactive purchasing due to lack of buffer stock
- **Top Needs:**
  - Raw material consumption tracking
  - Stock balance monitoring
  - Future purchase planning
  - Equipment maintenance schedules
  - Low inventory alerts

---

## 🐟 Fish Life Cycle Stages

### Stage 1: Eggs (البيض)
- **Weight:** < 1mm
- **Duration:** 3-5 days
- **System:** RAS (Hatchery Unit)
- **Key Metrics:** Egg count, hatch rate %

### Stage 2: Larvae/Fry (اليرقات)
- **Weight:** < 1g
- **Duration:** 14-21 days
- **System:** RAS (Hatchery Unit)
- **Key Metrics:** Daily mortality, water quality, feed amount

### Stage 3: Fingerlings (الصغار)
- **Weight:** 1-30g
- **Duration:** 28-56 days
- **System:** RAS (Hatchery Unit)
- **Key Metrics:** Average weight, mortality rate (max 35%), biomass, FCR
- **Key Activities:** Size-based sorting, transfer to grow-out

### Stage 4: Grow-out (النمو)
- **Weight:** 30-200g
- **Duration:** 60-90 days
- **System:** Biofloc (Grow-out Unit)
- **Key Metrics:** SGR, biomass, water quality, floc level, molasses amount
- **Key Activities:** Intensive feeding, molasses addition, probiotics, floc measurement

### Stage 5: Fattening (التسمين)
- **Weight:** 200-600g
- **Duration:** 60-90 days
- **System:** Biofloc (Fattening Unit)
- **Key Metrics:** Average weight, harvest readiness, cumulative FCR, mortality rate
- **Key Activities:** Reaching market weight, harvest scheduling, final sorting

### Stage 6: Harvest (الحصاد)
- **Weight:** > 350g (market weight: 350-600g)
- **Duration:** 1 day
- **Key Metrics:** Harvest weight, harvest count, buyer, price per kg
- **Key Activities:** Fish collection, weighing, packaging, marketing

### Batch Tracking
- **Format:** XXX (e.g., 001, 002)
- **Traceability:** Full tracking from stocking to harvest
- **Transfer Rule:** Sorting & transfer required every 3-4 months between stages

---

## 📊 Critical KPIs

### 1. Growth (النمو)
- **Formula:** Final Weight - Initial Weight
- **Target:** Market weight 350-600g
- **Impact if Missed:** Production plan failure

### 2. Survival/Mortality (الإعاشة/النفوق)
- **Formula:** Mortality count during sorting operations
- **Target:** 
  - Hatchery: ≤35%
  - Grow-out/Fattening: 5-10%
- **Impact if Missed:** Insufficient biomass, production target failure

### 3. Total Biomass (إجمالي الكتلة الحية)
- **Formula:** Average Weight × Total Fish Count per stage
- **Target:** Achieve agreed production plan
- **Impact if Missed:** Production target failure

### 4. Water Quality (جودة المياه)
- **Parameters:** DO, pH, Temperature, TAN, Alkalinity, Floc, Ammonia
- **Target:** Stable aquatic environment for optimal growth
- **Impact if Missed:** Environmental degradation, poor fish growth

### 5. FCR - Feed Conversion Ratio (معامل التحويل الغذائي)
- **Formula:** Feed Consumed (kg) / Biomass Produced (kg)
- **Thresholds:**
  - Excellent: 1.1-1.4
  - Good: 1.4-1.7
  - Poor: >1.7
- **Impact if Missed:** Increased cost per kg, reduced profit margin

---

## 🔬 Domain Glossary & Parameters

### Water Quality Parameters

| Parameter | Unit | Acceptable Range | Optimal Range | Critical Thresholds |
|-----------|------|------------------|---------------|---------------------|
| **DO** (Dissolved Oxygen) | mg/L | 4.0-9.0 | 6.0-8.0 | <4.0 (critical low), >9.0 (high) |
| **pH Level** | — | 6.5-8.5 | 7.0-8.3 | <6.5 (critical low), >8.5 (critical high) |
| **Water Temperature** | °C | 20-35 | 25-30 | <20 (critical low), >35 (critical high) |
| **TAN** (Total Ammonia Nitrogen) | mg/L | 0-1.5 | <0.5 | <0.5 (safe), 0.5-1.5 (warning), >1.5 (dangerous) |
| **Total Alkalinity** | mg/L | 100-150 | 120-150 | <100 (add CaCO₃), 100-120 (acceptable) |
| **Floc Level** | — | 25-40 | 30-35 | <25 (add molasses), >40 (stop molasses) |
| **NH3** (Toxic Ammonia) | mg/L | 0-0.5 | <0.5 | >0.5 (toxic) |

### Production Parameters

| Parameter | Definition | Range/Value | Notes |
|-----------|-----------|-------------|-------|
| **FCR** | Feed Conversion Ratio | 1.0-2.0 (optimal: 1.5) | Varies by season, stage, water temp, feed quality |
| **SGR** | Specific Growth Rate | Hatchery: 0.25-0.5 g/day<br>Nursery: 0.5-1.5 g/day<br>Grow-out: 1-5 g/day | Depends on stage, temperature, system type |
| **Harvest Weight** | Target market weight | 350-600g (optimal: 450g) | Based on Saudi market requirements |
| **Stocking Density** | Max density allowed | Biofloc: 10-25 kg/m³<br>RAS: 20-60 kg/m³ | System-dependent |
| **Daily Feeding Rate** | % of biomass | 1-18% body weight | Age and temperature dependent |
| **Oxygen Consumption** | Fish oxygen usage | 250-750 mg O₂/kg fish/h | Varies by species, temp, system, season |

---

## 📱 Platform Architecture

### Web Dashboard
- **Target Users:** Farm Owner, Farm Manager, Engineers, Purchasing, Sales
- **Purpose:** Data display, reports, KPI monitoring
- **Primary Device:** Desktop/Laptop
- **Features:** Responsive design, data visualization, report generation

### Mobile App
- **Target Users:** Farm Engineers, Workers/Technicians
- **Purpose:** Daily data entry ONLY
- **Platforms:** Android & iOS
- **Critical Feature:** **Offline Support** (must work without internet)
- **Sync:** Background sync when internet is restored

---

## 🗂️ Data Inventory

### Manual Data Entry (Priority 1)

| Data Type | Frequency | Entered By | Current Tool | Automation Possible |
|-----------|-----------|------------|--------------|---------------------|
| Daily feed amount | 2-4 times/day | Engineer | Paper + Excel | No (no auto-feeders) |
| Mortality count | Daily | Engineer | Paper + Excel | No (manual observation) |
| Total fish count | At stocking | Engineer | Paper + Excel | No |
| Batch code | At stocking | Engineer | Paper + Excel | No |
| Average fish weight | Bi-weekly | Engineer | Paper + Excel | No |
| Feeding schedule | Per Dr. Islam instructions | Engineer | Paper + Excel | No |
| FCR calculation | Calculated | Engineer | Paper + Excel | No |
| Medicines/probiotics | Per Dr. Islam instructions | Engineer | Paper + Excel | No |
| Molasses amount | Per Dr. Islam instructions | Engineer | Paper + Excel | No |

### IoT Sensor Data (Priority 2)

| Data Type | Frequency | Source | Integration Status |
|-----------|-----------|--------|-------------------|
| Water quality (DO, pH, Temp, TAN, Alkalinity, Floc, Ammonia) | 1-3 times/day | ReNile IoT Sensors | In transit - future integration |

**Note:** Each parameter must have threshold values (min, max, optimal range)

---

## 🖥️ Screen Specifications

### 1. Main Dashboard (Priority 1)
**Users:** All members  
**Device:** Web (mobile for data entry only in current phase)

**Sections:**
- Performance of each farm unit (mortality vs total count, cumulative FCR, average weight)
- Harvest-ready ponds
- Feed, medicine, disinfectant, probiotic consumption
- Water quality per unit (average)
- Inventory levels (feed, medicines, additives, disinfectants, molasses, probiotics)
- Financial Analysis (future): cost, revenue, cost per pound/kg/round/year
- Productivity ratio: harvested & sold ponds / total quantity
- Total water change rate
- Feeding schedule and water quality measurement schedule

**Top Actions:**
- Button for each unit to view details (dropdown or separate page)
- Toggle data view: matrices/tables or charts
- Download farm data history

### 2. Hatchery Unit (Priority 1)
**Users:** Owner, Farm Manager, Responsible Engineers  
**Device:** Web (mobile for data entry only)

**Sections:**
- Individual pond data (stocking, biomass, water quality, mortality, FCR, average weight)
- Probiotic, additive, medicine, disinfectant, molasses consumption
- Water change rate
- Feeding times and water quality measurement schedule
- Unit layout with dimensions (for investor presentations)

**Top Actions:**
- View individual pond data
- Separate page per pond (10 pages under unit)
- Display unit layout

### 3. Grow-out Unit (Priority 1)
**Users:** Owner, Farm Manager, Responsible Engineers  
**Device:** Web (mobile for data entry only)

**Sections:**
- Same as Hatchery Unit
- Bio-Floc system (different from RAS)
- Individual pond data
- Unit layout

### 4. Fattening Unit (Priority 1)
**Users:** Owner, Farm Manager, Responsible Engineers  
**Device:** Web (mobile for data entry only)

**Sections:**
- Same as Hatchery Unit
- Bio-Floc system
- Individual pond data
- Unit layout

---

## 🔄 Key Use Cases

### UC-0: Feed Addition
**Actors:** Workers/Technicians (execution), Engineers (supervision, quantities, timing), Farm Manager (feeding schedules)  
**Goal:** Fish growth at specific rate to reach market size on time  
**Frequency:** 2-4 times daily

**Steps:**
1. Create feeding schedule
2. Check water temperature
3. Determine feed quantities based on temperature
4. Verify water quality is good
5. Determine fish size for feed quantity calculation
6. Set feeding times during the day
7. Divide total daily feed into 2-4 meals

**Expected Result:** Fish consume feed within 15-20 minutes

### UC-1: Molasses Addition
**Actors:** Workers (execution), Engineers (supervision), Dr. Islam (quantity calculation)  
**Goal:** Regulate C/N Ratio in aquatic environment  
**Frequency:** 2-5 times daily per Dr. Islam's instructions

**Steps:**
1. Read floc level in water
2. Floc level should be between 25-40
3. After 40, stop adding molasses
4. Repeated addition varies based on biological state (reactive to readings)

**Expected Result:** Achieve biological balance in aquatic environment

### UC-2: Calcium Carbonate Addition
**Actors:** Engineers  
**Goal:** Maintain total alkalinity between 120-150 mg/L  
**Frequency:** 2-3 times daily during instability periods

**Steps:**
1. Periodic alkalinity measurement
2. Monitor changes
3. Start adding calcium carbonate when alkalinity drops below 100 mg/L

**Expected Result:** Aquatic environment stability, prevent harmful nitrogen accumulation

### UC-3: Periodic Water Quality Measurement
**Actors:** Engineers  
**Goal:** Check water quality  
**Frequency:** 1-3 times daily

**Steps:**
1. Measure oxygen, pH, temperature, total alkalinity, floc, ammonia
2. Measure morning, afternoon, evening
3. Emergency measurements as needed

**Expected Result:** Environmental stability for fish

### UC-4: Probiotics Addition
**Actors:** Engineers  
**Goal:** Support biological system in aquatic environment  
**Frequency:** Once weekly

**Steps:**
1. Add specified bacterial doses

**Expected Result:** Improve floc level in ponds

### UC-5: Daily Floc Measurement
**Actors:** Engineers  
**Goal:** Monitor floc level to ensure water stability and microbial protein formation  
**Frequency:** Daily

**Steps:**
1. Use Imhoff cone
2. Take water sample from pond
3. Let settle for 30 minutes

**Expected Result:** Check floc quality level and determine water's need for molasses

### UC-6: Daily Waste Removal / Partial Water Change
**Actors:** Workers supervised by Engineers  
**Goal:** Remove settled waste from bottom  
**Frequency:** 4-6 times daily

**Steps:**
1. Raise drainage pipe for 30 seconds
2. Every 4-6 hours

**Expected Result:** Reduce nitrogen loads in pond

### UC-7: Periodic Diffuser Cleaning
**Actors:** Workers (execution), Engineers (supervision)  
**Goal:** Maintain oxygen flow rate and dissolution efficiency  
**Frequency:** Daily or as needed

**Steps:**
1. Remove diffuser
2. Soak in diluted hydrochloric acid solution
3. Reinstall

**Expected Result:** Restore optimal oxygen flow

### UC-8: Periodic Harvest Between Stages (Sorting, Transfer, Restocking)
**Actors:** Workers/Technicians (execution), Engineers (supervision)  
**Goal:** Achieve target plan within production sector  
**Frequency:** Once every 3-4 months for all ponds

**Steps:**
1. Harvest
2. Inspect
3. Sort
4. Restock

**Expected Result:** Achieve production plan

### UC-9: Final Harvest
**Actors:** Workers/Technicians (execution), Engineers & Farm Manager (supervision)  
**Goal:** Fish exit for marketing  
**Frequency:** 3 times annually for all fattening ponds

**Steps:**
1. Collect fish in one location within pond
2. Remove fish for packaging in boxes or tanks
3. Weigh fish in required quantity

**Expected Result:** Achieve production plan goal

---

## ⚙️ Business Rules

### Water Quality Thresholds

| Parameter | Min | Max | Optimal Min | Optimal Max | Unit | Action if Violated |
|-----------|-----|-----|-------------|-------------|------|-------------------|
| Temperature | 20 | 35 | 25 | 30 | °C | Immediate alert |
| pH | 6.5 | 8.5 | 7.0 | 8.3 | — | Add calcium carbonate |
| DO | 4.0 | 99 | 6.0 | 8.0 | mg/L | Activate emergency pumps |
| TAN | 0 | 1.5 | 0 | 0.5 | mg/L | Reduce feeding/water change |
| Total Alkalinity | 100 | 150 | 120 | 150 | mg/L | Add calcium carbonate |
| Floc Level | 25 | 40 | 30 | 35 | — | Add/stop molasses |

### Feeding Rules
1. Feed 2-4 times daily based on life stage
2. Feeding duration: 15-20 minutes (feed must be consumed in this time)
3. Feed quantity calculated based on: current fish weight, water temperature, total biomass
4. Daily feed rate: 1-18% of biomass depending on age

### Harvest Rules
1. Market weight: 350-600g (per Saudi market demand)
2. Sorting & transfer: every 3-4 months for ponds
3. Final harvest: 3 times annually
4. Acceptable mortality rate: Hatchery 35%, Grow-out/Fattening 5-10%

### Inventory Rules
1. Alert when approaching minimum inventory level
2. Pre-coordinate with suppliers before stock depletion
3. Track maintenance schedule for each equipment individually

---

## 📐 Key Formulas

### 1. Specific Growth Rate (SGR)
```
SGR = (ln(W_final) - ln(W_initial)) / days × 100
```
**Stages:**
- Hatchery: 0.25-0.5 g/day
- Nursery: 0.5-1.5 g/day
- Grow-out: 1-5 g/day

### 2. Feed Conversion Ratio (FCR)
```
FCR = Total_Feed_Consumed (kg) / Total_Biomass_Gain (kg)
```
**Thresholds:**
- Excellent: 1.1-1.4
- Good: 1.4-1.7
- Poor: >1.7

### 3. Biomass
```
Biomass (kg) = Average_Weight (g) × Fish_Count / 1000
```

### 4. Mortality Rate
```
Mortality_% = (Total_Mortality / Initial_Stock) × 100
```
**Thresholds:**
- Hatchery max: 35%
- Grow-out max: 10%

### 5. Daily Feed Rate
```
Daily_Feed_% = (Daily_Feed_Amount / Biomass) × 100
```
**Range:** 1-18%

---

## 🔌 Integrations & Constraints

### Priority 1 (Critical)
- ✅ **Offline Support:** System must work without internet
- ✅ **Languages:** Arabic & English (bilingual)
- ✅ **Mobile Platforms:** Android & iOS
- ✅ **Security:** 2FA (Two-Factor Authentication) with OTP
- ✅ **Role-based Access:** Financial data visible only to Owner & Accounting
- ✅ **Excel Import:** Templates exist with Dr. Islam, Production, Purchasing, Warehouse teams
- ✅ **Concurrent Users:** 7-10 users currently

### Priority 2 (Important)
- 🔄 **IoT Sensors:** ReNile water quality sensors (in transit - future integration)
- 🔄 **Multi-farm Support:** Future farms planned with partial workflow changes
- 🔄 **Data Retention:** 3 years minimum storage
- 🔄 **Backup & Restore:** Large data storage requirement

### Priority 3 (Nice to Have)
- 📧 **WhatsApp/SMS Notifications:** Emergency only - for Dr. Islam, Owner, external departments
- 📄 **Reports:** PDF & Excel - weekly reports (end of Thursday), data history for handover
- 🔗 **Odoo Integration:** Exists but NO integration in current phase

### Not Required
- ❌ **Legacy Data Migration:** No old NABCO application data to migrate

---

## ❓ Unclear Points Requiring Clarification

1. **Fingerling Source:** Are fingerlings purchased from external supplier or is there an internal hatchery?
2. **Initial Stocking:** How is first fingerling entry recorded? (count + average weight + date)
3. **Tracking Level:** Individual fish tracking or batch-level only?
4. **Warehouse Structure:** One central warehouse or separate warehouses per unit?
5. **Inventory Transactions:** Who enters warehouse withdrawal data? (Engineer or Warehouse keeper?)
6. **Maintenance Schedule:** Is there a periodic maintenance schedule for equipment? (pumps, diffusers, filtration systems)
7. **Maintenance Requests:** Who creates maintenance requests?
8. **Sales Channel:** B2B (markets/restaurants) or B2C (end consumer)?
9. **Pricing:** Are sales prices recorded in the system?
10. **Odoo Integration:** Will system be linked to Odoo in the future?
11. **Financial Data:** What financial data is required? (production cost, revenue, profit margin)

---

## 💻 Technical Stack Recommendations

### Frontend - Web Dashboard
- **Framework:** React.js or Vue.js
- **Styling:** Tailwind CSS
- **Charts:** Chart.js or Recharts
- **State Management:** Redux or Zustand
- **Internationalization:** react-i18next

### Frontend - Mobile App
- **Framework:** React Native or Flutter
- **Offline Storage:** SQLite / Realm / WatermelonDB
- **Sync:** Background sync when internet restored

### Backend
- **Framework:** Node.js (Express) or Python (FastAPI)
- **Database:** PostgreSQL
- **Cache:** Redis
- **Authentication:** JWT + 2FA (OTP via SMS/WhatsApp API)
- **File Storage:** AWS S3 or Cloudflare R2

### IoT Integration
- **Protocol:** MQTT
- **Sensors:** ReNile Water Quality Sensors
- **Status:** In transit - future integration

### Deployment
- **Cloud:** AWS, DigitalOcean, or Hetzner
- **Containers:** Docker + Docker Compose
- **CI/CD:** GitHub Actions

---

## 🎯 Implementation Priorities

### Phase 1: Core MVP (Months 1-3)
1. User authentication with 2FA
2. Main dashboard with key KPIs
3. Mobile app for data entry (offline-first)
4. Pond management (Hatchery, Grow-out, Fattening)
5. Water quality tracking with threshold alerts
6. Feeding schedule and tracking
7. Mortality tracking
8. Batch tracking system

### Phase 2: Advanced Features (Months 4-6)
1. Inventory management with low-stock alerts
2. Harvest management
3. Report generation (PDF & Excel)
4. Task management for engineers
5. Maintenance scheduling
6. Sales coordination features

### Phase 3: Integrations (Months 7-9)
1. IoT sensor integration (ReNile)
2. WhatsApp/SMS notifications
3. Advanced analytics and forecasting
4. Multi-farm support
5. Financial analysis module

### Phase 4: Future Enhancements
1. Odoo ERP integration
2. AI-powered growth predictions
3. Automated feeding recommendations
4. Advanced reporting and BI dashboards

---

## 📊 Success Metrics

1. **Operational Efficiency**
   - Reduce data entry time by 70%
   - Eliminate duplicate data entry
   - Real-time visibility for farm owner

2. **Production Performance**
   - Achieve FCR of 1.1-1.4 (excellent range)
   - Maintain mortality below thresholds (35% hatchery, 10% grow-out)
   - Reach market weight (350-600g) on schedule

3. **Inventory Management**
   - Zero stockouts
   - 30-day advance purchase planning
   - Automated low-stock alerts

4. **User Adoption**
   - 100% mobile app adoption by engineers
   - Daily dashboard usage by owner/manager
   - Reduced phone/WhatsApp coordination by 60%

---

## 🚨 Critical Risks & Mitigation

### Risk 1: Offline Functionality
**Impact:** High - Engineers work in areas with poor connectivity  
**Mitigation:** 
- Implement robust offline-first architecture
- Local SQLite/Realm database on mobile
- Background sync with conflict resolution
- Thorough offline testing

### Risk 2: Data Accuracy
**Impact:** High - Manual data entry prone to errors  
**Mitigation:**
- Input validation and range checks
- Threshold alerts for abnormal values
- Audit trail for all entries
- Periodic data quality reviews

### Risk 3: User Adoption
**Impact:** Medium - Users accustomed to paper/Excel  
**Mitigation:**
- Intuitive mobile UI design
- Comprehensive training program
- Gradual rollout by unit
- Continuous user feedback loop

### Risk 4: IoT Integration Complexity
**Impact:** Medium - ReNile sensors not yet delivered  
**Mitigation:**
- Design system to work without IoT initially
- Create flexible integration layer
- Plan for MQTT protocol implementation
- Test with sensor simulators

---

## 📝 Next Steps

1. **Requirements Validation**
   - Review this analysis with stakeholders
   - Clarify all unclear points
   - Prioritize features with farm owner

2. **Technical Design**
   - Create detailed system architecture
   - Design database schema
   - Define API contracts
   - Plan offline sync strategy

3. **UI/UX Design**
   - Create wireframes for all screens
   - Design mobile app flows
   - Develop bilingual design system
   - Prototype key user journeys

4. **Development Planning**
   - Break down into sprints
   - Assign development team
   - Set up development environment
   - Establish testing strategy

5. **Pilot Planning**
   - Select pilot unit (recommend Hatchery)
   - Define success criteria
   - Plan training sessions
   - Prepare rollback strategy

---

**Document Version:** 1.0  
**Last Updated:** May 4, 2026  
**Prepared For:** Tibyan Aquaculture Project  
**Status:** Ready for Stakeholder Review
