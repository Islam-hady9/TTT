import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { feedingCalculationsAPI } from '../../services/api'

function FeedingScheduleCard({ batchId }) {
  const { t } = useTranslation()
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (batchId) {
      loadFeedingSchedule()
    }
  }, [batchId])

  const loadFeedingSchedule = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await feedingCalculationsAPI.getSchedule(batchId)
      setSchedule(data)
    } catch (err) {
      console.error('Error loading feeding schedule:', err)
      setError(err.response?.data?.detail || t('feeding.errorLoading'))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
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
        </div>
      </div>
    )
  }

  if (!schedule) return null

  const getFeedTypeColor = (type) => {
    const colors = {
      starter: 'bg-blue-100 text-blue-800',
      grower: 'bg-green-100 text-green-800',
      finisher: 'bg-yellow-100 text-yellow-800',
      fattening: 'bg-purple-100 text-purple-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('feeding.feedingSchedule')}
        </h3>
        <button
          onClick={loadFeedingSchedule}
          className="text-blue-600 hover:text-blue-700"
          title={t('common.refresh')}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Batch Info */}
      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('harvest.batch')}:</span>
          <span className="font-semibold">{schedule.batch_code}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-600">{t('feeding.stage')}:</span>
          <span className="font-semibold">{t(`stages.${schedule.stage}`)}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-600">{t('feeding.biomass')}:</span>
          <span className="font-semibold">{schedule.biomass_kg} {t('common.kg')}</span>
        </div>
      </div>

      {/* Daily Amount - Main Display */}
      <div className="mb-6 text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">{t('feeding.dailyAmount')}</p>
        <p className="text-4xl font-bold text-blue-600 mb-2">
          {schedule.recommended_feed_kg}
          <span className="text-lg ml-2">{t('common.kg')}</span>
        </p>
        <p className="text-xs text-gray-600">
          {t('feeding.minAmount')}: {schedule.daily_feed_min_kg} {t('common.kg')} | 
          {t('feeding.maxAmount')}: {schedule.daily_feed_max_kg} {t('common.kg')}
        </p>
      </div>

      {/* Meals Per Day */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">{t('feeding.mealsPerDay')}</p>
          <p className="text-2xl font-bold text-green-600">{schedule.meals_per_day}</p>
        </div>

        {/* Per Meal Amount */}
        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">{t('feeding.perMeal')}</p>
          <p className="text-lg font-semibold text-purple-600">
            {schedule.feed_per_meal_min_kg} - {schedule.feed_per_meal_max_kg}
            <span className="text-xs ml-1">{t('common.kg')}</span>
          </p>
        </div>
      </div>

      {/* Feed Type */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">{t('feeding.feedType')}</p>
        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getFeedTypeColor(schedule.feed_type)}`}>
          {schedule.feed_type ? t(`feeding.feedTypes.${schedule.feed_type}`) : 'N/A'}
        </span>
      </div>

      {/* Feeding Rate Info */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{t('feeding.feedingRate')}:</span>
          <span>
            {(schedule.daily_feed_min_kg / schedule.biomass_kg * 100).toFixed(1)}% - 
            {(schedule.daily_feed_max_kg / schedule.biomass_kg * 100).toFixed(1)}% 
            {t('feeding.ofBiomass')}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => {
            // TODO: Navigate to feeding record page or open modal
            console.log('Record feeding for batch:', batchId)
          }}
        >
          {t('feeding.recordFeeding') || 'Record Feeding'}
        </button>
      </div>
    </div>
  )
}

export default FeedingScheduleCard
