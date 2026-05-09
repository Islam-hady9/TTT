import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, X } from 'lucide-react'
import { mortalityAPI } from '../../services/api'

export default function MortalityForm({ pondId, currentFishCount, onClose, onSubmit }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    mortalityCount: '',
    cause: 'unknown',
    otherCause: '',
    recordedBy: '',
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const causes = [
    { value: 'unknown', label: 'غير معروف' },
    { value: 'water_quality', label: 'جودة المياه' },
    { value: 'disease', label: 'مرض' },
    { value: 'stress', label: 'إجهاد' },
    { value: 'temperature', label: 'درجة الحرارة' },
    { value: 'oxygen', label: 'نقص الأكسجين' },
    { value: 'handling', label: 'سوء المعاملة' },
    { value: 'other', label: 'أخرى' }
  ]

  const getMortalityRate = () => {
    if (!formData.mortalityCount || !currentFishCount) return null
    return ((parseFloat(formData.mortalityCount) / currentFishCount) * 100).toFixed(2)
  }

  const getRateStatus = (rate) => {
    if (!rate) return 'normal'
    const r = parseFloat(rate)
    if (r <= 5) return 'good'
    if (r <= 10) return 'warning'
    return 'critical'
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.mortalityCount) newErrors.mortalityCount = 'مطلوب'
    if (!formData.recordedBy) newErrors.recordedBy = 'مطلوب'
    if (formData.cause === 'other' && !formData.otherCause) {
      newErrors.otherCause = 'يرجى تحديد السبب'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const apiData = {
        pond_id: pondId,
        mortality_count: parseInt(formData.mortalityCount),
        mortality_rate: parseFloat(getMortalityRate()),
        cause: formData.cause,
        other_cause: formData.cause === 'other' ? formData.otherCause : null,
        recorded_by: formData.recordedBy,
        notes: formData.notes || null
      }

      const result = await mortalityAPI.create(apiData)
      
      if (onSubmit) {
        onSubmit(result)
      }
      
      onClose()
    } catch (error) {
      console.error('Error submitting mortality:', error)
      setSubmitError(
        error.response?.data?.detail || 
        'فشل في حفظ البيانات. يرجى المحاولة مرة أخرى.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const mortalityRate = getMortalityRate()
  const rateStatus = getRateStatus(mortalityRate)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">تسجيل النفوق</h2>
              <p className="text-sm text-gray-600">حوض {pondId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Fish Count Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">العدد الحالي للأسماك</p>
            <p className="text-2xl font-bold text-gray-900">{currentFishCount?.toLocaleString()}</p>
          </div>

          {/* Mortality Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عدد الأسماك النافقة *
            </label>
            <input
              type="number"
              name="mortalityCount"
              value={formData.mortalityCount}
              onChange={handleChange}
              className={`input ${errors.mortalityCount ? 'border-red-500' : ''}`}
              placeholder="أدخل العدد"
              min="0"
            />
            {errors.mortalityCount && <p className="text-red-500 text-sm mt-1">{errors.mortalityCount}</p>}
          </div>

          {/* Mortality Rate Display */}
          {mortalityRate && (
            <div className={`p-4 rounded-lg border-2 ${
              rateStatus === 'good' ? 'bg-green-50 border-green-200' :
              rateStatus === 'warning' ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">معدل النفوق</p>
                  <p className={`text-3xl font-bold ${
                    rateStatus === 'good' ? 'text-green-700' :
                    rateStatus === 'warning' ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    {mortalityRate}%
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-xs text-gray-600">الحد المقبول</p>
                  <p className="text-sm font-semibold text-gray-700">{'<'} 10%</p>
                </div>
              </div>
              {parseFloat(mortalityRate) > 10 && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="text-sm text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    تحذير: معدل النفوق أعلى من المقبول
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Cause */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              السبب المحتمل
            </label>
            <select
              name="cause"
              value={formData.cause}
              onChange={handleChange}
              className="input"
            >
              {causes.map(cause => (
                <option key={cause.value} value={cause.value}>
                  {cause.label}
                </option>
              ))}
            </select>
          </div>

          {/* Other Cause */}
          {formData.cause === 'other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حدد السبب *
              </label>
              <input
                type="text"
                name="otherCause"
                value={formData.otherCause}
                onChange={handleChange}
                className={`input ${errors.otherCause ? 'border-red-500' : ''}`}
                placeholder="اكتب السبب"
              />
              {errors.otherCause && <p className="text-red-500 text-sm mt-1">{errors.otherCause}</p>}
            </div>
          )}

          {/* Recorded By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تم التسجيل بواسطة *
            </label>
            <input
              type="text"
              name="recordedBy"
              value={formData.recordedBy}
              onChange={handleChange}
              className={`input ${errors.recordedBy ? 'border-red-500' : ''}`}
              placeholder="اسم المهندس"
            />
            {errors.recordedBy && <p className="text-red-500 text-sm mt-1">{errors.recordedBy}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="input"
              placeholder="أي ملاحظات حول حالة الأسماك أو الظروف المحيطة..."
            />
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{submitError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ النفوق'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
