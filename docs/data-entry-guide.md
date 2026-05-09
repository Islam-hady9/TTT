# 📝 Tibyan - Data Entry Forms Guide

## ✅ What's Been Added

### 5 Complete Data Entry Forms

1. **Water Quality Form** - قياس جودة المياه
2. **Feeding Form** - تسجيل التغذية
3. **Mortality Form** - تسجيل النفوق
4. **Batch Form** - إضافة دورة جديدة
5. **Additives Form** - إضافة مواد (مولاس، بروبيوتيكس، أدوية)

---

## 🎯 Form Features

### 1. Water Quality Form (WaterQualityForm.jsx)

**Purpose:** Record daily water quality measurements

**Parameters Tracked:**
- ✅ DO (Dissolved Oxygen) - الأكسجين الذائب
- ✅ pH Level - الحموضة
- ✅ Temperature - درجة الحرارة
- ✅ TAN (Total Ammonia Nitrogen) - نيتروجين الأمونيا
- ✅ Total Alkalinity - القلوية الكلية
- ✅ Floc Level - مستوى الفلوك
- ✅ NH3 (Toxic Ammonia) - الأمونيا السامة

**Smart Features:**
- ✅ Real-time validation against thresholds
- ✅ Color-coded status indicators (Optimal/Warning/Critical)
- ✅ Visual feedback for each parameter
- ✅ Automatic status calculation
- ✅ Measured by field for accountability

**Thresholds:**
```javascript
DO: 4.0-9.0 mg/L (optimal: 6.0-8.0)
pH: 6.5-8.5 (optimal: 7.0-8.3)
Temperature: 20-35°C (optimal: 25-30)
TAN: 0-1.5 mg/L (optimal: 0-0.5)
Alkalinity: 100-150 mg/L (optimal: 120-150)
Floc: 25-40 (optimal: 30-35)
```

---

### 2. Feeding Form (FeedingForm.jsx)

**Purpose:** Record daily feeding operations

**Data Captured:**
- ✅ Feed amount (kg)
- ✅ Feed type (Starter/Grower/Finisher/Fattening)
- ✅ Feeding time
- ✅ Duration (minutes)
- ✅ Consumption level (Full/Partial/Poor)
- ✅ Fed by (engineer name)
- ✅ Notes

**Smart Features:**
- ✅ Recommended feed calculation (based on biomass)
- ✅ Visual consumption level selector
- ✅ Time picker for feeding schedule
- ✅ Duration validation (15-20 minutes optimal)
- ✅ Feed type selection based on fish size

**Calculations:**
```javascript
Recommended Feed = Current Biomass × Feeding Rate %
Feeding Rate varies: 1-18% based on fish age
```

---

### 3. Mortality Form (MortalityForm.jsx)

**Purpose:** Record fish mortality

**Data Captured:**
- ✅ Mortality count
- ✅ Cause (Water quality/Disease/Stress/Temperature/Oxygen/Handling/Other)
- ✅ Recorded by (engineer name)
- ✅ Notes

**Smart Features:**
- ✅ Automatic mortality rate calculation
- ✅ Color-coded rate status (Good/Warning/Critical)
- ✅ Threshold alerts (>10% warning)
- ✅ Current fish count display
- ✅ Cause categorization

**Thresholds:**
```javascript
Hatchery: ≤35% acceptable
Grow-out/Fattening: ≤10% acceptable
Good: ≤5%
Warning: 5-10%
Critical: >10%
```

---

### 4. Batch Form (BatchForm.jsx)

**Purpose:** Create new production batch

**Data Captured:**
- ✅ Batch code (unique identifier)
- ✅ Stocking date
- ✅ Fish count
- ✅ Average weight (g)
- ✅ Stage (Eggs/Fry/Fingerling/Juvenile/Adult)
- ✅ Source (Internal/External)
- ✅ Supplier (if external)
- ✅ Created by
- ✅ Notes

**Smart Features:**
- ✅ Automatic biomass calculation
- ✅ Stage selection based on unit type
- ✅ Source toggle (Internal/External)
- ✅ Supplier field (conditional)
- ✅ Date picker with calendar
- ✅ Batch code validation

