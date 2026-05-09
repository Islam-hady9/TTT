import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Beaker, ClipboardCheck, X, AlertCircle } from 'lucide-react'
import { additivesAPI, routineTasksAPI } from '../../services/api'

// Per-category type catalogues. Keeping these inline keeps the form a single
// reviewable file and matches how AdditivesForm originally encoded them.
const ADDITIVE_TYPES = [
  { value: 'molasses',          label: 'مولاس',              unit: 'لتر', color: 'amber' },
  { value: 'probiotics',        label: 'بروبيوتيكس',          unit: 'كجم', color: 'green' },
  { value: 'calcium_carbonate', label: 'كربونات الكالسيوم',   unit: 'كجم', color: 'blue' },
  { value: 'medicine',          label: 'دواء',                unit: 'مل',  color: 'red' },
  { value: 'disinfectant',      label: 'مطهر',                unit: 'مل',  color: 'purple' },
]

const ADDITIVE_REASONS = {
  molasses: ['مستوى الفلوك منخفض (< 25)', 'تنظيم C/N Ratio', 'دعم البكتيريا النافعة'],
  probiotics: ['تحسين جودة المياه', 'دعم النظام الحيوي', 'جدول أسبوعي منتظم'],
  calcium_carbonate: ['القلوية منخفضة (< 100 mg/L)', 'تنظيم pH', 'دعم البكتيريا'],
  medicine: ['علاج مرض', 'وقاية', 'تعليمات الطبيب البيطري'],
  disinfectant: ['تطهير دوري', 'بعد النفوق', 'وقاية'],
}

const ROUTINE_TASK_TYPES = [
  { value: 'waste_removal',     label: 'إزالة النفايات', unit: 'دقيقة', color: 'amber' },
  { value: 'diffuser_cleaning', label: 'تنظيف الديفيوزر', unit: 'عدد',   color: 'blue' },
  { value: 'water_change',      label: 'تغيير الماء',     unit: '%',    color: 'cyan' },
  { value: 'sorting',           label: 'فرز الأسماك',     unit: 'عدد',   color: 'purple' },
]

const ROUTINE_TASK_NOTES_HINTS = {
  waste_removal: 'سجل عدد الدقائق التي استغرقها التنظيف',
  diffuser_cleaning: 'عدد الديفيوزرات التي تم تنظيفها',
  water_change: 'النسبة المئوية للماء المتغير',
  sorting: 'عدد الأسماك المفروزة',
}

