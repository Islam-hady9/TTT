import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import StatCard from '../components/Dashboard/StatCard'
import UnitCard from '../components/Dashboard/UnitCard'
import WaterQualityCard from '../components/Dashboard/WaterQualityCard'
import InventoryCard from '../components/Dashboard/InventoryCard'
import { TrendingUp, TrendingDown, Fish, Scale, Activity, AlertCircle, Filter, Calendar, X } from 'lucide-react'
import { batchesAPI, pondsAPI, alertsAPI } from '../services/api'

export default function Dashboard() {
  const { t } = useTranslation()
  
  // State management
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [batches, setBatches] = useState([])
  const [allBatches, setAllBatches] = useState([]) // Store all batches for filtering
  const [ponds, setPonds] = useState([])
  const [alerts, setAlerts] = useState([])
  
  // Filter state
  const [filters, setFilters] = useState({
    dateRange: 'all', // all, today, week, month, custom
    unitType: 'all', // all, hatchery, growout, fattening
    stage: 'all', // all, eggs, fry, fingerlings, juveniles, young_fish, fattening
    fcrRange: 'all', // all, excellent, good, acceptable, poor
    startDate: '',
    endDate: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData()
  }, [])
  
  // Apply filters when they change
  useEffect(() => {
    applyFilters()
  }, [filters, allBatches])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch all data in parallel
      const [batchesData, pondsData, alertsData] = await Promise.all([
        batchesAPI.getActive(),
        pondsAPI.getAll(),
        alertsAPI.getUnread()
      ])
      
      setAllBatches(batchesData) // Store all batches
      setBatches(batchesData) // Initially show all
      setPonds(pondsData)
      setAlerts(alertsData)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }
  
  // Apply filters to batches
  const applyFilters = () => {
    let filtered = [...allBatches]
    
    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date()
      let startDate = new Date()
      
      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'custom':
          if (filters.startDate) {
            startDate = new Date(filters.startDate)
          }
          break
      }
      
      filtered = filtered.filter(batch => {
        const stockingDate = new Date(batch.stocking_date)
        if (filters.dateRange === 'custom' && filters.endDate) {
          const endDate = new Date(filters.endDate)
          return stockingDate >= startDate && stockingDate <= endDate
        }
        return stockingDate >= startDate
      })
    }
    
    // Unit type filter (filter values use backend keys: nursery/pregrow/growout)
    if (filters.unitType !== 'all') {
      filtered = filtered.filter(batch => {
        const pond = ponds.find(p => p.id === batch.pond_id)
        return pond?.unit_type === filters.unitType
      })
    }
    
    // Stage filter
    if (filters.stage !== 'all') {
      filtered = filtered.filter(batch => batch.stage === filters.stage)
    }
    
    // FCR range filter
    if (filters.fcrRange !== 'all') {
      filtered = filtered.filter(batch => {
        if (!batch.fcr || batch.fcr === 0) return false
        
        switch (filters.fcrRange) {
          case 'excellent':
            return batch.fcr < 1.2
          case 'good':
            return batch.fcr >= 1.2 && batch.fcr <= 1.5
          case 'acceptable':
            return batch.fcr > 1.5 && batch.fcr <= 1.8
          case 'poor':
            return batch.fcr > 1.8
          default:
            return true
        }
      })
    }
    
    setBatches(filtered)
  }
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      dateRange: 'all',
      unitType: 'all',
      stage: 'all',
      fcrRange: 'all',
      startDate: '',
      endDate: ''
    })
  }
  
  // Check if any filters are active
  const hasActiveFilters = () => {
    return filters.dateRange !== 'all' || 
           filters.unitType !== 'all' || 
           filters.stage !== 'all' || 
           filters.fcrRange !== 'all'
  }

  // Calculate dashboard metrics from real data
  const calculateStats = () => {
    if (batches.length === 0) {
      return {
        totalBiomass: 0,
        avgWeight: 0,
        avgFCR: 0,
        avgSGR: 0,
        totalMortality: 0,
        activeBatches: 0,
        harvestReady: 0
      }
    }

    // Total biomass (sum of all batch biomasses, convert to kg)
    const totalBiomass = batches.reduce((sum, batch) => sum + (batch.biomass || 0), 0) / 1000

    // Average weight across all batches
    const avgWeight = batches.reduce((sum, batch) => sum + (batch.avg_weight || 0), 0) / batches.length

    // Average FCR (only batches with FCR data)
    const batchesWithFCR = batches.filter(b => b.fcr != null && b.fcr > 0)
    const avgFCR = batchesWithFCR.length > 0
      ? batchesWithFCR.reduce((sum, batch) => sum + batch.fcr, 0) / batchesWithFCR.length
      : 0

    // Average SGR (only batches with SGR data)
    const batchesWithSGR = batches.filter(b => b.sgr != null && b.sgr > 0)
    const avgSGR = batchesWithSGR.length > 0
      ? batchesWithSGR.reduce((sum, batch) => sum + batch.sgr, 0) / batchesWithSGR.length
      : 0

    // Average mortality rate
    const totalMortality = batches.reduce((sum, batch) => sum + (batch.mortality_rate || 0), 0) / batches.length

    // Active batches count
    const activeBatches = batches.length

    // Harvest ready: batches in 'fattening' stage with weight 350-600g
    const harvestReady = batches.filter(
      b => b.stage === 'fattening' && b.avg_weight >= 350 && b.avg_weight <= 600
    ).length

    return {
      totalBiomass,
      avgWeight,
      avgFCR,
      avgSGR,
      totalMortality,
      activeBatches,
      harvestReady
    }
  }

  // Map backend unit types to frontend display types
  const unitTypeMap = {
    nursery: 'hatchery',
    pregrow: 'growout',
    growout: 'fattening'
  }

  // Calculate units data from real ponds and batches
  const calculateUnitsData = () => {
    const units = {
      nursery: { ponds: [], batches: [] },
      pregrow: { ponds: [], batches: [] },
      growout: { ponds: [], batches: [] }
    }

    // Group ponds by unit type
    ponds.forEach(pond => {
      if (pond.unit_type && units[pond.unit_type]) {
        units[pond.unit_type].ponds.push(pond)
      }
    })

    // Group batches by pond's unit type
    batches.forEach(batch => {
      const pond = ponds.find(p => p.id === batch.pond_id)
      if (pond && pond.unit_type && units[pond.unit_type]) {
        units[pond.unit_type].batches.push(batch)
      }
    })

    // Display name mapping: backend key -> display key for i18n and routes
    const displayMap = {
      nursery: { displayType: 'hatchery', i18nKey: 'hatchery' },
      pregrow: { displayType: 'growout', i18nKey: 'growout' },
      growout: { displayType: 'fattening', i18nKey: 'fattening' }
    }

    // Calculate metrics for each unit
    return Object.entries(units).map(([backendType, data]) => {
      const unitBatches = data.batches
      const totalFish = unitBatches.reduce((sum, b) => sum + (b.current_count || 0), 0)
      const avgWeight = unitBatches.length > 0
        ? unitBatches.reduce((sum, b) => sum + (b.avg_weight || 0), 0) / unitBatches.length
        : 0
      const biomass = unitBatches.reduce((sum, b) => sum + (b.biomass || 0), 0) / 1000 // convert to kg
      
      const batchesWithFCR = unitBatches.filter(b => b.fcr != null && b.fcr > 0)
      const fcr = batchesWithFCR.length > 0
        ? batchesWithFCR.reduce((sum, b) => sum + b.fcr, 0) / batchesWithFCR.length
        : 0
      
      const mortality = unitBatches.length > 0
        ? unitBatches.reduce((sum, b) => sum + (b.mortality_rate || 0), 0) / unitBatches.length
        : 0

      const { displayType, i18nKey } = displayMap[backendType]

      return {
        name: t(`units.${i18nKey}`),
        type: displayType,
        ponds: data.ponds.length,
        activeBatches: unitBatches.length,
        totalFish: Math.round(totalFish),
        avgWeight: Math.round(avgWeight),
        biomass: Math.round(biomass),
        fcr: fcr > 0 ? parseFloat(fcr.toFixed(2)) : 0,
        mortality: parseFloat(mortality.toFixed(1))
      }
    })
  }

  // Helper function to get FCR status
  const getFCRStatus = (fcr) => {
    if (!fcr || fcr === 0) return { status: 'unknown', color: 'gray', label: 'N/A' }
    if (fcr < 1.2) return { status: 'excellent', color: 'green', label: 'ممتاز' }
    if (fcr <= 1.5) return { status: 'good', color: 'blue', label: 'جيد' }
    if (fcr <= 1.8) return { status: 'acceptable', color: 'yellow', label: 'مقبول' }
    return { status: 'poor', color: 'red', label: 'ضعيف' }
  }

  const stats = calculateStats()
  const fcrStatus = getFCRStatus(stats.avgFCR)
  const unitsData = calculateUnitsData()

  // Mock data for water quality and inventory (these will be updated in future tasks)
  const statsCards = [
    {
      label: t('kpi.totalBiomass'),
      value: loading ? '...' : stats.totalBiomass.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      unit: t('common.kg'),
      icon: Scale
    },
    {
      label: t('kpi.avgWeight'),
      value: loading ? '...' : Math.round(stats.avgWeight).toLocaleString(),
      unit: t('common.g'),
      icon: Fish
    },
    {
      label: t('kpi.fcr'),
      value: loading ? '...' : stats.avgFCR > 0 ? stats.avgFCR.toFixed(2) : 'N/A',
      unit: '',
      icon: Activity,
      status: fcrStatus.status,
      statusLabel: fcrStatus.label,
      tooltip: stats.avgFCR > 0 ? (
        <div className="space-y-1">
          <div className="font-semibold mb-2">معامل التحويل الغذائي (FCR)</div>
          <div className="text-xs space-y-1">
            <div>• ممتاز: {'<'} 1.2</div>
            <div>• جيد: 1.2 - 1.5</div>
            <div>• مقبول: 1.5 - 1.8</div>
            <div>• ضعيف: {'>'} 1.8</div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-700 text-xs">
            كل ما الرقم يقل → الكفاءة أعلى
          </div>
        </div>
      ) : null
    },
    {
      label: t('kpi.mortality'),
      value: loading ? '...' : stats.totalMortality.toFixed(1),
      unit: '%',
      icon: TrendingDown
    },
    {
      label: t('dashboard.activeBatches'),
      value: loading ? '...' : stats.activeBatches.toString(),
      unit: t('units.batches'),
      icon: TrendingUp
    },
    {
      label: t('kpi.harvestReady'),
      value: loading ? '...' : stats.harvestReady.toString(),
      unit: t('units.batches'),
      icon: Fish
    }
  ]

  const waterQuality = [
    { parameter: 'do', value: 7.2, unit: 'mg/L', status: 'optimal', min: 6.0, max: 8.0 },
    { parameter: 'ph', value: 7.8, unit: '', status: 'optimal', min: 7.0, max: 8.3 },
    { parameter: 'temp', value: 28, unit: '°C', status: 'optimal', min: 25, max: 30 },
    { parameter: 'tan', value: 0.3, unit: 'mg/L', status: 'optimal', min: 0, max: 0.5 },
    { parameter: 'alkalinity', value: 135, unit: 'mg/L', status: 'optimal', min: 120, max: 150 },
    { parameter: 'floc', value: 32, unit: '', status: 'optimal', min: 30, max: 35 }
  ]

  const inventory = [
    { name: t('inventory.feed'), current: 2500, min: 1000, unit: 'kg', status: 'inStock' },
    { name: t('inventory.medicines'), current: 45, min: 50, unit: 'kg', status: 'lowStock' },
    { name: t('inventory.probiotics'), current: 120, min: 80, unit: 'kg', status: 'inStock' },
    { name: t('inventory.molasses'), current: 350, min: 500, unit: 'L', status: 'lowStock' },
    { name: t('inventory.disinfectants'), current: 85, min: 60, unit: 'L', status: 'inStock' }
  ]

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h2>
          <p className="text-gray-600 mt-1">{t('dashboard.overview')}</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    // Check if it's an authentication error
    const isAuthError = error.includes('authenticated') || error.includes('401') || error.includes('Unauthorized')
    
    if (isAuthError) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return null
    }
    
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h2>
          <p className="text-gray-600 mt-1">{t('dashboard.overview')}</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold mb-2">Error loading dashboard</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="btn btn-primary"
            >
              Retry
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
          <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h2>
          <p className="text-gray-600 mt-1">{t('dashboard.overview')}</p>
        </div>
        
        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn ${hasActiveFilters() ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
        >
          <Filter className="w-4 h-4" />
          <span>{t('common.filter')}</span>
          {hasActiveFilters() && (
            <span className="bg-white text-primary-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {Object.values(filters).filter(v => v !== 'all' && v !== '').length}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                {t('filters.dateRange')}
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="input w-full"
              >
                <option value="all">{t('filters.allTime')}</option>
                <option value="today">{t('filters.today')}</option>
                <option value="week">{t('filters.lastWeek')}</option>
                <option value="month">{t('filters.lastMonth')}</option>
                <option value="custom">{t('filters.custom')}</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('filters.startDate')}
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('filters.endDate')}
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </>
            )}

            {/* Unit Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('filters.unitType')}
              </label>
              <select
                value={filters.unitType}
                onChange={(e) => setFilters({ ...filters, unitType: e.target.value })}
                className="input w-full"
              >
                <option value="all">{t('filters.allUnits')}</option>
                <option value="nursery">{t('units.hatchery')}</option>
                <option value="pregrow">{t('units.growout')}</option>
                <option value="growout">{t('units.fattening')}</option>
              </select>
            </div>

            {/* Stage Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('filters.stage')}
              </label>
              <select
                value={filters.stage}
                onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
                className="input w-full"
              >
                <option value="all">{t('filters.allStages')}</option>
                <option value="fry">{t('stages.fry')}</option>
                <option value="nursery">{t('stages.nursery')}</option>
                <option value="juveniles">{t('stages.juveniles')}</option>
                <option value="fattening">{t('stages.fattening')}</option>
                <option value="harvest">{t('stages.harvest')}</option>
              </select>
            </div>

            {/* FCR Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('filters.fcrRange')}
              </label>
              <select
                value={filters.fcrRange}
                onChange={(e) => setFilters({ ...filters, fcrRange: e.target.value })}
                className="input w-full"
              >
                <option value="all">{t('filters.allFCR')}</option>
                <option value="excellent">🟢 {t('kpi.fcrExcellent')} ({'<'} 1.2)</option>
                <option value="good">🔵 {t('kpi.fcrGood')} (1.2 - 1.5)</option>
                <option value="acceptable">🟡 {t('kpi.fcrAcceptable')} (1.5 - 1.8)</option>
                <option value="poor">🔴 {t('kpi.fcrPoor')} ({'>'} 1.8)</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {t('filters.showing')} <strong>{batches.length}</strong> {t('filters.of')} <strong>{allBatches.length}</strong> {t('filters.batches')}
            </div>
            {hasActiveFilters() && (
              <button
                onClick={resetFilters}
                className="btn btn-secondary flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                {t('filters.reset')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters() && !showFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">{t('filters.activeFilters')}:</span>
          {filters.dateRange !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
              <Calendar className="w-3 h-3" />
              {t(`filters.${filters.dateRange}`)}
              <button
                onClick={() => setFilters({ ...filters, dateRange: 'all' })}
                className="hover:bg-primary-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.unitType !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {t(`units.${filters.unitType}`)}
              <button
                onClick={() => setFilters({ ...filters, unitType: 'all' })}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.stage !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {t(`stages.${filters.stage}`)}
              <button
                onClick={() => setFilters({ ...filters, stage: 'all' })}
                className="hover:bg-green-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.fcrRange !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              FCR: {t(`kpi.fcr${filters.fcrRange.charAt(0).toUpperCase() + filters.fcrRange.slice(1)}`)}
              <button
                onClick={() => setFilters({ ...filters, fcrRange: 'all' })}
                className="hover:bg-yellow-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Production Units */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.units')}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {unitsData.map((unit, index) => (
            <UnitCard key={index} {...unit} />
          ))}
        </div>
      </div>

      {/* Water Quality & Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WaterQualityCard data={waterQuality} />
        <InventoryCard data={inventory} />
      </div>
    </div>
  )
}
