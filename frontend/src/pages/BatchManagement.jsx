import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { 
  Fish, 
  Plus, 
  Filter, 
  Search, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Scale,
  AlertCircle,
  Eye,
  ArrowRightLeft,
  Package,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { batchesAPI, pondsAPI } from '../services/api'
import BatchForm from '../components/Forms/BatchForm'
import TransferForm from '../components/Forms/TransferForm'
import FCRIndicator from '../components/Dashboard/FCRIndicator'

export default function BatchManagement() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'

  // State management
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [batches, setBatches] = useState([])
  const [ponds, setPonds] = useState([])
  const [showBatchForm, setShowBatchForm] = useState(false)
  const [selectedPond, setSelectedPond] = useState(null)
  const [showTransferForm, setShowTransferForm] = useState(false)
  const [transferBatch, setTransferBatch] = useState(null)

  // Filter state
  const [filters, setFilters] = useState({
    stage: 'all',
    status: 'active',
    pond: 'all',
    search: ''
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [batchesData, pondsData] = await Promise.all([
        batchesAPI.getAll(),
        pondsAPI.getAll()
      ])
      
      setBatches(batchesData)
      setPonds(pondsData)
    } catch (err) {
      console.error('Error fetching batch data:', err)
      setError(err.message || 'Failed to load batch data')
    } finally {
      setLoading(false)
    }
  }

  // Filter batches
  const filteredBatches = batches.filter(batch => {
    // Stage filter
    if (filters.stage !== 'all' && batch.stage !== filters.stage) {
      return false
    }

    // Status filter
    if (filters.status !== 'all' && batch.status !== filters.status) {
      return false
    }

    // Pond filter
    if (filters.pond !== 'all' && batch.pond_id !== parseInt(filters.pond)) {
      return false
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const batchCode = batch.batch_code?.toLowerCase() || ''
      const pond = ponds.find(p => p.id === batch.pond_id)
      const pondName = pond?.name?.toLowerCase() || ''
      
      return batchCode.includes(searchLower) || pondName.includes(searchLower)
    }

    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedBatches = filteredBatches.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Get pond name
  const getPondName = (pondId) => {
    const pond = ponds.find(p => p.id === pondId)
    return pond?.pond_code || `Pond ${pondId}`
  }

  // Get unit type name
  const getUnitTypeName = (pondId) => {
    const pond = ponds.find(p => p.id === pondId)
    if (!pond) return ''
    
    const unitNames = {
      nursery: t('units.hatchery'),
      pregrow: t('units.growout'),
      growout: t('units.fattening')
    }
    return unitNames[pond.unit_type] || pond.unit_type
  }

  // Get stage color
  const getStageColor = (stage) => {
    const colors = {
      fry: 'bg-blue-100 text-blue-700',
      nursery: 'bg-cyan-100 text-cyan-700',
      juveniles: 'bg-green-100 text-green-700',
      fattening: 'bg-orange-100 text-orange-700',
      harvest: 'bg-purple-100 text-purple-700'
    }
    return colors[stage] || 'bg-gray-100 text-gray-700'
  }

  // Get status badge
  const getStatusBadge = (batch) => {
    const pond = ponds.find(p => p.id === batch.pond_id)
    if (!pond) return { color: 'badge-secondary', text: t('status.active') }

    // Check if ready for transfer/harvest based on weight and unit type
    if (pond.unit_type === 'nursery' && batch.avg_weight >= 40) {
      return { color: 'badge-success', text: 'جاهز للنقل → التربية' }
    }
    if (pond.unit_type === 'pregrow' && batch.avg_weight >= 200) {
      return { color: 'badge-success', text: 'جاهز للنقل → التسمين' }
    }
    if (pond.unit_type === 'growout' && batch.avg_weight >= 350) {
      return { color: 'badge-success', text: 'جاهز للحصاد' }
    }

    // Check batch status
    if (batch.status === 'transferred') {
      return { color: 'badge-warning', text: t('status.transferred') }
    }
    if (batch.status === 'harvested') {
      return { color: 'badge-info', text: t('status.harvested') }
    }

    return { color: 'badge-info', text: t('status.active') }
  }

  // Calculate age in days
  const calculateAge = (stockingDate) => {
    if (!stockingDate) return 0
    const stocking = new Date(stockingDate)
    const now = new Date()
    const diffTime = Math.abs(now - stocking)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get FCR status color
  const getFCRColor = (fcr) => {
    if (!fcr || fcr === 0) return 'text-gray-400'
    if (fcr < 1.4) return 'text-green-600'
    if (fcr < 1.8) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Get SGR status color
  const getSGRColor = (sgr) => {
    if (!sgr || sgr === 0) return 'text-gray-400'
    if (sgr > 10) return 'text-green-600'
    if (sgr > 5) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Get mortality status color
  const getMortalityColor = (mortality) => {
    if (mortality < 5) return 'text-green-600'
    if (mortality < 10) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Handle batch creation
  const handleCreateBatch = async (batchData) => {
    try {
      await batchesAPI.create({
        batch_code: batchData.batchCode,
        pond_id: batchData.pondId,
        stocking_date: batchData.stockingDate,
        initial_count: parseInt(batchData.fishCount),
        avg_weight: parseFloat(batchData.avgWeight),
        stage: batchData.stage,
        source: batchData.source,
        supplier: batchData.supplier || null,
        created_by: batchData.createdBy
      })
      
      setShowBatchForm(false)
      setSelectedPond(null)
      fetchData()
    } catch (err) {
      console.error('Error creating batch:', err)
      alert(err.response?.data?.detail || 'Failed to create batch')
    }
  }

  // Handle view details
  const handleViewDetails = (batch) => {
    const pond = ponds.find(p => p.id === batch.pond_id)
    if (pond) {
      navigate(`/pond/${pond.unit_type}/${pond.id}`)
    }
  }

  // Handle transfer
  const handleTransfer = (batch) => {
    const pond = ponds.find(p => p.id === batch.pond_id)
    setTransferBatch({ batch, pond })
    setShowTransferForm(true)
  }

  // Handle harvest - navigate to harvest page
  const handleHarvest = (batch) => {
    navigate('/harvest')
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('batchManagement.title')}
          </h2>
          <p className="text-gray-600 mt-1">{t('batchManagement.subtitle')}</p>
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

  // Error state
  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('batchManagement.title')}
          </h2>
          <p className="text-gray-600 mt-1">{t('batchManagement.subtitle')}</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold mb-2">
              {t('batchManagement.errorLoading')}
            </p>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={fetchData} className="btn btn-primary">
              {t('common.refresh')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('batchManagement.title')}
          </h2>
          <p className="text-gray-600 mt-1">{t('batchManagement.subtitle')}</p>
        </div>
        <button
          onClick={() => {
            // For now, we'll use the first available pond
            const firstPond = ponds[0]
            if (firstPond) {
              setSelectedPond(firstPond)
              setShowBatchForm(true)
            } else {
              alert('No ponds available. Please create a pond first.')
            }
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('batchManagement.createBatch')}
        </button>
      </div>

      {/* Summary Statistics */}
      {batches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600">إجمالي الدورات</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {batches.filter(b => b.status === 'active').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">دورة نشطة</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">إجمالي الأسماك</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {batches
                .filter(b => b.status === 'active')
                .reduce((sum, b) => sum + (b.current_count || 0), 0)
                .toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">سمكة</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">إجمالي الكتلة الحية</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {(batches
                .filter(b => b.status === 'active')
                .reduce((sum, b) => sum + (b.biomass || 0), 0) / 1000
              ).toFixed(1)} {t('common.kg')}
            </p>
            <p className="text-xs text-gray-500 mt-1">كيلوجرام</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">متوسط FCR</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {(() => {
                const batchesWithFCR = batches.filter(b => b.status === 'active' && b.fcr && b.fcr > 0)
                if (batchesWithFCR.length === 0) return 'N/A'
                const avgFCR = batchesWithFCR.reduce((sum, b) => sum + b.fcr, 0) / batchesWithFCR.length
                return avgFCR.toFixed(2)
              })()}
            </p>
            <p className="text-xs text-gray-500 mt-1">معامل التحويل</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              placeholder={t('batchManagement.searchPlaceholder')}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className={`input ${isRTL ? 'pr-10' : 'pl-10'}`}
            />
          </div>

          {/* Stage Filter */}
          <div className="relative">
            <Filter className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
            <select
              value={filters.stage}
              onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
              className={`input ${isRTL ? 'pr-10' : 'pl-10'}`}
            >
              <option value="all">{t('batchManagement.allStages')}</option>
              <option value="fry">{t('stages.fry')}</option>
              <option value="nursery">{t('stages.nursery')}</option>
              <option value="juveniles">{t('stages.juveniles')}</option>
              <option value="fattening">{t('stages.fattening')}</option>
              <option value="harvest">{t('stages.harvest')}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input"
            >
              <option value="all">{t('batchManagement.allStatuses')}</option>
              <option value="active">{t('status.active')}</option>
              <option value="transferred">{t('status.transferred')}</option>
              <option value="harvested">{t('status.harvested')}</option>
            </select>
          </div>

          {/* Pond Filter */}
          <div>
            <select
              value={filters.pond}
              onChange={(e) => setFilters({ ...filters, pond: e.target.value })}
              className="input"
            >
              <option value="all">{t('batchManagement.allPonds')}</option>
              {ponds.map(pond => (
                <option key={pond.id} value={pond.id}>
                  {pond.pond_code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>
          {t('batchManagement.showing')} {startIndex + 1}-{Math.min(endIndex, filteredBatches.length)} {t('batchManagement.of')} {filteredBatches.length} {t('batchManagement.batches')}
        </p>
      </div>

      {/* Batch Cards Grid */}
      {paginatedBatches.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium mb-2">
            {t('batchManagement.noBatches')}
          </p>
          <p className="text-gray-500 mb-6">
            {t('batchManagement.noBatchesDesc')}
          </p>
          <button
            onClick={() => {
              const firstPond = ponds[0]
              if (firstPond) {
                setSelectedPond(firstPond)
                setShowBatchForm(true)
              }
            }}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5 inline me-2" />
            {t('batchManagement.createFirstBatch')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedBatches.map(batch => {
            const statusBadge = getStatusBadge(batch)
            const age = calculateAge(batch.stocking_date)
            
            return (
              <div
                key={batch.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {batch.batch_code}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {getPondName(batch.pond_id)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getUnitTypeName(batch.pond_id)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(batch.stage)}`}>
                        {t(`stages.${batch.stage}`)}
                      </span>
                      <span className={`badge ${statusBadge.color} text-xs`}>
                        {statusBadge.text}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Fish className="w-3 h-3" />
                    <span>{batch.current_count?.toLocaleString()} {t('batchManagement.fish')}</span>
                    <span className="mx-1">•</span>
                    <span>{age} {t('common.days')}</span>
                  </div>
                </div>

                {/* Card Body - Metrics */}
                <div className="p-4 space-y-2">
                  {/* Average Weight */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Scale className="w-4 h-4" />
                      <span>{t('kpi.avgWeight')}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {batch.avg_weight?.toFixed(1)} {t('common.g')}
                    </span>
                  </div>

                  {/* Biomass */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Activity className="w-4 h-4" />
                      <span>{t('kpi.totalBiomass')}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {batch.biomass ? (batch.biomass / 1000).toFixed(1) : '0'} {t('common.kg')}
                    </span>
                  </div>

                  {/* FCR */}
                  {batch.fcr && batch.fcr > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>{t('kpi.fcr')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${getFCRColor(batch.fcr)}`}>
                          {batch.fcr.toFixed(2)}
                        </span>
                        <FCRIndicator fcr={batch.fcr} size="sm" />
                      </div>
                    </div>
                  )}

                  {/* Survival Rate */}
                  {batch.survival_rate && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Activity className="w-4 h-4" />
                        <span>معدل البقاء</span>
                      </div>
                      <span className={`font-semibold ${batch.survival_rate >= 85 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {batch.survival_rate.toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {/* Mortality Rate */}
                  {batch.mortality_rate > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <TrendingDown className="w-4 h-4" />
                        <span>{t('kpi.mortality')}</span>
                      </div>
                      <span className={`font-semibold ${getMortalityColor(batch.mortality_rate)}`}>
                        {batch.mortality_rate.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer - Actions */}
                <div className="p-4 border-t border-gray-200 flex items-center gap-2">
                  <button
                    onClick={() => handleViewDetails(batch)}
                    className="flex-1 btn btn-secondary text-sm py-2"
                    title={t('batchManagement.viewDetails')}
                  >
                    <Eye className="w-4 h-4 inline me-1" />
                    {t('common.view')}
                  </button>
                  {batch.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleTransfer(batch)}
                        className="btn btn-secondary text-sm py-2 px-3"
                        title={t('batchManagement.transfer')}
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                      {batch.avg_weight >= 350 && (
                        <button
                          onClick={() => handleHarvest(batch)}
                          className="btn btn-success text-sm py-2 px-3"
                          title={t('batchManagement.harvest')}
                        >
                          <Package className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* Batch Form Modal */}
      {showBatchForm && selectedPond && (
        <BatchForm
          pondId={selectedPond.id}
          unitType={selectedPond.unit_type}
          onClose={() => {
            setShowBatchForm(false)
            setSelectedPond(null)
          }}
          onSubmit={handleCreateBatch}
        />
      )}
      {showTransferForm && transferBatch && (
        <TransferForm
          batch={transferBatch.batch}
          fromPond={transferBatch.pond}
          onClose={() => {
            setShowTransferForm(false)
            setTransferBatch(null)
          }}
          onSubmit={(data) => {
            console.log('Transfer submitted:', data)
            setShowTransferForm(false)
            setTransferBatch(null)
            fetchData()
          }}
        />
      )}
    </div>
  )
}
