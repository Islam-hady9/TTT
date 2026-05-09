import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Fish, TrendingUp, AlertCircle, Loader,
  Droplet, Beaker, Egg, Utensils, ScrollText, ClipboardCheck, FileSpreadsheet,
} from 'lucide-react'
import api from '../../services/api'
import { pondsAPI, batchesAPI } from '../../services/api'
import DailyTaskChecklist from './DailyTaskChecklist'
import BulkEntryGrid from '../Forms/BulkEntryGrid'
import OperationForm from '../Forms/OperationForm'

// Unit-specific quick-action icons rendered on each pond card.
// `category` + `defaultType` drive the OperationForm modal that opens on click.
const QUICK_ACTIONS = {
  hatchery: [
    { id: 'water_quality', label: 'جودة المياه', icon: Droplet, kind: 'water_quality' },
    { id: 'sampling',      label: 'عينة وزن',    icon: Fish,    kind: 'sampling' },
    { id: 'eggs',          label: 'البيض',        icon: Egg,     kind: 'sampling' },
  ],
  growout: [
    { id: 'water_quality', label: 'جودة المياه', icon: Droplet, kind: 'water_quality' },
    { id: 'feeding',       label: 'تغذية',        icon: Utensils, kind: 'feeding' },
    { id: 'molasses',      label: 'مولاس',        icon: Beaker,  kind: 'operation', category: 'additive', defaultType: 'molasses' },
  ],
  fattening: [
    { id: 'water_quality', label: 'جودة المياه', icon: Droplet, kind: 'water_quality' },
    { id: 'feeding',       label: 'تغذية',        icon: Utensils, kind: 'feeding' },
    { id: 'harvest',       label: 'حصاد',         icon: ScrollText, kind: 'harvest' },
  ],
}

