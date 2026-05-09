# 🚀 Quick Start: Advanced Features

## دليل البدء السريع للميزات المتقدمة

This guide shows you how to quickly integrate and use the three new advanced features.

---

## 1️⃣ Daily Feed Calculator (حساب العلف اليومي)

### Use Case:
Display recommended daily feed amount for each batch based on current biomass and lifecycle stage.

### Quick Integration:

```jsx
// In your BatchDetails.jsx or FeedingManagement.jsx
import { feedingCalculationsAPI } from '@/services/api'
import { useTranslation } from 'react-i18next'

function FeedingScheduleCard({ batchId }) {
  const { t } = useTranslation()
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeedingSchedule()
  }, [batchId])

  const loadFeedingSchedule = async () => {
    try {
      const data = await feedingCalculationsAPI.getSchedule(batchId)
      setSchedule(data)
    } catch (error) {
      console.error('Error loading feeding schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>{t('common.loading')}</div>

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        {t('feeding.feedingSchedule')}
      </h3>
      
      {/* Daily Amount */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">{t('feeding.dailyAmount')}</p>
        <p className="text-2xl font-bold text-blue-600">
          {schedule.recommended_feed_kg} {t('common.kg')}
        </p>
        <p className="text-xs text-gray-500">
          {schedule.daily_feed_min_kg} - {schedule.daily_feed_max_kg} {t('common.kg')}
        </p>
      </div>

      {/* Meals Per Day */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">{t('feeding.mealsPerDay')}</p>
        <p className="text-xl font-semibold">{schedule.meals_per_day}</p>
      </div>

      {/* Per Meal Amount */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">{t('feeding.perMeal')}</p>
        <p className="text-lg">
          {schedule.feed_per_meal_min_kg} - {schedule.feed_per_meal_max_kg} {t('common.kg')}
        </p>
      </div>

      {/* Feed Type */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">{t('feeding.feedType')}</p>
        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
          {t(`feeding.feedTypes.${schedule.feed_type}`)}
        </span>
      </div>

      {/* Biomass Info */}
      <div className="text-xs text-gray-500 mt-4 pt-4 border-t">
        {t('feeding.biomass')}: {schedule.biomass_kg} {t('common.kg')} | 
        {t('feeding.stage')}: {t(`stages.${schedule.stage}`)}
      </div>
    </div>
  )
}
```

### API Endpoints:
```javascript
// Get complete feeding schedule
const schedule = await feedingCalculationsAPI.getSchedule(batchId)

// Get just the calculation
const calc = await feedingCalculationsAPI.calculateDaily(batchId)

// Get all feeding rates reference
const rates = await feedingCalculationsAPI.getRates()

// Validate feed type
const validation = await feedingCalculationsAPI.validateFeedType(batchId, 'grower')
```

---

## 2️⃣ Water Quality Impact (تأثير جودة المياه)

### Use Case:
Show how water quality is affecting fish growth and provide recommendations.

### Quick Integration:

