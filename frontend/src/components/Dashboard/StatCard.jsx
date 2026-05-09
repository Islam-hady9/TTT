import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ label, value, unit, change, trend, icon: Icon, status, statusLabel, tooltip }) {
  const isPositive = trend === 'up'

  // Status color mapping
  const statusColors = {
    excellent: 'bg-green-100 text-green-800 border-green-200',
    good: 'bg-blue-100 text-blue-800 border-blue-200',
    acceptable: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    poor: 'bg-red-100 text-red-800 border-red-200',
    unknown: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="stat-card relative group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="stat-label">{label}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="stat-value">{value}</span>
            {unit && <span className="text-lg text-gray-600">{unit}</span>}
          </div>
          
          {/* Status Badge */}
          {status && statusLabel && (
            <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-2 ${statusColors[status]}`}>
              {statusLabel}
            </div>
          )}
          
          {change && (
            <div className={`stat-change flex items-center gap-1 ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary-500" />
          </div>
        )}
      </div>
      
      {/* Tooltip */}
      {tooltip && (
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 w-64">
          <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
            {tooltip}
            <div className="absolute top-full left-4 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