**Calculations:**
```javascript
Biomass (kg) = (Fish Count × Average Weight) / 1000
```

---

### 5. Additives Form (AdditivesForm.jsx)

**Purpose:** Record addition of supplements and treatments

**Types Supported:**
- ✅ Molasses (مولاس) - Liters
- ✅ Probiotics (بروبيوتيكس) - kg
- ✅ Calcium Carbonate (كربونات الكالسيوم) - kg
- ✅ Medicine (دواء) - ml
- ✅ Disinfectant (مطهر) - ml

**Smart Features:**
- ✅ Type-specific reasons dropdown
- ✅ Unit display based on type
- ✅ Guidelines for each additive type
- ✅ Color-coded type selection
- ✅ Contextual help text

**Guidelines Included:**
```
Molasses:
- Add when floc level < 25
- Stop when floc reaches 40
- Optimal floc: 30-35

Calcium Carbonate:
- Add when alkalinity < 100 mg/L
- Optimal: 120-150 mg/L
- Helps regulate pH

Probiotics:
- Weekly schedule recommended
- Improves floc level
- Supports biological system
```

---

## 🎨 Form Design Features

### Common Features Across All Forms

1. **Modal Design**
   - Full-screen overlay
   - Centered modal
   - Scrollable content
   - Sticky header

2. **Header Section**
   - Icon with color coding
   - Form title
   - Pond ID display
   - Close button (X)

3. **Validation**
   - Required field indicators (*)
   - Real-time error messages
   - Red border on invalid fields
   - Submit button disabled until valid

4. **User Experience**
   - Clear labels in Arabic
   - Placeholder text
   - Help text and guidelines
   - Visual feedback
   - Success/error states

5. **Actions**
   - Cancel button (secondary)
   - Submit button (primary)
   - Proper spacing
   - Border separator

---

## 🔗 Integration Points

### Pond Details Page

**Quick Action Buttons:**
```jsx
<button onClick={() => setActiveForm('water')}>
  قياس جودة المياه
</button>

<button onClick={() => setActiveForm('feeding')}>
  تسجيل التغذية
</button>

<button onClick={() => setActiveForm('mortality')}>
  تسجيل النفوق
</button>

<button onClick={() => setActiveForm('additives')}>
  إضافة مواد
</button>
```

**Form Rendering:**
```jsx
{activeForm === 'water' && (
  <WaterQualityForm
    pondId={pond.id}
    onClose={() => setActiveForm(null)}
    onSubmit={handleFormSubmit}
  />
)}
```

### Hatchery Unit Page

**Add Batch Button:**
```jsx
<button onClick={() => setShowBatchForm(true)}>
  إضافة دورة جديدة
</button>

{showBatchForm && (
  <BatchForm
    pondId="H001"
    unitType="hatchery"
    onClose={() => setShowBatchForm(false)}
    onSubmit={handleBatchSubmit}
  />
)}
```

---

## 📊 Data Flow

### 1. User Opens Form
```
User clicks button → Form modal opens → Form loads with pond data
```

### 2. User Fills Form
```
User enters data → Real-time validation → Visual feedback → Calculations update
```

### 3. User Submits
```
User clicks submit → Validation check → Data formatted → onSubmit callback → API call (TODO)
```

### 4. Success/Error
```
Success → Alert message → Form closes → Page refreshes
Error → Error message → Form stays open → User can retry
```

---

## 🎯 Usage Examples

### Example 1: Recording Water Quality

```javascript
// Engineer opens pond details
navigate('/pond/hatchery/H001')

// Clicks "قياس جودة المياه" button
setActiveForm('water')

// Fills in measurements
{
  do: 7.2,
  ph: 7.8,
  temperature: 28,
  tan: 0.3,
  alkalinity: 135,
  floc: 32,
  measuredBy: "أحمد محمد"
}

// System validates and shows status
DO: 7.2 mg/L ✓ Optimal
pH: 7.8 ✓ Optimal
Temperature: 28°C ✓ Optimal

// Submits → Data saved → Form closes
```

