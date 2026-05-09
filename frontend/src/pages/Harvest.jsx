import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { 
  Package, 
  TrendingUp, 
  Calendar, 
  Weight, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Filter,
  Download,
  Eye
} from 'lucide-react'
import { harvestsAPI } from '../services/api'
import FCRIndicator from '../components/Dashboard/FCRIndicator'
import HarvestRecordModal from '../components/Harvest/HarvestRecordModal'

export default function Harvest() {
  const { t } = useTranslation()
  
  // State management
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [harvestReadyBatches, setHarvestReadyBatches] = useState([])
  const [harvestedBatches, setHarvestedBatches] = useState([])
  const [selectedTab, setSelectedTab] = useState('ready') // ready, completed
  
  // Modal state
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState(null)
  
  // Filters
  const [filters, setFilters] = useState({
    minWeight: 350,
    maxWeight: 600,
    sortBy: 'weight' // weight, age, fcr
  })

  useEffect(() => {
    fetchHarvestData()
  }, [])

  const fetchHarvestData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch harvest-ready batches from new API
      const ready = await harvestsAPI.getReady()
      
      // Fetch completed harvests
      const completed = await harvestsAPI.getAll({ status_filter: 'completed' })
      
      setHarvestReadyBatches(ready)
      setHarvestedBatches(completed)
    } catch (err) {
      console.error('Error fetching harvest data:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to load harvest data')
    } finally {
      setLoading(false)
    }
  }

  // Handle harvest record
  const handleRecordHarvest = (batch) => {
    setSelectedBatch(batch)
    setShowRecordModal(true)
  }

  // Handle harvest success
  const handleHarvestSuccess = (result) => {
    console.log('Harvest recorded successfully:', result)
    // Refresh data
    fetchHarvestData()
  }

  // Calculate harvest statistics
  const calculateStats = () => {
    const ready = harvestReadyBatches
    
    return {
      readyBatches: ready.length,
      totalFish: ready.reduce((sum, b) => sum + b.current_count, 0),
      totalBiomass: ready.reduce((sum, b) => sum + (b.biomass || 0), 0) / 1000, // kg
      avgWeight: ready.length > 0 
        ? ready.reduce((sum, b) => sum + b.avg_weight, 0) / ready.length 
        : 0,
      avgFCR: ready.length > 0
        ? ready.reduce((sum, b) => sum + (b.fcr || 0), 0) / ready.length
        : 0
    }
  }

  // Sort batches
  const sortBatches = (batches) => {
    const sorted = [...batches]
    
    switch (filters.sortBy) {
      case 'weight':
        return sorted.sort((a, b) => b.avg_weight - a.avg_weight)
      case 'age':
        return sorted.sort((a, b) => 
          new Date(a.stocking_date) - new Date(b.stocking_date)
        )
      case 'fcr':
        return sorted.sort((a, b) => (a.fcr || 999) - (b.fcr || 999))
      default:
        return sorted
    }
  }

  // Calculate days since stocking
  const getDaysOld = (stockingDate) => {
    const days = Math.floor(
      (new Date() - new Date(stockingDate)) / (1000 * 60 * 60 * 24)
    )
    return days
  }

  // Get harvest readiness status - using complete Tailwind classes to prevent purging
  const getHarvestStatus = (avgWeight) => {
    if (avgWeight >= 400 && avgWeight <= 600) {
      return { 
        status: 'optimal', 
        label: t('harvest.optimal'),
        badgeClass: 'bg-green-100 text-green-800',
        icon: CheckCircle
      }
    } else if (avgWeight >= 350 && avgWeight < 400) {
      return { 
        status: 'ready', 
        label: t('harvest.ready'),
        badgeClass: 'bg-blue-100 text-blue-800',
        icon: CheckCircle
      }
    } else {
      return { 
        status: 'not_ready', 
        label: t('harvest.notReady'),
        badgeClass: 'bg-gray-100 text-gray-800',
        icon: AlertCircle
      }
    }
  }

  const stats = calculateStats()
  const displayBatches = selectedTab === 'ready' 
    ? sortBatches(harvestReadyBatches)
    : sortBatches(harvestedBatches)

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('harvest.title')}</h2>
          <p className="text-gray-600 mt-1">{t('harvest.subtitle')}</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('harvest.title')}</h2>
          <p className="text-gray-600 mt-1">{t('harvest.subtitle')}</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold mb-2">{t('harvest.errorLoading')}</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={fetchHarvestData} className="btn btn-primary">
              {t('common.refresh')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('harvest.title')}</h2>
          <p className="text-gray-600 mt-1">{t('harvest.subtitle')}</p>
        </div>
        
        <button className="btn btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" />
          <span>{t('harvest.exportReport')}</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('harvest.readyBatches')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.readyBatches}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('harvest.totalFish')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalFish.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('harvest.totalBiomass')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Math.round(stats.totalBiomass).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{t('common.kg')}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Weight className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('harvest.avgWeight')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Math.round(stats.avgWeight)}
              </p>
              <p className="text-xs text-gray-500">{t('common.g')}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('harvest.avgFCR')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.avgFCR > 0 ? stats.avgFCR.toFixed(2) : 'N/A'}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setSelectedTab('ready')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                selectedTab === 'ready'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('harvest.readyForHarvest')} ({harvestReadyBatches.length})
            </button>
            <button
              onClick={() => setSelectedTab('completed')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                selectedTab === 'completed'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('harvest.completed')} ({harvestedBatches.length})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">{t('harvest.sortBy')}:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="input input-sm"
              >
                <option value="weight">{t('harvest.byWeight')}</option>
                <option value="age">{t('harvest.byAge')}</option>
                <option value="fcr">{t('harvest.byFCR')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Batch List */}
        <div className="p-4">
          {displayBatches.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedTab === 'ready' ? t('harvest.noBatchesReady') : t('harvest.noCompletedHarvests')}
              </h3>
              <p className="text-gray-600">
                {selectedTab === 'ready' 
                  ? t('harvest.noBatchesReadyDesc')
                  : t('harvest.noCompletedHarvestsDesc')
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {displayBatches.map((batch) => {
                const harvestStatus = getHarvestStatus(batch.avg_weight)
                const StatusIcon = harvestStatus.icon
                const daysOld = getDaysOld(batch.stocking_date)
                
                return (
                  <div
                    key={batch.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {batch.batch_code}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {t('harvest.pond')}: {batch.pond_id}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${harvestStatus.badgeClass}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span>{harvestStatus.label}</span>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-600">{t('harvest.fishCount')}</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {batch.current_count.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">{t('harvest.avgWeight')}</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {Math.round(batch.avg_weight)} {t('common.g')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">{t('harvest.biomass')}</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {Math.round((batch.biomass || 0) / 1000)} {t('common.kg')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">{t('harvest.age')}</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {daysOld} {t('common.days')}
                        </p>
                      </div>
                    </div>

                    {/* FCR Indicator */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">{t('kpi.fcr')}:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {batch.fcr ? batch.fcr.toFixed(2) : 'N/A'}
                        </span>
                        {batch.fcr && <FCRIndicator fcr={batch.fcr} size="sm" />}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button className="btn btn-secondary flex-1 flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>{t('harvest.viewDetails')}</span>
                      </button>
                      {selectedTab === 'ready' && (
                        <button 
                          onClick={() => handleRecordHarvest(batch)}
                          className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                          <Package className="w-4 h-4" />
                          <span>{t('harvest.recordHarvest')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Harvest Record Modal */}
      {showRecordModal && selectedBatch && (
        <HarvestRecordModal
          batch={selectedBatch}
          onClose={() => {
            setShowRecordModal(false)
            setSelectedBatch(null)
          }}
          onSuccess={handleHarvestSuccess}
        />
      )}
    </div>
  )
}
