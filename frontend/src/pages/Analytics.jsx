import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { batchesAPI } from '../services/api'
import FeedingScheduleCard from '../components/Feeding/FeedingScheduleCard'
import WaterQualityImpact from '../components/Analytics/WaterQualityImpact'
import BatchComparison from '../components/Analytics/BatchComparison'

function Analytics() {
  const { t } = useTranslation()
  const [batches, setBatches] = useState([])
  const [selectedBatchId, setSelectedBatchId] = useState(null)
  const [activeTab, setActiveTab] = useState('feeding') // feeding, waterQuality, comparison
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBatches()
  }, [])

  const loadBatches = async () => {
    setLoading(true)
    try {
      const data = await batchesAPI.getActive()
      setBatches(data)
      if (data.length > 0 && !selectedBatchId) {
        setSelectedBatchId(data[0].id)
      }
    } catch (error) {
      console.error('Error loading batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'feeding', label: t('feeding.title'), icon: '🍽️' },
    { id: 'waterQuality', label: t('analytics.waterQuality'), icon: '💧' },
    { id: 'comparison', label: t('analytics.batchComparison'), icon: '📊' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('analytics.title')}
        </h1>
        <p className="text-gray-600">
          {t('analytics.subtitle') || 'Advanced analytics and insights for your batches'}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 bg-white rounded-lg shadow p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Batch Selector (for feeding and water quality tabs) */}
      {activeTab !== 'comparison' && (
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('analytics.selectBatch') || 'Select Batch'}
          </label>
          {loading ? (
            <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
          ) : (
            <select
              value={selectedBatchId || ''}
              onChange={(e) => setSelectedBatchId(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('common.select') || 'Select...'}</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.batch_code} - {batch.pond?.pond_code} - {t(`stages.${batch.stage}`)} - 
                  {batch.current_count} {t('batchManagement.fish')}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === 'feeding' && selectedBatchId && (
          <>
            <FeedingScheduleCard batchId={selectedBatchId} />
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t('feeding.tips') || 'Feeding Tips'}
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">💡</span>
                  <p>
                    {t('feeding.tip1') || 'Feed at consistent times each day to establish a routine'}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">💡</span>
                  <p>
                    {t('feeding.tip2') || 'Adjust feeding amounts based on water temperature and fish behavior'}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">💡</span>
                  <p>
                    {t('feeding.tip3') || 'Monitor FCR regularly to optimize feeding efficiency'}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600">💡</span>
                  <p>
                    {t('feeding.tip4') || 'Reduce feeding if water quality parameters are outside optimal range'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'waterQuality' && selectedBatchId && (
          <>
            <WaterQualityImpact batchId={selectedBatchId} />
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t('waterQuality.optimalRanges') || 'Optimal Ranges for Tilapia'}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Dissolved Oxygen (DO):</span>
                  <span className="font-semibold">6.0 - 8.0 mg/L</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">pH:</span>
                  <span className="font-semibold">7.0 - 8.3</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Temperature:</span>
                  <span className="font-semibold">25 - 30°C</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">TAN:</span>
                  <span className="font-semibold">0.0 - 0.5 mg/L</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Alkalinity:</span>
                  <span className="font-semibold">100 - 200 mg/L</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Floc Level:</span>
                  <span className="font-semibold">10 - 30 mL/L</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'comparison' && (
          <div className="lg:col-span-2">
            <BatchComparison />
          </div>
        )}
      </div>

      {/* Empty State */}
      {!loading && batches.length === 0 && activeTab !== 'comparison' && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('batchManagement.noBatches')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('batchManagement.noBatchesDesc')}
          </p>
        </div>
      )}
    </div>
  )
}

export default Analytics
