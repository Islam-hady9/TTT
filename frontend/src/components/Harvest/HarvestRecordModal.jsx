import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Package, DollarSign, User, Calendar, FileText } from 'lucide-react'
import { harvestsAPI } from '../../services/api'

export default function HarvestRecordModal({ batch, onClose, onSuccess }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    harvest_count: batch?.current_count || 0,
    avg_weight: batch?.avg_weight || 0,
    price_per_kg: '',
    buyer_name: '',
    notes: '',
    harvest_date: new Date().toISOString().slice(0, 16)
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Get current user
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      const harvestData = {
        batch_id: batch.id,
        harvest_count: parseInt(formData.harvest_count),
        avg_weight: parseFloat(formData.avg_weight),
        price_per_kg: formData.price_per_kg ? parseFloat(formData.price_per_kg) : null,
        buyer_name: formData.buyer_name || null,
        notes: formData.notes || null,
        harvested_by: user.username || 'unknown',
        harvest_date: new Date(formData.harvest_date).toISOString()
      }

      console.log('Submitting harvest data:', harvestData)
      
      const result = await harvestsAPI.create(harvestData)
      
      console.log('Harvest created successfully:', result)
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      onClose()
    } catch (err) {
      console.error('Error creating harvest:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to create harvest')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Calculate total weight and revenue
  const totalWeight = (formData.harvest_count * formData.avg_weight / 1000).toFixed(2)
  const totalRevenue = formData.price_per_kg 
    ? (totalWeight * formData.price_per_kg).toFixed(2)
    : '0.00'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('harvest.recordHarvest')}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {t('harvest.batch')}: {batch?.batch_code}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Batch Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              {t('harvest.batchInfo')}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-blue-700">{t('harvest.currentCount')}:</span>
                <span className="font-semibold text-blue-900 ml-2">
                  {batch?.current_count?.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-blue-700">{t('harvest.avgWeight')}:</span>
                <span className="font-semibold text-blue-900 ml-2">
                  {batch?.avg_weight?.toFixed(1)}g
                </span>
              </div>
              <div>
                <span className="text-blue-700">{t('harvest.biomass')}:</span>
                <span className="font-semibold text-blue-900 ml-2">
                  {((batch?.biomass || 0) / 1000).toFixed(1)} kg
                </span>
              </div>
              <div>
                <span className="text-blue-700">FCR:</span>
                <span className="font-semibold text-blue-900 ml-2">
                  {batch?.fcr?.toFixed(2) || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Harvest Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="w-4 h-4 inline mr-1" />
              {t('harvest.harvestCount')} *
            </label>
            <input
              type="number"
              value={formData.harvest_count}
              onChange={(e) => handleChange('harvest_count', e.target.value)}
              min="10"
              max={batch?.current_count}
              required
              className="input w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('harvest.maxCount')}: {batch?.current_count?.toLocaleString()}
            </p>
          </div>

          {/* Average Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('harvest.avgWeight')} (g) *
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.avg_weight}
              onChange={(e) => handleChange('avg_weight', e.target.value)}
              min="100"
              max="1000"
              required
              className="input w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('harvest.optimalRange')}
            </p>
          </div>

          {/* Price per kg */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              {t('harvest.pricePerKg')} (SAR)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price_per_kg}
              onChange={(e) => handleChange('price_per_kg', e.target.value)}
              min="0"
              className="input w-full"
              placeholder="25.00"
            />
          </div>

          {/* Buyer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              {t('harvest.buyerName')}
            </label>
            <input
              type="text"
              value={formData.buyer_name}
              onChange={(e) => handleChange('buyer_name', e.target.value)}
              maxLength="200"
              className="input w-full"
              placeholder={t('harvest.buyerPlaceholder')}
            />
          </div>

          {/* Harvest Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              {t('harvest.harvestDate')} *
            </label>
            <input
              type="datetime-local"
              value={formData.harvest_date}
              onChange={(e) => handleChange('harvest_date', e.target.value)}
              required
              className="input w-full"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              {t('harvest.notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows="3"
              className="input w-full"
              placeholder={t('harvest.notesPlaceholder')}
            />
          </div>

          {/* Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">
              {t('harvest.summary')}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-green-700">{t('harvest.totalWeight')}:</span>
                <span className="font-semibold text-green-900 ml-2">
                  {totalWeight} kg
                </span>
              </div>
              <div>
                <span className="text-green-700">{t('harvest.totalRevenue')}:</span>
                <span className="font-semibold text-green-900 ml-2">
                  {totalRevenue} SAR
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t('harvest.recording')}...
                </span>
              ) : (
                t('harvest.confirmHarvest')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
