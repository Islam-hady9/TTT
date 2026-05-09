import { useTranslation } from 'react-i18next'
import { Droplet, AlertTriangle, CheckCircle } from 'lucide-react'

export default function WaterQualityCard({ data }) {
  const { t } = useTranslation()

  const getStatusIcon = (status) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Droplet className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{t('waterQuality.title')}</h3>
        </div>
        <span className="text-xs text-gray-500">آخر تحديث: منذ 15 دقيقة</span>
      </div>

      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 flex-1">
              {getStatusIcon(item.status)}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {t(`waterQuality.${item.parameter}`)}
                </p>
                <p className="text-xs text-gray-600">
                  {t('waterQuality.status.optimal')}: {item.min} - {item.max} {item.unit}
                </p>
              </div>
            </div>
            <div className="text-end">
              <p className="text-lg font-semibold text-gray-900">
                {item.value} {item.unit}
              </p>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(item.status)}`}>
                {t(`waterQuality.status.${item.status}`)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
