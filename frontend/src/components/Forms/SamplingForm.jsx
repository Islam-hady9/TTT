import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Scale, X, AlertCircle, TrendingUp } from 'lucide-react'
import { samplingsAPI } from '../../services/api'

export default function SamplingForm({ batchId, currentAvgWeight, onClose, onSubmit }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [formData, setFormData] = useState({
    sampleCount: '',
    totalSampleWeight: '',
    sampledBy: '',
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Calculate average weight from sample
  const calculateAvgWeight = () => {
    if (!formData.sampleCount || !formData.totalSampleWeight) return null
    return (parseFloat(formData.totalSampleWeight) / parseInt(formData.sampleCount)).toFixed(2)
  }

  // Calculate weight change percentage
  const calculateWeightChange = () => {
    const newAvgWeight = calculateAvgWeight()
    if (!newAvgWeight || !currentAvgWeight) return null
    const change = ((newAvgWeight - currentAvgWeight) / currentAvgWeight) * 100
    return change.toFixed(1)
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
    
    if (!formData.sampleCount) {
      newErrors.sampleCount = isRTL ? 'مطلوب' : 'Required'
    } else if (parseInt(formData.sampleCount) < 30) {
      newErrors.sampleCount = isRTL 
        ? 'يجب أن يكون العدد 30 سمكة على الأقل' 
        : 'Minimum 30 fish required'
    }
    
    if (!formData.totalSampleWeight) {
      newErrors.totalSampleWeight = isRTL ? 'مطلوب' : 'Required'
    } else if (parseFloat(formData.totalSampleWeight) <= 0) {
      newErrors.totalSampleWeight = isRTL 
        ? 'يجب أن يكون الوزن أكبر من صفر' 
        : 'Weight must be greater than zero'
    }
    
    if (!formData.sampledBy) {
      newErrors.sampledBy = isRTL ? 'مطلوب' : 'Required'
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
        batch_id: batchId,
        sample_count: parseInt(formData.sampleCount),
        total_sample_weight: parseFloat(formData.totalSampleWeight),
        sampled_by: formData.sampledBy,
        notes: formData.notes || null
      }

      const result = await samplingsAPI.create(apiData)
      
      if (onSubmit) {
        onSubmit(result)
      }
      
      onClose()
    } catch (error) {
      console.error('Error submitting sampling:', error)
      setSubmitError(
        error.response?.data?.detail || 
        (isRTL 
          ? 'فشل في حفظ البيانات. يرجى المحاولة مرة أخرى.' 
          : 'Failed to save data. Please try again.')
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const avgWeight = calculateAvgWeight()
  const weightChange = calculateWeightChange()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isRTL ? 'تسجيل الوزن الدوري' : 'Weight Sampling'}
              </h2>
              <p className="text-sm text-gray-600">
                {isRTL ? `دورة ${batchId}` : `Batch ${batchId}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Weight Info */}
          {currentAvgWeight && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <Scale className="w-4 h-4" />
                <span className="font-medium">
                  {isRTL ? 'متوسط الوزن الحالي' : 'Current Average Weight'}
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{currentAvgWeight} {isRTL ? 'جرام' : 'g'}</p>
            </div>
          )}

          {/* Sample Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isRTL ? 'عدد الأسماك في العينة *' : 'Sample Count *'}
            </label>
            <input
              type="number"
              name="sampleCount"
              value={formData.sampleCount}
              onChange={handleChange}
              className={`input ${errors.sampleCount ? 'border-red-500' : ''}`}
              placeholder={isRTL ? 'الحد الأدنى: 30 سمكة' : 'Minimum: 30 fish'}
              min="30"
            />
            <p className="text-xs text-gray-500 mt-1">
              {isRTL 
                ? 'يجب أخذ عينة من 30 سمكة على الأقل للحصول على متوسط دقيق' 
                : 'Minimum 30 fish required for accurate average'}
            </p>
            {errors.sampleCount && <p className="text-red-500 text-sm mt-1">{errors.sampleCount}</p>}
          </div>

          {/* Total Sample Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isRTL ? 'إجمالي وزن العينة (جرام) *' : 'Total Sample Weight (g) *'}
            </label>
            <input
              type="number"
              step="0.1"
              name="totalSampleWeight"
              value={formData.totalSampleWeight}
              onChange={handleChange}
              className={`input ${errors.totalSampleWeight ? 'border-red-500' : ''}`}
              placeholder={isRTL ? 'أدخل الوزن الإجمالي' : 'Enter total weight'}
            />
            {errors.totalSampleWeight && <p className="text-red-500 text-sm mt-1">{errors.totalSampleWeight}</p>}
          </div>

          {/* Calculated Average Weight */}
          {avgWeight && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">
                    {isRTL ? 'متوسط الوزن المحسوب' : 'Calculated Average Weight'}
                  </span>
                </div>
                {weightChange && (
                  <span className={`text-sm font-semibold ${
                    parseFloat(weightChange) > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {parseFloat(weightChange) > 0 ? '+' : ''}{weightChange}%
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-green-900">
                {avgWeight} {isRTL ? 'جرام' : 'g'}
              </p>
              {weightChange && (
                <p className="text-sm text-green-600 mt-1">
                  {isRTL 
                    ? `تغير بمقدار ${Math.abs(parseFloat(weightChange))}% من الوزن السابق` 
                    : `${Math.abs(parseFloat(weightChange))}% change from previous weight`}
                </p>
              )}
            </div>
          )}

          {/* Sampled By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isRTL ? 'تم القياس بواسطة *' : 'Sampled By *'}
            </label>
            <input
              type="text"
              name="sampledBy"
              value={formData.sampledBy}
              onChange={handleChange}
              className={`input ${errors.sampledBy ? 'border-red-500' : ''}`}
              placeholder={isRTL ? 'اسم المهندس أو العامل' : 'Engineer or worker name'}
            />
            {errors.sampledBy && <p className="text-red-500 text-sm mt-1">{errors.sampledBy}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isRTL ? 'ملاحظات' : 'Notes'}
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="input"
              placeholder={isRTL 
                ? 'أي ملاحظات حول حالة الأسماك أو طريقة القياس...' 
                : 'Any observations about fish condition or sampling method...'}
            />
          </div>

          {/* Sampling Guidelines */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">
              {isRTL ? 'إرشادات القياس' : 'Sampling Guidelines'}
            </h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• {isRTL 
                ? 'اختر الأسماك عشوائياً من مناطق مختلفة في الحوض' 
                : 'Select fish randomly from different areas of the pond'}</li>
              <li>• {isRTL 
                ? 'تأكد من أن الأسماك ممثلة لحجم المجموعة بأكملها' 
                : 'Ensure fish are representative of the entire population'}</li>
              <li>• {isRTL 
                ? 'قم بالوزن بعد تجفيف الأسماك من الماء الزائد' 
                : 'Weigh after removing excess water from fish'}</li>
              <li>• {isRTL 
                ? 'سجل القياس في نفس الوقت تقريباً من اليوم للحصول على نتائج متسقة' 
                : 'Record at approximately the same time of day for consistency'}</li>
            </ul>
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
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? (isRTL ? 'جاري الحفظ...' : 'Saving...') 
                : (isRTL ? 'حفظ القياس' : 'Save Sampling')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
