import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  LayoutDashboard, 
  Droplets, 
  TrendingUp, 
  Package, 
  FileText, 
  Settings,
  Fish,
  Layers,
  PackageCheck,
  BarChart3
} from 'lucide-react'

export default function Sidebar() {
  const { t } = useTranslation()

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/hatchery', icon: Droplets, label: t('nav.hatchery') },
    { path: '/growout', icon: Fish, label: t('nav.growout') },
    { path: '/fattening', icon: TrendingUp, label: t('nav.fattening') },
    { path: '/harvest', icon: PackageCheck, label: t('nav.harvest') },
    { path: '/batches', icon: Layers, label: t('nav.batches') },
    { path: '/analytics', icon: BarChart3, label: t('analytics.title') },
    { path: '/inventory', icon: Package, label: t('nav.inventory') },
    { path: '/reports', icon: FileText, label: t('nav.reports') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ]

  return (
    <aside className="w-64 bg-white border-e border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Fish className="w-8 h-8 text-primary-500" />
          <span className="text-xl font-bold text-gray-900">{t('app.title')}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>نظام إدارة مزارع الاستزراع المائي</p>
          <p className="mt-1">الإصدار 1.0.0</p>
        </div>
      </div>
    </aside>
  )
}
