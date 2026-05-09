import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Droplets, Fish, TrendingUp } from 'lucide-react'

export default function UnitCard({ name, type, ponds, activeBatches, totalFish, avgWeight, biomass, fcr, mortality }) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const getIcon = () => {
    switch (type) {
      case 'hatchery': return Droplets
      case 'growout': return Fish
      case 'fattening': return TrendingUp
      default: return Fish
    }
  }

  const Icon = getIcon()

  const getStatusColor = (value, type) => {
    if (type === 'fcr') {
      if (value <= 1.4) return 'text-green-600'
      if (value <= 1.7) return 'text-yellow-600'
      return 'text-red-600'
    }
    if (type === 'mortality') {
      const threshold = type === 'hatchery' ? 35 : 10
      if (value <= threshold * 0.5) return 'text-green-600'
      if (value <= threshold) return 'text-yellow-600'
      return 'text-red-600'
    }
    return 'text-gray-900'
  }

  return (
    <div className="card card-hover cursor-pointer" onClick={() => navigate(`/${type}`)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {ponds} {t('units.ponds')} • {activeBatches} {t('units.activeBatches')}
          </p>
        </div>
        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-600">{t('units.totalFish')}</p>
          <p className="text-lg font-semibold text-gray-900">{totalFish.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">{t('kpi.avgWeight')}</p>
          <p className="text-lg font-semibold text-gray-900">{avgWeight} {t('common.g')}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">{t('kpi.totalBiomass')}</p>
          <p className="text-lg font-semibold text-gray-900">{biomass} {t('common.kg')}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">{t('kpi.fcr')}</p>
          <p className={`text-lg font-semibold ${getStatusColor(fcr, 'fcr')}`}>{fcr}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600">{t('kpi.mortality')}</p>
          <p className={`text-sm font-semibold ${getStatusColor(mortality, 'mortality')}`}>
            {mortality}%
          </p>
        </div>
        <button className="flex items-center gap-2 text-primary-500 hover:text-primary-600 text-sm font-medium">
          {t('common.view')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
