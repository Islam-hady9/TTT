import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { analyticsAPI, batchesAPI } from '../../services/api'

function BatchComparison() {
  const { t } = useTranslation()
  const [batches, setBatches] = useState([])
  const [selectedBatches, setSelectedBatches] = useState([])
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingBatches, setLoadingBatches] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadBatches()
  }, [])

  const loadBatches = async () => {
    setLoadingBatches(true)
    try {
      const data = await batchesAPI.getAll()
      setBatches(data)
    } catch (err) {
      console.error('Error loading batches:', err)
    } finally {
      setLoadingBatches(false)
    }
  }

  const handleBatchToggle = (batchId) => {
    setSelectedBatches(prev => {
      if (prev.includes(batchId)) {
        return prev.filter(id => id !== batchId)
      } else {
        if (prev.length >= 10) {
          alert(t('analytics.maxTenBatches'))
          return prev
        }
        return [...prev, batchId]
      }
    })
  }

  const handleCompare = async () => {
    if (selectedBatches.length < 2) {
      alert(t('analytics.minTwoBatches'))
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await analyticsAPI.compareBatches(selectedBatches, false)
      setComparison(data)
    } catch (err) {
      console.error('Error comparing batches:', err)
      setError(err.response?.data?.detail || t('analytics.errorLoading'))
    } finally {
      setLoading(false)
    }
  }

  const getBestWorstClass = (batchId, metric, isBest) => {
    if (!comparison) return ''
    
    const performers = isBest ? comparison.best_performers : comparison.worst_performers
    if (performers[metric]?.batch_id === batchId) {
      return isBest ? 'text-green-600 font-bold' : 'text-red-600 font-bold'
    }
    return ''
  }

  if (loadingBatches) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('analytics.compareBatches')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('analytics.selectBatches')} ({selectedBatches.length}/10)
        </p>
      </div>

      {!comparison ? (
        <>
          {/* Batch Selection */}
          <div className="mb-6 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {batches.map((batch) => (
                <label
                  key={batch.id}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedBatches.includes(batch.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedBatches.includes(batch.id)}
                    onChange={() => handleBatchToggle(batch.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{batch.batch_code}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                        {t(`stages.${batch.stage}`)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {batch.pond?.pond_code} | {batch.current_count} {t('batchManagement.fish')} | 
                      {batch.avg_weight}g | FCR: {batch.fcr || 'N/A'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Compare Button */}
          <button
            onClick={handleCompare}
            disabled={selectedBatches.length < 2 || loading}
            className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
              selectedBatches.length < 2
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? t('analytics.comparing') : t('analytics.compare')}
          </button>
        </>
      ) : (
        <>
          {/* Comparison Results */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">{t('analytics.comparisonResults')}</h4>
              <button
                onClick={() => {
                  setComparison(null)
                  setSelectedBatches([])
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {t('common.reset') || 'New Comparison'}
              </button>
            </div>

            {/* Averages */}
            <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">{t('analytics.averages')} FCR</p>
                <p className="text-2xl font-bold text-blue-600">{comparison.averages.fcr || 'N/A'}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">{t('analytics.averages')} SGR</p>
                <p className="text-2xl font-bold text-green-600">
                  {comparison.averages.sgr ? `${comparison.averages.sgr}%` : 'N/A'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">{t('analytics.survivalRate')}</p>
                <p className="text-2xl font-bold text-purple-600">
                  {comparison.averages.survival_rate ? `${comparison.averages.survival_rate}%` : 'N/A'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">{t('analytics.cycleDuration')}</p>
                <p className="text-2xl font-bold text-orange-600">
                  {comparison.averages.cycle_duration ? `${comparison.averages.cycle_duration}d` : 'N/A'}
                </p>
              </div>
            </div>

            {/* Best Performers */}
            <div className="mb-6">
              <h5 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                <span>🏆</span>
                {t('analytics.bestPerformers')}
              </h5>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Best FCR</p>
                  <p className="font-semibold text-sm">{comparison.best_performers.fcr.batch_code}</p>
                  <p className="text-lg font-bold text-green-600">{comparison.best_performers.fcr.value}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Best SGR</p>
                  <p className="font-semibold text-sm">{comparison.best_performers.sgr.batch_code}</p>
                  <p className="text-lg font-bold text-green-600">{comparison.best_performers.sgr.value}%</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Best Survival</p>
                  <p className="font-semibold text-sm">{comparison.best_performers.survival_rate.batch_code}</p>
                  <p className="text-lg font-bold text-green-600">{comparison.best_performers.survival_rate.value}%</p>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('harvest.batch')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('harvest.pond')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('feeding.stage')}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      FCR
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SGR
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('analytics.survivalRate')}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('analytics.cycleDuration')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comparison.comparisons.map((batch) => (
                    <tr key={batch.batch_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {batch.batch_code}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {batch.pond_code}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {t(`stages.${batch.stage}`)}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm text-center ${getBestWorstClass(batch.batch_id, 'fcr', true)} ${getBestWorstClass(batch.batch_id, 'fcr', false)}`}>
                        {batch.fcr || 'N/A'}
                      </td>
                      <td className={`px-4 py-3 text-sm text-center ${getBestWorstClass(batch.batch_id, 'sgr', true)} ${getBestWorstClass(batch.batch_id, 'sgr', false)}`}>
                        {batch.sgr ? `${batch.sgr}%` : 'N/A'}
                      </td>
                      <td className={`px-4 py-3 text-sm text-center ${getBestWorstClass(batch.batch_id, 'survival_rate', true)} ${getBestWorstClass(batch.batch_id, 'survival_rate', false)}`}>
                        {batch.survival_rate}%
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-600">
                        {batch.cycle_duration_days ? `${batch.cycle_duration_days}d` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}

export default BatchComparison
