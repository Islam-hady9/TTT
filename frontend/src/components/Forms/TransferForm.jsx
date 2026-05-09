import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRightLeft, X, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { transfersAPI, pondsAPI } from '../../services/api'

export default function TransferForm({ batch, fromPond, onClose, onSubmit }) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [formData, setFormData] = useState({
    toPondId: '',
    transferCount: '',
    transferredBy: '',
    notes: ''
  })

  const [availablePonds, setAvailablePonds] = useState([])
  const [validationResult, setValidationResult] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [loadingPonds, setLoadingPonds] = useState(true)

  // Load available ponds on mount
  useEffect(() => {
    loadAvailablePonds()
  }, [])

  const loadAvailablePonds = async () => {
    try {
      setLoadingPonds(true)
      const ponds = await pondsAPI.getAll()
      // Filter out the current pond
      const filtered = ponds.filter(p => p.id !== fromPond.id)
      setAvailablePonds(filtered)
    } catch (error) {
      console.error('Error loading ponds:', error)
      setSubmitError(
        isRTL 
          ? 'فشل في تحميل الأحواض المتاحة' 
          : 'Failed to load available ponds'
      )
    } finally {
      setLoadingPonds(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    // Reset validation when form changes
    if (validationResult) {
      setValidationResult(null)
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.toPondId) {
      newErrors.toPondId = isRTL ? 'مطلوب' : 'Required'
    }
    
    if (!formData.transferCount) {
      newErrors.transferCount = isRTL ? 'مطلوب' : 'Required'
    } else if (parseInt(formData.transferCount) <= 0) {
      newErrors.transferCount = isRTL 
        ? 'يجب أن يكون العدد أكبر من صفر' 
        : 'Count must be greater than zero'
    } else if (parseInt(formData.transferCount) > batch.current_count) {
      newErrors.transferCount = isRTL 
        ? `لا يمكن نقل أكثر من ${batch.current_count} سمكة` 
        : `Cannot transfer more than ${batch.current_count} fish`
    }
    
    if (!formData.transferredBy) {
      newErrors.transferredBy = isRTL ? 'مطلوب' : 'Required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleValidate = async () => {
    if (!validate()) return

    setIsValidating(true)
    setSubmitError(null)

    try {
      const result = await transfersAPI.validate({
        batch_id: batch.id,
        from_pond_id: fromPond.id,
        to_pond_id: parseInt(formData.toPondId),
        transfer_count: parseInt(formData.transferCount)
      })

      setValidationResult(result)
      
      if (result.valid) {
        setShowConfirmation(true)
      }
    } catch (error) {
      console.error('Error validating transfer:', error)
      setSubmitError(
        error.response?.data?.detail || 
        (isRTL 
          ? 'فشل في التحقق من صحة النقل' 
          : 'Failed to validate transfer')
      )
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!showConfirmation) {
      // First validate
      handleValidate()
      return
    }

    // Execute transfer
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const apiData = {
        batch_id: batch.id,
        from_pond_id: fromPond.id,
        to_pond_id: parseInt(formData.toPondId),
        transfer_count: parseInt(formData.transferCount),
        transferred_by: formData.transferredBy,
        notes: formData.notes || null
      }

      const result = await transfersAPI.create(apiData)
      
      if (onSubmit) {
        onSubmit(result)
      }
      
      onClose()
    } catch (error) {
      console.error('Error executing transfer:', error)
      setSubmitError(
        error.response?.data?.detail || 
        (isRTL 
          ? 'فشل في تنفيذ النقل. يرجى المحاولة مرة أخرى.' 
          : 'Failed to execute transfer. Please try again.')
      )
      setShowConfirmation(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedPond = availablePonds.find(p => p.id === parseInt(formData.toPondId))

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isRTL ? 'نقل بين الأحواض' : 'Inter-Pond Transfer'}
              </h2>
              <p className="text-sm text-gray-600">
                {isRTL ? `دورة ${batch.batch_code}` : `Batch ${batch.batch_code}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Batch Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-3">
              {isRTL ? 'معلومات الدورة' : 'Batch Information'}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-blue-600">{isRTL ? 'العدد الحالي' : 'Current Count'}:</span>
                <span className="font-bold text-blue-900 ml-2">{batch.current_count.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-blue-600">{isRTL ? 'متوسط الوزن' : 'Avg Weight'}:</span>
                <span className="font-bold text-blue-900 ml-2">{batch.avg_weight} {isRTL ? 'جرام' : 'g'}</span>
              </div>
              <div>
                <span className="text-blue-600">{isRTL ? 'المرحلة' : 'Stage'}:</span>
                <span className="font-bold text-blue-900 ml-2">
                  {isRTL ? getStageNameAr(batch.stage) : getStageNameEn(batch.stage)}
                </span>
              </div>
              <div>
                <span className="text-blue-600">{isRTL ? 'الكتلة الحية' : 'Biomass'}:</span>
                <span className="font-bold text-blue-900 ml-2">
                  {batch.biomass ? `${batch.biomass.toFixed(2)} ${isRTL ? 'كجم' : 'kg'}` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* From Pond (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isRTL ? 'من الحوض' : 'From Pond'}
            </label>
            <input
              type="text"
              value={`${fromPond.pond_code || fromPond.id} - ${fromPond.unit_type || ''}`}
              disabled
              className="input bg-gray-50 cursor-not-allowed"
            />
          </div>

          {/* To Pond */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isRTL ? 'إلى الحوض *' : 'To Pond *'}
            </label>
            {loadingPonds ? (
              <div className="input flex items-center justify-center text-gray-500">
                {isRTL ? 'جاري التحميل...' : 'Loading...'}
              </div>
            ) : (
              <select
                name="toPondId"
                value={formData.toPondId}
                onChange={handleChange}
                className={`input ${errors.toPondId ? 'border-red-500' : ''}`}
              >
                <option value="">
                  {isRTL ? 'اختر الحوض المستهدف' : 'Select target pond'}
                </option>
                {availablePonds.map(pond => (
                  <option key={pond.id} value={pond.id}>
                    {pond.pond_code || pond.id} - {pond.unit_type || 'Unknown'} 
                    {pond.status === 'active' ? ` (${isRTL ? 'نشط' : 'Active'})` : ''}
                  </option>
                ))}
              </select>
            )}
            {errors.toPondId && <p className="text-red-500 text-sm mt-1">{errors.toPondId}</p>}
          </div>

          {/* Selected Pond Info */}
          {selectedPond && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <Info className="w-4 h-4" />
                <span className="font-medium">
                  {isRTL ? 'معلومات الحوض المستهدف' : 'Target Pond Information'}
                </span>
              </div>
              <div className="text-sm text-green-800">
                <p><strong>{isRTL ? 'الكود' : 'Code'}:</strong> {selectedPond.pond_code || selectedPond.id}</p>
                <p><strong>{isRTL ? 'الوحدة' : 'Unit'}:</strong> {selectedPond.unit_type || 'N/A'}</p>
                <p><strong>{isRTL ? 'الحالة' : 'Status'}:</strong> {selectedPond.status || 'N/A'}</p>
              </div>
            </div>
          )}

          {/* Transfer Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isRTL ? 'عدد الأسماك المراد نقلها *' : 'Transfer Count *'}
            </label>
            <input
              type="number"
              name="transferCount"
              value={formData.transferCount}
              onChange={handleChange}
              className={`input ${errors.transferCount ? 'border-red-500' : ''}`}
              placeholder={isRTL ? `الحد الأقصى: ${batch.current_count}` : `Maximum: ${batch.current_count}`}
              min="1"
              max={batch.current_count}
            />
            <p className="text-xs text-gray-500 mt-1">
              {isRTL 
                ? `العدد المتاح للنقل: ${batch.current_count.toLocaleString()} سمكة` 
                : `Available for transfer: ${batch.current_count.toLocaleString()} fish`}
            </p>
            {errors.transferCount && <p className="text-red-500 text-sm mt-1">{errors.transferCount}</p>}
          </div>

          {/* Transferred By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isRTL ? 'تم النقل بواسطة *' : 'Transferred By *'}
            </label>
            <input
              type="text"
              name="transferredBy"
              value={formData.transferredBy}
              onChange={handleChange}
              className={`input ${errors.transferredBy ? 'border-red-500' : ''}`}
              placeholder={isRTL ? 'اسم المهندس أو العامل' : 'Engineer or worker name'}
            />
            {errors.transferredBy && <p className="text-red-500 text-sm mt-1">{errors.transferredBy}</p>}
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
                ? 'أي ملاحظات حول عملية النقل...' 
                : 'Any notes about the transfer operation...'}
            />
          </div>

          {/* Validation Result */}
          {validationResult && !validationResult.valid && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium mb-1">
                  {isRTL ? 'لا يمكن إتمام النقل' : 'Transfer Cannot Be Completed'}
                </p>
                <p className="text-red-600 text-sm">{validationResult.message}</p>
              </div>
            </div>
          )}

          {/* Confirmation Message */}
          {showConfirmation && validationResult?.valid && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-700 font-medium mb-1">
                  {isRTL ? 'جاهز للنقل' : 'Ready to Transfer'}
                </p>
                <p className="text-green-600 text-sm">
                  {isRTL 
                    ? `سيتم نقل ${formData.transferCount} سمكة من ${fromPond.pond_code || fromPond.id} إلى ${selectedPond?.pond_code || formData.toPondId}` 
                    : `${formData.transferCount} fish will be transferred from ${fromPond.pond_code || fromPond.id} to ${selectedPond?.pond_code || formData.toPondId}`}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{submitError}</p>
            </div>
          )}

          {/* Transfer Guidelines */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">
              {isRTL ? 'إرشادات النقل' : 'Transfer Guidelines'}
            </h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• {isRTL 
                ? 'تأكد من أن الحوض المستهدف جاهز لاستقبال الأسماك' 
                : 'Ensure target pond is ready to receive fish'}</li>
              <li>• {isRTL 
                ? 'قم بمعايرة درجة حرارة المياه قبل النقل' 
                : 'Acclimate water temperature before transfer'}</li>
              <li>• {isRTL 
                ? 'تجنب النقل في الأوقات الحارة من اليوم' 
                : 'Avoid transfer during hot times of day'}</li>
              <li>• {isRTL 
                ? 'راقب الأسماك بعد النقل للتأكد من تكيفها' 
                : 'Monitor fish after transfer to ensure adaptation'}</li>
            </ul>
          </div>

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
            {!showConfirmation ? (
              <button
                type="button"
                onClick={handleValidate}
                disabled={isValidating || loadingPonds}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating 
                  ? (isRTL ? 'جاري التحقق...' : 'Validating...') 
                  : (isRTL ? 'التحقق من النقل' : 'Validate Transfer')}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting 
                  ? (isRTL ? 'جاري النقل...' : 'Transferring...') 
                  : (isRTL ? 'تأكيد النقل' : 'Confirm Transfer')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

// Helper functions for stage names
function getStageNameAr(stage) {
  const stages = {
    'eggs': 'بيض',
    'fry': 'يرقات',
    'fingerlings': 'صغار',
    'juveniles': 'نمو',
    'young_fish': 'شباب',
    'fattening': 'تسمين'
  }
  return stages[stage] || stage
}

function getStageNameEn(stage) {
  const stages = {
    'eggs': 'Eggs',
    'fry': 'Fry',
    'fingerlings': 'Fingerlings',
    'juveniles': 'Juveniles',
    'young_fish': 'Young Fish',
    'fattening': 'Fattening'
  }
  return stages[stage] || stage
}