```jsx
// In your BatchDetails.jsx or Analytics.jsx
import { analyticsAPI } from '@/services/api'
import { useTranslation } from 'react-i18next'

function WaterQualityImpactCard({ batchId }) {
  const { t } = useTranslation()
  const [correlation, setCorrelation] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCorrelation()
  }, [batchId])

  const loadCorrelation = async () => {
    try {
      const data = await analyticsAPI.correlateWaterQuality(batchId, 30)
      setCorrelation(data)
    } catch (error) {
      console.error('Error loading correlation:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>{t('common.loading')}</div>

  const getImpactColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'moderate': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        {t('analytics.waterQualityAnalysis')}
      </h3>

      {/* Optimal Percentage */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            {t('analytics.optimalPercentage')}
          </span>
          <span className="text-2xl font-bold text-blue-600">
            {correlation.optimal_percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${correlation.optimal_percentage}%` }}
          />
        </div>
      </div>

      {/* Impact Level */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">{t('analytics.impact')}</p>
        <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${getImpactColor(correlation.impact_level)}`}>
          {t(`analytics.impactLevel.${correlation.impact_level}`)}
        </span>
      </div>

      {/* Water Quality Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-xs text-gray-500">{t('analytics.optimalDays')}</p>
          <p className="text-lg font-semibold text-green-600">
            {correlation.water_quality_summary.optimal_days}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{t('analytics.warningDays')}</p>
          <p className="text-lg font-semibold text-yellow-600">
            {correlation.water_quality_summary.warning_days}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{t('analytics.criticalDays')}</p>
          <p className="text-lg font-semibold text-red-600">
            {correlation.water_quality_summary.critical_days}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{t('analytics.totalReadings')}</p>
          <p className="text-lg font-semibold">
            {correlation.water_quality_summary.total_readings}
          </p>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-semibold mb-2">{t('analytics.growthCorrelation')}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">SGR:</span>
            <span className="ml-2 font-semibold">{correlation.growth_metrics.sgr}%</span>
          </div>
          <div>
            <span className="text-gray-600">FCR:</span>
            <span className="ml-2 font-semibold">{correlation.growth_metrics.fcr}</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <p className="text-sm font-semibold mb-2">{t('analytics.recommendations')}</p>
        <ul className="space-y-2">
          {correlation.recommendations.map((rec, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

### API Endpoints:
```javascript
// Get water quality summary
const summary = await analyticsAPI.analyzeWaterQuality(batchId, 30)

// Get correlation with growth
const correlation = await analyticsAPI.correlateWaterQuality(batchId, 30)
```

---

## 3️⃣ Batch Comparison (مقارنة الدفعات)

### Use Case:
Compare performance across multiple batches to identify best practices.

### Quick Integration:

```jsx
// In your BatchComparison.jsx or Analytics.jsx
import { analyticsAPI } from '@/services/api'
import { useTranslation } from 'react-i18next'

function BatchComparisonTable() {
  const { t } = useTranslation()
  const [selectedBatches, setSelectedBatches] = useState([])
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleCompare = async () => {
    if (selectedBatches.length < 2) {
      alert(t('analytics.minTwoBatches'))
      return
    }

    setLoading(true)
    try {
      const data = await analyticsAPI.compareBatches(selectedBatches, false)
      setComparison(data)
    } catch (error) {
      console.error('Error comparing batches:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!comparison) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          {t('analytics.compareBatches')}
        </h3>
        {/* Batch selector UI here */}
        <button
          onClick={handleCompare}
          disabled={selectedBatches.length < 2}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          {t('analytics.compare')}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        {t('analytics.comparisonResults')}
      </h3>

      {/* Averages */}
      <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-600">{t('analytics.averages')} FCR</p>
          <p className="text-xl font-bold">{comparison.averages.fcr}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">{t('analytics.averages')} SGR</p>
          <p className="text-xl font-bold">{comparison.averages.sgr}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">{t('analytics.survivalRate')}</p>
          <p className="text-xl font-bold">{comparison.averages.survival_rate}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">{t('analytics.cycleDuration')}</p>
          <p className="text-xl font-bold">{comparison.averages.cycle_duration} {t('analytics.days')}</p>
        </div>
      </div>

      {/* Best Performers */}
      <div className="mb-6">
        <h4 className="font-semibold text-green-600 mb-3">
          🏆 {t('analytics.bestPerformers')}
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-600">Best FCR</p>
            <p className="font-semibold">{comparison.best_performers.fcr.batch_code}</p>
            <p className="text-sm text-green-600">{comparison.best_performers.fcr.value}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-600">Best SGR</p>
            <p className="font-semibold">{comparison.best_performers.sgr.batch_code}</p>
            <p className="text-sm text-green-600">{comparison.best_performers.sgr.value}%</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-600">Best Survival</p>
            <p className="font-semibold">{comparison.best_performers.survival_rate.batch_code}</p>
            <p className="text-sm text-green-600">{comparison.best_performers.survival_rate.value}%</p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('harvest.batch')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('pond.pond')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                FCR
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                SGR
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('analytics.survivalRate')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {t('analytics.cycleDuration')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comparison.comparisons.map((batch) => (
              <tr key={batch.batch_id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{batch.batch_code}</td>
                <td className="px-4 py-3 text-sm">{batch.pond_code}</td>
                <td className={`px-4 py-3 text-sm font-semibold ${
                  batch.batch_id === comparison.best_performers.fcr.batch_id
                    ? 'text-green-600'
                    : batch.batch_id === comparison.worst_performers.fcr.batch_id
                    ? 'text-red-600'
                    : ''
                }`}>
                  {batch.fcr || 'N/A'}
                </td>
                <td className={`px-4 py-3 text-sm font-semibold ${
                  batch.batch_id === comparison.best_performers.sgr.batch_id
                    ? 'text-green-600'
                    : batch.batch_id === comparison.worst_performers.sgr.batch_id
                    ? 'text-red-600'
                    : ''
                }`}>
                  {batch.sgr ? `${batch.sgr}%` : 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm">{batch.survival_rate}%</td>
                <td className="px-4 py-3 text-sm">
                  {batch.cycle_duration_days ? `${batch.cycle_duration_days} ${t('analytics.days')}` : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

### API Endpoints:
```javascript
// Compare specific batches
const comparison = await analyticsAPI.compareBatches([1, 2, 3, 4], false)

// Compare batches in same stage
const stageComparison = await analyticsAPI.compareByStage('juveniles', 10)

// Compare batches by date range
const dateComparison = await analyticsAPI.compareByDateRange(
  '2026-01-01',
  '2026-03-31',
  10
)
```

---

## 🎯 Complete Example: Analytics Dashboard

Here's a complete example combining all three features:

```jsx
// src/pages/Analytics.jsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import FeedingScheduleCard from '@/components/Analytics/FeedingScheduleCard'
import WaterQualityImpactCard from '@/components/Analytics/WaterQualityImpactCard'
import BatchComparisonTable from '@/components/Analytics/BatchComparisonTable'

function Analytics() {
  const { t } = useTranslation()
  const [selectedBatchId, setSelectedBatchId] = useState(null)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('analytics.title')}</h1>

      {/* Batch Selector */}
      <div className="mb-6">
        {/* Add batch selector component here */}
      </div>

      {selectedBatchId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Feeding Schedule */}
          <FeedingScheduleCard batchId={selectedBatchId} />

          {/* Water Quality Impact */}
          <WaterQualityImpactCard batchId={selectedBatchId} />
        </div>
      )}

      {/* Batch Comparison */}
      <BatchComparisonTable />
    </div>
  )
}

export default Analytics
```

---

## 📱 Mobile Responsive Tips

```jsx
// Use responsive grid classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Stack on mobile
<div className="flex flex-col md:flex-row gap-4">

// Hide on mobile, show on desktop
<div className="hidden md:block">

// Show on mobile, hide on desktop
<div className="block md:hidden">
```

---

## 🎨 Color Coding Guide

```javascript
// Impact Levels
const impactColors = {
  none: 'bg-gray-100 text-gray-800',
  low: 'bg-green-100 text-green-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
}

// Performance Indicators
const performanceColors = {
  best: 'text-green-600 bg-green-50',
  average: 'text-blue-600 bg-blue-50',
  worst: 'text-red-600 bg-red-50'
}

// Water Quality Status
const wqColors = {
  optimal: 'text-green-600',
  warning: 'text-yellow-600',
  critical: 'text-red-600'
}
```

---

## ✅ Testing Checklist

- [ ] Test feeding calculation with different stages
- [ ] Test water quality analysis with various data ranges
- [ ] Test batch comparison with 2, 5, and 10 batches
- [ ] Test error handling (no data, invalid batch ID)
- [ ] Test loading states
- [ ] Test responsive design on mobile
- [ ] Test Arabic/English translations
- [ ] Test with real production data

---

## 🐛 Common Issues & Solutions

### Issue: "Biomass not calculated"
**Solution:** Ensure batch has both `current_count` and `avg_weight` set.

### Issue: "Insufficient water quality data"
**Solution:** Need at least 1 water quality reading in the specified time period.

### Issue: "Not enough batches for comparison"
**Solution:** Need at least 2 batches. Check that batch IDs exist and are valid.

### Issue: API returns 401 Unauthorized
**Solution:** Ensure user is logged in and token is valid.

---

## 📚 Additional Resources

- Full API Documentation: `http://localhost:8000/docs`
- Backend Services: `backend/app/services/`
- API Routes: `backend/app/api/routes/`
- Translations: `src/i18n/locales/`

---

**Happy Coding! 🚀**

For questions or issues, check the main documentation in `ADVANCED_FEATURES_COMPLETE.md`