export default function OperationForm({ category = 'additive', pondId, defaultType, onClose, onSubmit }) {
  const { t } = useTranslation()
  const types = category === 'routine_task' ? ROUTINE_TASK_TYPES : ADDITIVE_TYPES

  const [formData, setFormData] = useState({
    type: defaultType || types[0].value,
    amount: '',
    reason: '',
    performedBy: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const typeInfo = types.find((x) => x.value === formData.type) || types[0]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const next = {}
    if (category === 'additive') {
      if (!formData.amount) next.amount = 'مطلوب'
      if (!formData.reason) next.reason = 'مطلوب'
    }
    // routine_task: amount is optional (some tasks are pure binary)
    if (!formData.performedBy) next.performedBy = 'مطلوب'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      let result
      if (category === 'additive') {
        result = await additivesAPI.create({
          pond_id: pondId,
          type: formData.type,
          amount: parseFloat(formData.amount),
          reason: formData.reason,
          added_by: formData.performedBy,
          notes: formData.notes || null,
        })
      } else {
        result = await routineTasksAPI.create({
          pond_id: pondId,
          task_type: formData.type,
          status: 'completed',
          performed_by: formData.performedBy,
          value: formData.amount ? parseFloat(formData.amount) : null,
          unit: typeInfo.unit || null,
          notes: formData.notes || null,
        })
      }
      if (onSubmit) onSubmit(result)
      onClose()
    } catch (error) {
      console.error('Error submitting operation:', error)
      setSubmitError(
        error.response?.data?.detail ||
        'فشل في حفظ البيانات. يرجى المحاولة مرة أخرى.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const headerIcon = category === 'routine_task' ? ClipboardCheck : Beaker
  const HeaderIcon = headerIcon
  const headerTitle = category === 'routine_task' ? 'تسجيل مهمة دورية' : 'إضافة مواد'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-${typeInfo.color}-50 rounded-lg flex items-center justify-center`}>
              <HeaderIcon className={`w-5 h-5 text-${typeInfo.color}-500`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{headerTitle}</h2>
              <p className="text-sm text-gray-600">حوض {pondId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type chooser */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {category === 'routine_task' ? 'نوع المهمة' : 'نوع المادة'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {types.map((tInfo) => (
                <button
                  key={tInfo.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: tInfo.value, reason: '' }))}
                  className={`p-4 rounded-lg border-2 transition-all text-start ${
                    formData.type === tInfo.value
                      ? `border-${tInfo.color}-500 bg-${tInfo.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{tInfo.label}</div>
                  <div className="text-xs text-gray-600 mt-1">الوحدة: {tInfo.unit}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount / Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {category === 'routine_task' ? 'القيمة' : 'الكمية'} ({typeInfo.unit}) {category === 'additive' && '*'}
            </label>
            <input
              type="number"
              step="0.1"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={`input ${errors.amount ? 'border-red-500' : ''}`}
              placeholder={`أدخل القيمة بـ ${typeInfo.unit}`}
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          {/* Reason — additives only */}
          {category === 'additive' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">السبب *</label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className={`input ${errors.reason ? 'border-red-500' : ''}`}
              >
                <option value="">اختر السبب</option>
                {ADDITIVE_REASONS[formData.type]?.map((reason, idx) => (
                  <option key={idx} value={reason}>{reason}</option>
                ))}
              </select>
              {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
            </div>
          )}

          {/* Guidelines — additives only */}
          {category === 'additive' && formData.type === 'molasses' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-900 mb-2">إرشادات المولاس:</p>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• أضف عندما يكون مستوى الفلوك {'<'} 25</li>
                <li>• توقف عن الإضافة عندما يصل الفلوك إلى 40</li>
                <li>• النطاق المثالي للفلوك: 30-35</li>
              </ul>
            </div>
          )}
          {category === 'additive' && formData.type === 'calcium_carbonate' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">إرشادات كربونات الكالسيوم:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• أضف عندما تنخفض القلوية عن 100 mg/L</li>
                <li>• النطاق المثالي: 120-150 mg/L</li>
                <li>• يساعد في تنظيم pH والتخلص من النيتروجين</li>
              </ul>
            </div>
          )}
          {category === 'additive' && formData.type === 'probiotics' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900 mb-2">إرشادات البروبيوتيكس:</p>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• الجدول الموصى به: مرة أسبوعياً</li>
                <li>• يحسن مستوى الفلوك في الأحواض</li>
                <li>• يدعم النظام الحيوي للمياه</li>
              </ul>
            </div>
          )}
          {category === 'routine_task' && ROUTINE_TASK_NOTES_HINTS[formData.type] && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">{ROUTINE_TASK_NOTES_HINTS[formData.type]}</p>
            </div>
          )}

          {/* Performed By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {category === 'routine_task' ? 'تم التنفيذ بواسطة' : 'تمت الإضافة بواسطة'} *
            </label>
            <input
              type="text"
              name="performedBy"
              value={formData.performedBy}
              onChange={handleChange}
              className={`input ${errors.performedBy ? 'border-red-500' : ''}`}
              placeholder="اسم المهندس"
            />
            {errors.performedBy && <p className="text-red-500 text-sm mt-1">{errors.performedBy}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="input"
              placeholder="أي ملاحظات إضافية..."
            />
          </div>

          {/* Error */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{submitError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="btn btn-secondary">
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'جاري الحفظ...' : (category === 'routine_task' ? 'حفظ المهمة' : 'حفظ الإضافة')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
