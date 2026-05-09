import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Fish, X, Clock, AlertCircle } from 'lucide-react'
import { feedingAPI } from '../../services/api'

export default function FeedingForm({ pondId, currentBiomass, onClose, onSubmit }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    feedAmount: '',
    feedType: 'starter',
    feedingTime: '',
    duration: '',
    consumption: 'full',
    fedBy: '',
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Calculate recommended feed amount (1-18% of biomass based on fish size)
  const getRecommendedFeed = () => {
    if (!currentBiomass) return null
    // Simplified calculation - in real app, this would be based on fish weight and temperature
    const percentage = 3 // 3% of biomass as example
    return (currentBiomass * percentage / 100).toFixed(2)
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
    
    if (!formData.feedAmount) newErrors.feedAmount = 'مطلوب'
    if (!formData.feedingTime) newErrors.feedingTime = 'مطلوب'
    if (!formData.fedBy) newErrors.fedBy = 'مطلوب'

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
        feed_amount: parseFloat(formData.feedAmount),
        feed_type: formData.feedType,
        feeding_time: formData.feedingTime,
        duration: formData.duration ? parseInt(formData.duration) : null,
        consumption: formData.consumption,
        fed_by: formData.fedBy,
        notes: formData.notes || null
      }

      const result = await feedingAPI.create(apiData)
      
      if (onSubmit) {
        onSubmit(result)
      }
      
      onClose()
    } catch (error) {
      console.error('Error submitting feeding:', error)
      setSubmitError(
        error.response?.data?.detail || 
        'فشل في حفظ البيانات. يرجى المحاولة مرة أخرى.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const recommended = getRecommendedFeed()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Fish className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">تسجيل التغذية</h2>
              <p className="text-sm text-gray-600">حوض {pondId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Recommended Feed */}
          {recommended && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <Fish className="w-4 h-4" />
                <span className="font-medium">الكمية الموصى بها</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{recommended} كجم</p>
              <p className="text-sm text-blue-600 mt-1">
                بناءً على الكتلة الحية الحالية: {currentBiomass} كجم
              </p>
            </div>
          )}

          {/* Feed Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كمية العلف (كجم) *
            </label>
            <input
              type="number"
              step="0.1"
              name="feedAmount"
              value={formData.feedAmount}
              onChange={handleChange}
              className={`input ${errors.feedAmount ? 'border-red-500' : ''}`}
              placeholder="أدخل الكمية"
            />
            {errors.feedAmount && <p className="text-red-500 text-sm mt-1">{errors.feedAmount}</p>}
          </div>

          {/* Feed Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع العلف
            </label>
            <select
              name="feedType"
              value={formData.feedType}
              onChange={handleChange}
              className="input"
            >
              <option value="starter">Starter (&lt; 1g)</option>
              <option value="grower">Grower (1-30g)</option>
              <option value="finisher">Finisher (30-200g)</option>
              <option value="fattening">Fattening (&gt; 200g)</option>
            </select>
          </div>

          {/* Feeding Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وقت التغذية *
            </label>
            <div className="relative">
              <input
                type="time"
                name="feedingTime"
                value={formData.feedingTime}
                onChange={handleChange}
                className={`input ${errors.feedingTime ? 'border-red-500' : ''}`}
              />
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {errors.feedingTime && <p className="text-red-500 text-sm mt-1">{errors.feedingTime}</p>}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مدة التغذية (دقائق)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="input"
              placeholder="15-20 دقيقة"
            />
            <p className="text-xs text-gray-500 mt-1">
              المدة المثالية: 15-20 دقيقة
            </p>
          </div>

          {/* Consumption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مستوى الاستهلاك
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, consumption: 'full' }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.consumption === 'full'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold">100%</div>
                  <div className="text-xs">استهلاك كامل</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, consumption: 'partial' }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.consumption === 'partial'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold">50-90%</div>
                  <div className="text-xs">استهلاك جزئي</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, consumption: 'poor' }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.consumption === 'poor'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold">{'<'} 50%</div>
                  <div className="text-xs">استهلاك ضعيف</div>
                </div>
              </button>
            </div>
          </div>

          {/* Fed By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تمت التغذية بواسطة *
            </label>
            <input
              type="text"
              name="fedBy"
              value={formData.fedBy}
              onChange={handleChange}
              className={`input ${errors.fedBy ? 'border-red-500' : ''}`}
              placeholder="اسم المهندس أو العامل"
            />
            {errors.fedBy && <p className="text-red-500 text-sm mt-1">{errors.fedBy}</p>}
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
              placeholder="أي ملاحظات حول سلوك الأسماك أثناء التغذية..."
            />
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
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
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغذية'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
