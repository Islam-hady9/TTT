import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Fish, TrendingUp, AlertCircle, Loader } from 'lucide-react'
import api from '../../services/api'

export default function UnitPondGrid({ unitType, unitTitle, systemType }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [ponds, setPonds] = useState([])
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [unitType])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch ponds for this unit type
      const pondsResponse = await api.get('/ponds/')
      const unitPonds = pondsResponse.data.filter(p => p.unit_type === unitType)
      
      // Fetch all batches
      const batchesResponse = await api.get('/batches/')
      
      // Match batches to ponds
      const pondsWithBatches = unitPonds.map(pond => {
        const batch = batchesResponse.data.find(b => b.pond_id === pond.id && b.status === 'active')
        return {
          ...pond,
          batch
        }
      })
      
      setPonds(pondsWithBatches)
      setBatches(batchesResponse.data)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const activeBatches = ponds.filter(p => p.batch).map(p => p.batch)
    
    const totalFish = activeBatches.reduce((sum, b) => sum + (b.current_count || 0), 0)
    const totalBiomass = activeBatches.reduce((sum, b) => sum + (b.biomass || 0), 0)
    const avgWeight = activeBatches.length > 0
      ? activeBatches.reduce((sum, b) => sum + (b.avg_weight || 0), 0) / activeBatches.length
      : 0
    const avgMortality = activeBatches.length > 0
      ? activeBatches.reduce((sum, b) => sum + (b.mortality_rate || 0), 0) / activeBatches.length
      : 0
    
    return {
      totalFish,
      totalBiomass: totalBiomass / 1000, // Convert to kg
      avgWeight,
      avgMortality,
      activePonds: activeBatches.length
    }
  }

  const getStatusBadge = (batch) => {
    if (!batch) return 'badge-secondary'
    
    // Check if ready for transfer/harvest based on weight
    if (unitType === 'nursery' && batch.avg_weight >= 40) return 'badge-success'
    if (unitType === 'pregrow' && batch.avg_weight >= 200) return 'badge-success'
    if (unitType === 'growout' && batch.avg_weight >= 350) return 'badge-success'
    
    return 'badge-info'
  }

  const getStatusText = (batch) => {
    if (!batch) return t('status.inactive')
    
    if (unitType === 'nursery' && batch.avg_weight >= 40) return 'جاهز للنقل'
    if (unitType === 'pregrow' && batch.avg_weight >= 200) return 'جاهز للنقل'
    if (unitType === 'growout' && batch.avg_weight >= 350) return 'جاهز للحصاد'
    
    return t('status.active')
  }

  const calculateAge = (stockingDate) => {
    if (!stockingDate) return 0
    const stocking = new Date(stockingDate)
    const now = new Date()
    const diffTime = Math.abs(now - stocking)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">خطأ في تحميل البيانات</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={fetchData} className="btn btn-primary">
          إعادة المحاولة
        </button>
      </div>
    )
  }

  const stats = calculateStats()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{unitTitle}</h2>
          <p className="text-gray-600 mt-1">
            {systemType} - {ponds.length} {t('units.ponds')} ({stats.activePonds} {t('units.activeBatches')})
          </p>
        </div>
        <button 
          onClick={() => navigate('/batches')}
          className="btn btn-primary"
        >
          إضافة دورة جديدة
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">{t('units.totalFish')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats.totalFish.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">{t('kpi.avgWeight')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats.avgWeight.toFixed(1)} {t('common.g')}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">{t('kpi.totalBiomass')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats.totalBiomass.toFixed(1)} {t('common.kg')}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">{t('kpi.mortality')}</p>
          <p className={`text-2xl font-bold mt-1 ${stats.avgMortality <= 10 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.avgMortality.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Ponds Grid */}
      {ponds.length === 0 ? (
        <div className="card text-center py-12">
          <Fish className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد أحواض</h3>
          <p className="text-gray-600">لم يتم العثور على أحواض في هذه الوحدة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ponds.map((pond) => (
            <div 
              key={pond.id}
              className={`card ${pond.batch ? 'card-hover cursor-pointer' : 'opacity-75'}`}
              onClick={() => pond.batch && navigate(`/batches`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{pond.pond_code}</h3>
                  {pond.batch && (
                    <p className="text-sm text-gray-600">دورة: {pond.batch.batch_code}</p>
                  )}
                </div>
                <span className={`badge ${getStatusBadge(pond.batch)}`}>
                  {getStatusText(pond.batch)}
                </span>
              </div>

              {pond.batch ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">عدد الأسماك</span>
                    <span className="font-semibold text-gray-900">
                      {pond.batch.current_count?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">متوسط الوزن</span>
                    <span className="font-semibold text-gray-900">
                      {pond.batch.avg_weight?.toFixed(1) || 0} جرام
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">الكتلة الحية</span>
                    <span className="font-semibold text-gray-900">
                      {((pond.batch.biomass || 0) / 1000).toFixed(1)} كجم
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">العمر</span>
                    <span className="font-semibold text-gray-900">
                      {calculateAge(pond.batch.stocking_date)} يوم
                    </span>
                  </div>
                  {pond.batch.fcr && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">FCR</span>
                      <span className={`font-semibold ${pond.batch.fcr <= 1.4 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {pond.batch.fcr.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">المرحلة</span>
                    <span className="font-semibold text-gray-900">
                      {t(`stages.${pond.batch.stage}`)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">لا توجد دورة نشطة</p>
                </div>
              )}

              {pond.batch && getStatusText(pond.batch) !== t('status.active') && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">{getStatusText(pond.batch)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
