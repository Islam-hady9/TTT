import { useTranslation } from 'react-i18next'
import { Package, AlertCircle } from 'lucide-react'

export default function InventoryCard({ data }) {
  const { t } = useTranslation()

  const getStatusColor = (status) => {
    switch (status) {
      case 'inStock':
        return 'bg-green-100 text-green-800'
      case 'lowStock':
        return 'bg-yellow-100 text-yellow-800'
      case 'outOfStock':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPercentage = (current, min) => {
    return Math.round((current / min) * 100)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{t('inventory.title')}</h3>
        </div>
        <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
          {t('common.view')}
        </button>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = getPercentage(item.current, item.min)
          const isLow = item.status === 'lowStock'

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  {isLow && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {item.current} {item.unit}
                  </span>
                  <span className={`badge ${getStatusColor(item.status)}`}>
                    {t(`inventory.${item.status}`)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isLow ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600">
                الحد الأدنى: {item.min} {item.unit}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
