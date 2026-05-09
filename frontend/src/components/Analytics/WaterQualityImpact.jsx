import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { analyticsAPI } from '../../services/api'

function WaterQualityImpact({ batchId, days = 30 }) {
  const { t } = useTranslation()
  const [correlation, setCorrelation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDays, setSelectedDays] = useState(days)

  useEffect(() => {
    if (batchId) {
      loadCorrelation()
    }
  }, [batchId, selectedDays])

  const loadCorrelation = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await analyticsAPI.correlateWaterQuality(batchId, selectedDays)
      setCorrelation(data)
    } catch (err) {
      console.error('Error loading water quality correlation:', err)
      setError(err.response?.data?.detail || t('analytics.errorLoading'))
    } finally {
      setLoading(false)
    }
  }

  const getImpactColor = (level) => {
    const colors = {
      high: 'text-red-600 bg-red-100 border-red-200',
      moderate: 'text-yellow-600 bg-yellow-100 border-yellow-200',
      low: 'text-green-600 bg-green-100 border-green-200',
      none: 'text-gray-600 bg-gray-100 border-gray-200'
    }
    return colors[level] || colors.none
  }

  const getImpactIcon = (level) => {
    switch (level) {
      case 'high':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'moderate':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'low':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm">{error}</p>
          <button
            onClick={loadCorrelation}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('common.retry') || 'Retry'}
          </button>
        </div>
      </div>
    )
  }

  if (!correlation) return null

  const wqSummary = correlation.water_quality_summary || {}
  const growthMetrics = correlation.growth_metrics || {}

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('analytics.waterQualityAnalysis')}
        </h3>
        
        {/* Days Selector */}
        <select
          value={selectedDays}
          onChange={(e) => setSelectedDays(Number(e.target.value))}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value={7}>7 {t('common.days')}</option>
          <option value={14}>14 {t('common.days')}</option>
          <option value={30}>30 {t('common.days')}</option>
          <option value={60}>60 {t('common.days')}</option>
          <option value={90}>90 {t('common.days')}</option>
        </select>
      </div>

      {/* Batch Info */}
      <div className="mb-6 p-3 bg-gray-50 rounded-lg text-sm">
        <span className="text-gray-600">{t('harvest.batch')}: </span>
        <span className="font-semibold">{correlation.batch_code}</span>
      </div>

      {/* Optimal Percentage - Main Display */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            {t('analytics.optimalPercentage')}
          </span>
          <span className="text-3xl font-bold text-blue-600">
            {correlation.optimal_percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              correlation.optimal_percentage >= 75
                ? 'bg-green-500'
                : correlation.optimal_percentage >= 50
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${correlation.optimal_percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Impact Level */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-3">{t('analytics.impact')}</p>
        <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${getImpactColor(correlation.impact_level)}`}>
          {getImpactIcon(correlation.impact_level)}
          <div>
            <p className="font-semibold text-lg">
              {t(`analytics.impactLevel.${correlation.impact_level}`)}
            </p>
            <p className="text-xs opacity-75">
              {t('analytics.correlationStrength')}: {correlation.correlation_strength}
            </p>
          </div>
        </div>
      </div>

      {/* Water Quality Summary */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          {t('analytics.daysAnalyzed')}: {wqSummary.days_analyzed} {t('common.days')}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-xs text-gray-600 mb-1">{t('analytics.optimalDays')}</p>
            <p className="text-2xl font-bold text-green-600">{wqSummary.optimal_days || 0}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg text-center">
            <p className="text-xs text-gray-600 mb-1">{t('analytics.warningDays')}</p>
            <p className="text-2xl font-bold text-yellow-600">{wqSummary.warning_days || 0}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-center">
            <p className="text-xs text-gray-600 mb-1">{t('analytics.criticalDays')}</p>
            <p className="text-2xl font-bold text-red-600">{wqSummary.critical_days || 0}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {t('analytics.totalReadings')}: {wqSummary.total_readings || 0}
        </p>
      </div>

      {/* Average Values */}
      {wqSummary.averages && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-3">{t('analytics.averageValues')}</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {wqSummary.averages.do && (
              <div className="flex justify-between">
                <span className="text-gray-600">DO:</span>
                <span className="font-semibold">{wqSummary.averages.do} mg/L</span>
              </div>
            )}
            {wqSummary.averages.ph && (
              <div className="flex justify-between">
                <span className="text-gray-600">pH:</span>
                <span className="font-semibold">{wqSummary.averages.ph}</span>
              </div>
            )}
            {wqSummary.averages.temperature && (
              <div className="flex justify-between">
                <span className="text-gray-600">{t('waterQuality.temp')}:</span>
                <span className="font-semibold">{wqSummary.averages.temperature}°C</span>
              </div>
            )}
            {wqSummary.averages.tan && (
              <div className="flex justify-between">
                <span className="text-gray-600">TAN:</span>
                <span className="font-semibold">{wqSummary.averages.tan} mg/L</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Growth Metrics */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-semibold text-gray-700 mb-3">{t('analytics.growthCorrelation')}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">SGR:</span>
            <span className="ml-2 font-semibold text-lg">
              {growthMetrics.sgr ? `${growthMetrics.sgr}%` : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">FCR:</span>
            <span className="ml-2 font-semibold text-lg">
              {growthMetrics.fcr || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {correlation.recommendations && correlation.recommendations.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">
            {t('analytics.recommendations')}
          </p>
          <ul className="space-y-2">
            {correlation.recommendations.map((rec, index) => (
              <li
                key={index}
                className={`text-sm p-3 rounded-lg flex items-start gap-2 ${
                  rec.includes('URGENT')
                    ? 'bg-red-50 text-red-800'
                    : 'bg-blue-50 text-blue-800'
                }`}
              >
                <span className="text-blue-600 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default WaterQualityImpact
