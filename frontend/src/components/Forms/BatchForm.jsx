import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Package, X, Calendar } from 'lucide-react'

export default function BatchForm({ pondId, unitType, onClose, onSubmit }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    batchCode: '',
    stockingDate: new Date().toISOString().split('T')[0],
    fishCount: '',
    avgWeight: '',
    source: 'internal',
    supplier: '',
    stage: unitType === 'hatchery' ? 'fry' : unitType === 'growout' ? 'fingerling' : 'juvenile',
    notes: '',
    createdBy: ''
  })

  const [errors, setErrors] = useState({})

  const stages = {
    hatchery: [
      { value: 'eggs', label: 'بيض' },
      { value: 'fry', label: 'يرقات' },
      { value: 'fingerling', label: 'صغار' }
    ],
    growout: [
      { value: 'fingerling', label: 'صغار (1-30g)' },
      { value: 'juvenile', label: 'نمو (30-200g)' }
    ],
    fattening: [
      { value: 'juvenile', label: 'نمو (200-600g)' },
      { value: 'adult', label: 'تسمين (>350g)' }
    ]
  }

  const calculateBiomass = () => {
    if (!formData.fishCount || !formData.avgWeight) return null
    return ((parseFloat(formData.fishCount) * parseFloat(formData.avgWeight)) / 1000).toFixed(2)
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
    
    if (!formData.batchCode) newErrors.batchCode = 'مطلوب'
    if (!formData.stockingDate) newErrors.stockingDate = 'مطلوب'
    if (!formData.fishCount) newErrors.fishCount = 'مطلوب'
    if (!formData.avgWeight) newErrors.avgWeight = 'مطلوب'
    if (!formData.createdBy) newErrors.createdBy = 'مطلوب'
    if (formData.source === 'external' && !formData.supplier) {
      newErrors.supplier = 'مطلوب عند الشراء من مورد خارجي'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        ...formData,
        pondId,
        unitType,
        biomass: calculateBiomass(),
        timestamp: new Date().toISOString()
      })
    }
  }

  const biomass = calculateBiomass()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">إضافة دورة جديدة</h2>
              <p className="text-sm text-gray-600">حوض {pondId}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Batch Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كود الدورة *
            </label>
            <input
              type="text"
              name="batchCode"
              value={formData.batchCode}
              onChange={handleChange}
              className={`input ${errors.batchCode ? 'border-red-500' : ''}`}
              placeholder="مثال: 001, 002, 003"
            />
            <p className="text-xs text-gray-500 mt-1">
              كود فريد لتتبع الدورة من الإنزال حتى الحصاد
            </p>
            {errors.batchCode && <p className="text-red-500 text-sm mt-1">{errors.batchCode}</p>}
          </div>

          {/* Stocking Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ الإنزال *
            </label>
            <div className="relative">
              <input
                type="date"
                name="stockingDate"
                value={formData.stockingDate}
                onChange={handleChange}
                className={`input ${errors.stockingDate ? 'border-red-500' : ''}`}
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.stockingDate && <p className="text-red-500 text-sm mt-1">{errors.stockingDate}</p>}
          </div>

          {/* Fish Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عدد الأسماك *
            </label>
            <input
              type="number"
              name="fishCount"
              value={formData.fishCount}
              onChange={handleChange}
              className={`input ${errors.fishCount ? 'border-red-500' : ''}`}
              placeholder="أدخل العدد"
              min="0"
            />
            {errors.fishCount && <p className="text-red-500 text-sm mt-1">{errors.fishCount}</p>}
          </div>

          {/* Average Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              متوسط الوزن (جرام) *
            </label>
            <input
              type="number"
              step="0.1"
              name="avgWeight"
              value={formData.avgWeight}
              onChange={handleChange}
              className={`input ${errors.avgWeight ? 'border-red-500' : ''}`}
              placeholder="أدخل متوسط الوزن"
            />
            {errors.avgWeight && <p className="text-red-500 text-sm mt-1">{errors.avgWeight}</p>}
          </div>

          {/* Calculated Biomass */}
          {biomass && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 mb-1">الكتلة الحية المحسوبة</p>
              <p className="text-3xl font-bold text-blue-900">{biomass} كجم</p>
            </div>
          )}

          {/* Stage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المرحلة
            </label>
            <select
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              className="input"
            >
              {stages[unitType]?.map(stage => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المصدر
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, source: 'internal', supplier: '' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.source === 'internal'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">داخلي</div>
                  <div className="text-xs mt-1">من وحدة التحضين</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, source: 'external' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.source === 'external'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">خارجي</div>
                  <div className="text-xs mt-1">من مورد خارجي</div>
                </div>
              </button>
            </div>
          </div>

          {/* Supplier (if external) */}
          {formData.source === 'external' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المورد *
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className={`input ${errors.supplier ? 'border-red-500' : ''}`}
                placeholder="أدخل اسم المورد"
              />
              {errors.supplier && <p className="text-red-500 text-sm mt-1">{errors.supplier}</p>}
            </div>
          )}

          {/* Created By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تم الإنشاء بواسطة *
            </label>
            <input
              type="text"
              name="createdBy"
              value={formData.createdBy}
              onChange={handleChange}
              className={`input ${errors.createdBy ? 'border-red-500' : ''}`}
              placeholder="اسم المهندس"
            />
            {errors.createdBy && <p className="text-red-500 text-sm mt-1">{errors.createdBy}</p>}
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
              placeholder="أي ملاحظات حول الدورة..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              إنشاء الدورة
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