export default function UnitPondGrid({ unitType, unitTitle, systemType }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [ponds, setPonds] = useState([])
  const [unitSummary, setUnitSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [opModal, setOpModal] = useState(null) // { pondId, category, defaultType }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitType])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [pondsResponse, batches, summary] = await Promise.all([
        api.get('/ponds/'),
        batchesAPI.getAll().catch(() => []),
        pondsAPI.getUnitSummary(unitType).catch(() => null),
      ])

      const unitPonds = pondsResponse.data.filter((p) => p.unit_type === unitType)
      const pondsWithBatches = unitPonds.map((pond) => {
        const batch = batches.find((b) => b.pond_id === pond.id && b.status === 'active')
        return { ...pond, batch }
      })

      setPonds(pondsWithBatches)
      setUnitSummary(summary)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const activeBatches = ponds.filter((p) => p.batch).map((p) => p.batch)
    const totalFish = activeBatches.reduce((s, b) => s + (b.current_count || 0), 0)
    const totalBiomass = activeBatches.reduce((s, b) => s + (b.biomass || 0), 0)
    const avgWeight = activeBatches.length
      ? activeBatches.reduce((s, b) => s + (b.avg_weight || 0), 0) / activeBatches.length
      : 0
    const avgMortality = activeBatches.length
      ? activeBatches.reduce((s, b) => s + (b.mortality_rate || 0), 0) / activeBatches.length
      : 0
    return {
      totalFish,
      totalBiomass: totalBiomass / 1000,
      avgWeight,
      avgMortality,
      activePonds: activeBatches.length,
    }
  }

  const getStatusBadge = (batch) => {
    if (!batch) return 'badge-secondary'
    if (unitType === 'hatchery'  && batch.avg_weight >= 40)  return 'badge-success'
    if (unitType === 'growout'   && batch.avg_weight >= 200) return 'badge-success'
    if (unitType === 'fattening' && batch.avg_weight >= 350) return 'badge-success'
    return 'badge-info'
  }

  const getStatusText = (batch) => {
    if (!batch) return t('status.inactive')
    if (unitType === 'hatchery'  && batch.avg_weight >= 40)  return 'جاهز للنقل'
    if (unitType === 'growout'   && batch.avg_weight >= 200) return 'جاهز للنقل'
    if (unitType === 'fattening' && batch.avg_weight >= 350) return 'جاهز للحصاد'
    return t('status.active')
  }

  const calculateAge = (stockingDate) => {
    if (!stockingDate) return 0
    const stocking = new Date(stockingDate)
    const now = new Date()
    return Math.ceil(Math.abs(now - stocking) / (1000 * 60 * 60 * 24))
  }

  const handleQuickAction = (pond, action) => {
    if (action.kind === 'operation') {
      setOpModal({ pondId: pond.id, category: action.category, defaultType: action.defaultType })
    } else {
      // For water_quality / feeding / sampling / harvest, delegate to the existing
      // PondDetails screen which already hosts those modals.
      navigate(`/pond/${pond.unit_type}/${pond.id}`)
    }
  }

  // ---- Render ----
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
        <button onClick={fetchData} className="btn btn-primary">إعادة المحاولة</button>
      </div>
    )
  }

  const stats = calculateStats()
  const quickActions = QUICK_ACTIONS[unitType] || []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{unitTitle}</h2>
          <p className="text-gray-600 mt-1">
            {systemType} - {ponds.length} {t('units.ponds')} ({stats.activePonds} {t('units.activeBatches')})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBulkOpen(true)}
            className="btn btn-secondary inline-flex items-center gap-2"
            title="تسجيل بيانات لعدة أحواض"
          >
            <FileSpreadsheet className="w-4 h-4" />
            تسجيل جماعي
          </button>
          <button onClick={() => navigate('/batches')} className="btn btn-primary">
            إضافة دورة جديدة
          </button>
        </div>
      </div>

      {/* Unit-specific summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">{t('units.totalFish')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalFish.toLocaleString()}</p>
        </div>

        {unitType === 'hatchery' ? (
          <>
            <div className="card">
              <p className="text-sm text-gray-600">إجمالي البيض</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(unitSummary?.total_eggs ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">معدل الفقس</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {unitSummary?.avg_hatch_rate != null
                  ? `${(unitSummary.avg_hatch_rate * 100).toFixed(1)}%`
                  : '—'}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">{t('kpi.avgWeight')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.avgWeight.toFixed(1)} {t('common.g')}
              </p>
            </div>
          </>
        ) : unitType === 'growout' ? (
          <>
            <div className="card">
              <p className="text-sm text-gray-600">{t('kpi.totalBiomass')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalBiomass.toFixed(1)} {t('common.kg')}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">متوسط الفلوك</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {unitSummary?.avg_floc_level != null ? unitSummary.avg_floc_level.toFixed(1) : '—'}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">المولاس (آخر 7 أيام)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {unitSummary?.molasses_consumption_kg_7d != null
                  ? `${unitSummary.molasses_consumption_kg_7d.toFixed(1)} كجم`
                  : '—'}
              </p>
            </div>
          </>
        ) : (
          // fattening
          <>
            <div className="card">
              <p className="text-sm text-gray-600">{t('kpi.totalBiomass')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalBiomass.toFixed(1)} {t('common.kg')}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">{t('kpi.avgWeight')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.avgWeight.toFixed(1)} {t('common.g')}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">جاهز للحصاد</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {unitSummary?.harvest_ready_count ?? 0}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Daily Task Checklist (binary tasks, one row per pond) */}
      <DailyTaskChecklist unitType={unitType} ponds={ponds} onChange={fetchData} />

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
              className={`card ${pond.batch ? 'card-hover' : 'opacity-75'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={pond.batch ? 'cursor-pointer' : ''}
                  onClick={() => pond.batch && navigate(`/pond/${pond.unit_type}/${pond.id}`)}
                >
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
                  {/* Hatch rate per pond — only at egg/fry stage */}
                  {unitType === 'hatchery' &&
                    pond.batch.initial_count > 0 &&
                    ['eggs', 'fry'].includes(pond.batch.stage) && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">معدل الفقس</span>
                        <span className="font-semibold text-gray-900">
                          {((pond.batch.current_count / pond.batch.initial_count) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
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

              {/* Unit-specific quick-action icons */}
              {pond.batch && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-around">
                  {quickActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(pond, action)}
                        className="flex flex-col items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                        title={action.label}
                      >
                        <Icon className="w-5 h-5 text-gray-600" />
                        <span className="text-xs text-gray-600">{action.label}</span>
                      </button>
                    )
                  })}
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

      {/* Bulk-entry modal */}
      {bulkOpen && (
        <BulkEntryGrid
          unitType={unitType}
          ponds={ponds}
          onClose={() => setBulkOpen(false)}
          onSubmit={() => { setBulkOpen(false); fetchData() }}
        />
      )}

      {/* Per-pond operation modal (e.g. molasses dosing) */}
      {opModal && (
        <OperationForm
          category={opModal.category}
          defaultType={opModal.defaultType}
          pondId={opModal.pondId}
          onClose={() => setOpModal(null)}
          onSubmit={() => { setOpModal(null); fetchData() }}
        />
      )}
    </div>
  )
}
