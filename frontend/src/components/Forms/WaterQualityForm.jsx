import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Droplet, AlertCircle, CheckCircle, X } from 'lucide-react'
import { waterQualityAPI } from '../../services/api'

export default function WaterQualityForm({ pondId, onClose, onSubmit }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    do: '',
    ph: '',
    temperature: '',
    tan: '',
    alkalinity: '',
    floc: '',
    ammonia: '',
    measuredBy: '',
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const thresholds = {
    do: { min: 4.0, max: 9.0, optimal_min: 6.0, optimal_max: 8.0 },
    ph: { min: 6.5, max: 8.5, optimal_min: 7.0, optimal_max: 8.3 },
    temperature: { min: 20, max: 35, optimal_min: 25, optimal_max: 30 },
    tan: { min: 0, max: 1.5, optimal_min: 0, optimal_max: 0.5 },
    alkalinity: { min: 100, max: 150, optimal_min: 120, optimal_max: 150 },
    floc: { min: 25, max: 40, optimal_min: 30, optimal_max: 35 }
  }

  const getStatus = (value, param) => {
    if (!value || !thresholds[param]) return 'normal'
    const val = parseFloat(value)
    const { min, max, optimal_min, optimal_max } = thresholds[param]
    
    if (val < min || val > max) return 'critical'
    if (val < optimal_min || val > optimal_max) return 'warning'
    return 'optimal'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertCircle className="w-4 h-4" />
      case 'critical': return <AlertCircle className="w-4 h-4" />
      default: return null
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.do) newErrors.do = 'مطلوب'
    if (!formData.ph) newErrors.ph = 'مطلوب'
    if (!formData.temperature) newErrors.temperature = 'مطلوب'
    if (!formData.measuredBy) newErrors.measuredBy = 'مطلوب'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Prepare data for API
      const apiData = {
        pond_id: pondId,
        do: parseFloat(formData.do),
        ph: parseFloat(formData.ph),
        temperature: parseFloat(formData.temperature),
        tan: formData.tan ? parseFloat(formData.tan) : null,
        alkalinity: formData.alkalinity ? parseFloat(formData.alkalinity) : null,
        floc: formData.floc ? parseFloat(formData.floc) : null,
        ammonia: formData.ammonia ? parseFloat(formData.ammonia) : null,
        measured_by: formData.measuredBy,
        notes: formData.notes || null
      }

      // Send to backend
      const result = await waterQualityAPI.create(apiData)
      
      // Call parent callback if provided
      if (onSubmit) {
        onSubmit(result)
      }
      
      // Close form on success
      onClose()
    } catch (error) {
      console.error('Error submitting water quality:', error)
      setSubmitError(
        error.response?.data?.detail || 
        'فشل في حفظ البيانات. يرجى المحاولة مرة أخرى.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Droplet className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">قياس جودة المياه</h2>
              <p className="text-sm text-gray-600">حوض {pondId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Water Quality Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الأكسجين الذائب (DO) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  name="do"
                  value={formData.do}
                  onChange={handleChange}
                  className={`input ${errors.do ? 'border-red-500' : ''}`}
                  placeholder="6.0 - 8.0"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  mg/L
                </span>
              </div>
              {formData.do && (
                <div className={`mt-2 px-3 py-2 rounded-lg border flex items-center gap-2 text-sm ${getStatusColor(getStatus(formData.do, 'do'))}`}>
                  {getStatusIcon(getStatus(formData.do, 'do'))}
                  <span>النطاق المثالي: 6.0 - 8.0 mg/L</span>
                </div>
              )}
              {errors.do && <p className="text-red-500 text-sm mt-1">{errors.do}</p>}
            </div>

            {/* pH */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحموضة (pH) *
              </label>
              <input
                type="number"
                step="0.1"
                name="ph"
                value={formData.ph}
                onChange={handleChange}
                className={`input ${errors.ph ? 'border-red-500' : ''}`}
                placeholder="7.0 - 8.3"
              />
              {formData.ph && (
                <div className={`mt-2 px-3 py-2 rounded-lg border flex items-center gap-2 text-sm ${getStatusColor(getStatus(formData.ph, 'ph'))}`}>
                  {getStatusIcon(getStatus(formData.ph, 'ph'))}
                  <span>النطاق المثالي: 7.0 - 8.3</span>
                </div>
              )}
              {errors.ph && <p className="text-red-500 text-sm mt-1">{errors.ph}</p>}
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                درجة الحرارة *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  className={`input ${errors.temperature ? 'border-red-500' : ''}`}
                  placeholder="25 - 30"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  °C
                </span>
              </div>
              {formData.temperature && (
                <div className={`mt-2 px-3 py-2 rounded-lg border flex items-center gap-2 text-sm ${getStatusColor(getStatus(formData.temperature, 'temperature'))}`}>
                  {getStatusIcon(getStatus(formData.temperature, 'temperature'))}
                  <span>النطاق المثالي: 25 - 30 °C</span>
                </div>
              )}
              {errors.temperature && <p className="text-red-500 text-sm mt-1">{errors.temperature}</p>}
            </div>

            {/* TAN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نيتروجين الأمونيا (TAN)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  name="tan"
                  value={formData.tan}
                  onChange={handleChange}
                  className="input"
                  placeholder="0 - 0.5"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  mg/L
                </span>
              </div>
              {formData.tan && (
                <div className={`mt-2 px-3 py-2 rounded-lg border flex items-center gap-2 text-sm ${getStatusColor(getStatus(formData.tan, 'tan'))}`}>
                  {getStatusIcon(getStatus(formData.tan, 'tan'))}
                  <span>النطاق المثالي: 0 - 0.5 mg/L</span>
                </div>
              )}
            </div>

            {/* Alkalinity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                القلوية الكلية
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  name="alkalinity"
                  value={formData.alkalinity}
                  onChange={handleChange}
                  className="input"
                  placeholder="120 - 150"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  mg/L
                </span>
              </div>
              {formData.alkalinity && (
                <div className={`mt-2 px-3 py-2 rounded-lg border flex items-center gap-2 text-sm ${getStatusColor(getStatus(formData.alkalinity, 'alkalinity'))}`}>
                  {getStatusIcon(getStatus(formData.alkalinity, 'alkalinity'))}
                  <span>النطاق المثالي: 120 - 150 mg/L</span>
                </div>
              )}
            </div>

            {/* Floc Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مستوى الفلوك
              </label>
              <input
                type="number"
                step="1"
                name="floc"
                value={formData.floc}
                onChange={handleChange}
                className="input"
                placeholder="30 - 35"
              />
              {formData.floc && (
                <div className={`mt-2 px-3 py-2 rounded-lg border flex items-center gap-2 text-sm ${getStatusColor(getStatus(formData.floc, 'floc'))}`}>
                  {getStatusIcon(getStatus(formData.floc, 'floc'))}
                  <span>النطاق المثالي: 30 - 35</span>
                </div>
              )}
            </div>

            {/* Ammonia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الأمونيا السامة (NH3)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  name="ammonia"
                  value={formData.ammonia}
                  onChange={handleChange}
                  className="input"
                  placeholder="< 0.5"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  mg/L
                </span>
              </div>
            </div>

            {/* Measured By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تم القياس بواسطة *
              </label>
              <input
                type="text"
                name="measuredBy"
                value={formData.measuredBy}
                onChange={handleChange}
                className={`input ${errors.measuredBy ? 'border-red-500' : ''}`}
                placeholder="اسم المهندس"
              />
              {errors.measuredBy && <p className="text-red-500 text-sm mt-1">{errors.measuredBy}</p>}
            </div>
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
              placeholder="أي ملاحظات إضافية..."
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
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ القياسات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