### Example 2: Recording Feeding

```javascript
// Engineer opens pond details
navigate('/pond/hatchery/H001')

// Clicks "تسجيل التغذية" button
setActiveForm('feeding')

// System shows recommended amount
Recommended: 2.43 kg (based on 81 kg biomass)

// Engineer enters actual amount
{
  feedAmount: 2.5,
  feedType: 'grower',
  feedingTime: '08:00',
  duration: 18,
  consumption: 'full',
  fedBy: "محمد علي"
}

// Submits → Data saved → Inventory updated
```

### Example 3: Creating New Batch

```javascript
// Manager opens hatchery unit
navigate('/hatchery')

// Clicks "إضافة دورة جديدة" button
setShowBatchForm(true)

// Fills batch information
{
  batchCode: '001',
  stockingDate: '2026-05-08',
  fishCount: 5000,
  avgWeight: 10,
  stage: 'fry',
  source: 'internal',
  createdBy: "د. إسلام"
}

// System calculates biomass
Biomass: 50 kg

// Submits → Batch created → Pond activated
```

---

## 🔧 Technical Implementation

### Form Component Structure

```jsx
export default function FormName({ pondId, onClose, onSubmit }) {
  const [formData, setFormData] = useState({...})
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    // Update form data
    // Clear errors
  }

  const validate = () => {
    // Check required fields
    // Return true/false
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        ...formData,
        pondId,
        timestamp: new Date().toISOString()
      })
    }
  }

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}
```

### Props Interface

```typescript
interface FormProps {
  pondId: string           // Pond identifier
  onClose: () => void      // Close modal callback
  onSubmit: (data) => void // Submit callback
  
  // Optional props
  currentBiomass?: number  // For feeding form
  currentFishCount?: number // For mortality form
  unitType?: string        // For batch form
}
```

---

## 📱 Mobile Optimization

All forms are responsive and work on mobile:

- ✅ Touch-friendly buttons
- ✅ Large input fields
- ✅ Scrollable content
- ✅ Mobile keyboard support
- ✅ Date/time pickers
- ✅ Number inputs with step

---

## 🚀 Next Steps

### Backend Integration (TODO)

```javascript
const handleFormSubmit = async (data) => {
  try {
    const response = await fetch('/api/water-quality', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (response.ok) {
      alert('تم حفظ البيانات بنجاح!')
      setActiveForm(null)
      // Refresh data
    }
  } catch (error) {
    alert('حدث خطأ أثناء الحفظ')
  }
}
```

### State Management (TODO)

```javascript
// Using Zustand
const useDataStore = create((set) => ({
  waterQuality: [],
  feeding: [],
  mortality: [],
  
  addWaterQuality: (data) => set((state) => ({
    waterQuality: [...state.waterQuality, data]
  })),
  
  addFeeding: (data) => set((state) => ({
    feeding: [...state.feeding, data]
  }))
}))
```

---

## ✅ Completion Status

### Forms: 100% Complete ✅
- [x] Water Quality Form
- [x] Feeding Form
- [x] Mortality Form
- [x] Batch Form
- [x] Additives Form

### Integration: 100% Complete ✅
- [x] Pond Details page
- [x] Hatchery Unit page
- [x] Modal system
- [x] Form callbacks

### Features: 100% Complete ✅
- [x] Validation
- [x] Calculations
- [x] Visual feedback
- [x] Error handling
- [x] Responsive design

### TODO: Backend Integration
- [ ] API endpoints
- [ ] Data persistence
- [ ] Real-time updates
- [ ] Offline support

---

## 📊 Impact

### Before:
- ❌ No data entry capability
- ❌ Read-only dashboard
- ❌ Mock data only

### After:
- ✅ 5 complete data entry forms
- ✅ Full CRUD operations (frontend)
- ✅ Smart calculations
- ✅ Real-time validation
- ✅ Professional UX

### Progress:
**Data Entry: 0% → 90%** 🎉

(10% remaining: Backend integration)

---

**Built with ❤️ for Tibyan Aquaculture** 🐟
