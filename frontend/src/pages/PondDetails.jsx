import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Droplet, Fish, TrendingUp, Plus, AlertCircle, Beaker, Scale, ArrowRightLeft, Loader } from 'lucide-react'
import { pondsAPI, batchesAPI } from '../services/api'
import WaterQualityForm from '../components/Forms/WaterQualityForm'
import FeedingForm from '../components/Forms/FeedingForm'
import MortalityForm from '../components/Forms/MortalityForm'
import AdditivesForm from '../components/Forms/AdditivesForm'
import SamplingForm from '../components/Forms/SamplingForm'
import TransferForm from '../components/Forms/TransferForm'

export default function PondDetails() {
  const { unitType, pondId } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [activeForm, setActiveForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pond, setPond] = useState(null)
  const [batch, setBatch] = useState(null)
  const [history, setHistory] = useState([])

  // Fetch real data from API
  useEffect(() => {
    fetchPondData()
  }, [pondId])

  const fetchPondData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch pond details
      const pondData = await pondsAPI.getById(pondId)
      setPond(pondData)
      
      // Fetch active batches for this pond
      const batchesData = await pondsAPI.getBatches(pondId)
      const activeBatch = Array.isArray(batchesData) 
        ? batchesData.find(b => b.status === 'active') 
        : batchesData?.status === 'active' ? batchesData : null
      
      if (activeBatch) {
        setBatch(activeBatch)
        // Fetch batch history
        try {
          const historyData = await batchesAPI.getHistory(activeBatch.id, null, 10)
          setHistory(Array.isArray(historyData) ? historyData : [])
        } catch {
          setHistory([])
        }
      }
    } catch (err) {
      console.error('Error fetching pond data:', err)
      setError(err.message || 'Failed to load pond data')
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (stockingDate) => {
    if (!stockingDate) return 0
    const stocking = new Date(stockingDate)
    const now = new Date()
    const diffTime = Math.abs(now - stocking)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const handleFormSubmit = (data) => {
    console.log('Form submitted:', data)
    alert('تم حفظ البيانات بنجاح!')
    setActiveForm(null)
    fetchPondData() // Refresh data after form submission
  }

  // Quick actions with complete Tailwind classes (no dynamic construction)
  const quickActions = [
    {
      id: 'water',
      label: 'قياس جودة المياه',
      icon: Droplet,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200 hover:border-blue-300',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      form: 'water'
    },
    {
      id: 'feeding',
      label: 'تسجيل التغذية',
      icon: Fish,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200 hover:border-green-300',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      form: 'feeding'
    },
    {
      id: 'sampling',
      label: 'قياس الوزن',
      icon: Scale,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200 hover:border-purple-300',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      form: 'sampling'
    },
    {
      id: 'transfer',
      label: 'نقل بين الأحواض',
      icon: ArrowRightLeft,
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200 hover:border-indigo-300',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      form: 'transfer'
    },
    {
      id: 'mortality',
      label: 'تسجيل النفوق',
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200 hover:border-red-300',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      form: 'mortality'
    },
    {
      id: 'additives',
      label: 'إضافة مواد',
      icon: Beaker,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200 hover:border-orange-300',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      form: 'additives'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-primary-500 mx-auto" />
          <p className="text-gray-600 mt-4">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">خطأ في تحميل البيانات</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={fetchPondData} className="btn btn-primary">
          {t('common.retry')}
        </button>
      </div>
    )
  }

  const age = batch ? calculateAge(batch.stocking_date) : 0
  const biomassKg = batch ? ((batch.biomass || 0) / 1000).toFixed(1) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {pond?.pond_code || `حوض ${pondId}`}
            </h2>
            <p className="text-gray-600 mt-1">
              {batch ? `دورة: ${batch.batch_code} • العمر: ${age} يوم` : 'لا توجد دورة نشطة'}
            </p>
          </div>
        </div>
        <span className={`badge ${batch ? 'badge-success' : 'badge-secondary'}`}>
          {batch ? t('status.active') : t('status.inactive')}
        </span>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {quickActions.map(action => (
          <button
            key={action.id}
            onClick={() => batch && setActiveForm(action.form)}
            disabled={!batch}
            className={`card card-hover p-4 flex flex-col items-center gap-3 ${action.bgColor} ${action.borderColor} ${!batch ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className={`w-12 h-12 ${action.iconBg} rounded-lg flex items-center justify-center`}>
              <action.icon className={`w-6 h-6 ${action.iconColor}`} />
            </div>
            <span className="text-sm font-medium text-gray-900 text-center">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">عدد الأسماك</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {batch?.current_count?.toLocaleString() || 0}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">متوسط الوزن</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {batch?.avg_weight?.toFixed(1) || 0} جرام
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">الكتلة الحية</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{biomassKg} كجم</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">FCR</p>
          <p className={`text-2xl font-bold mt-1 ${batch?.fcr && batch.fcr <= 1.5 ? 'text-green-600' : batch?.fcr > 1.8 ? 'text-red-600' : 'text-yellow-600'}`}>
            {batch?.fcr?.toFixed(2) || 'N/A'}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات الدورة</h3>
          {batch ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">كود الدورة</span>
                <span className="font-semibold">{batch.batch_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">تاريخ الإنزال</span>
                <span className="font-semibold">{batch.stocking_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">العمر</span>
                <span className="font-semibold">{age} يوم</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">المرحلة</span>
                <span className="font-semibold">{t(`stages.${batch.stage}`)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">معدل النفوق</span>
                <span className={`font-semibold ${(batch.mortality_rate || 0) <= 10 ? 'text-green-600' : 'text-red-600'}`}>
                  {batch.mortality_rate?.toFixed(1) || 0}%
                </span>
              </div>
              {batch.survival_rate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">معدل البقاء</span>
                  <span className="font-semibold text-green-600">
                    {batch.survival_rate.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">لا توجد دورة نشطة في هذا الحوض</div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">معلومات الحوض</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">كود الحوض</span>
              <span className="font-semibold">{pond?.pond_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">نوع الوحدة</span>
              <span className="font-semibold">{t(`units.${unitType === 'nursery' ? 'hatchery' : unitType === 'pregrow' ? 'growout' : 'fattening'}`)}</span>
            </div>
            {pond?.volume && (
              <div className="flex justify-between">
                <span className="text-gray-600">حجم الحوض</span>
                <span className="font-semibold">{pond.volume} م³</span>
              </div>
            )}
            {pond?.area && (
              <div className="flex justify-between">
                <span className="text-gray-600">المساحة</span>
                <span className="font-semibold">{pond.area} م²</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">النشاطات الأخيرة</h3>
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Fish className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {item.action_type || item.description || 'نشاط'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {item.created_at ? new Date(item.created_at).toLocaleString('ar-EG') : ''}
                    {item.created_by ? ` • بواسطة ${item.created_by}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Fish className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>لا توجد نشاطات مسجلة بعد</p>
          </div>
        )}
      </div>

      {/* Forms */}
      {activeForm === 'water' && batch && (
        <WaterQualityForm
          pondId={pond.id}
          onClose={() => setActiveForm(null)}
          onSubmit={handleFormSubmit}
        />
      )}
      {activeForm === 'feeding' && batch && (
        <FeedingForm
          pondId={pond.id}
          currentBiomass={batch.biomass ? batch.biomass / 1000 : 0}
          onClose={() => setActiveForm(null)}
          onSubmit={handleFormSubmit}
        />
      )}
      {activeForm === 'sampling' && batch && (
        <SamplingForm
          batchId={batch.id}
          currentAvgWeight={batch.avg_weight}
          onClose={() => setActiveForm(null)}
          onSubmit={handleFormSubmit}
        />
      )}
      {activeForm === 'transfer' && batch && (
        <TransferForm
          batch={batch}
          fromPond={pond}
          onClose={() => setActiveForm(null)}
          onSubmit={handleFormSubmit}
        />
      )}
      {activeForm === 'mortality' && batch && (
        <MortalityForm
          pondId={pond.id}
          currentFishCount={batch.current_count}
          onClose={() => setActiveForm(null)}
          onSubmit={handleFormSubmit}
        />
      )}
      {activeForm === 'additives' && batch && (
        <AdditivesForm
          pondId={pond.id}
          onClose={() => setActiveForm(null)}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  )
}
