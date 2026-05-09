import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Package, Plus, AlertTriangle, CheckCircle, Search, Edit2, Trash2, TrendingDown } from 'lucide-react'

const INITIAL_INVENTORY = [
  { id: 1, name: 'feed', category: 'feed', current: 2500, min: 1000, unit: 'kg', price: 12, lastUpdated: '2026-05-08' },
  { id: 2, name: 'medicines', category: 'medicines', current: 45, min: 50, unit: 'kg', price: 150, lastUpdated: '2026-05-07' },
  { id: 3, name: 'probiotics', category: 'probiotics', current: 120, min: 80, unit: 'kg', price: 85, lastUpdated: '2026-05-06' },
  { id: 4, name: 'molasses', category: 'molasses', current: 350, min: 500, unit: 'L', price: 8, lastUpdated: '2026-05-05' },
  { id: 5, name: 'disinfectants', category: 'disinfectants', current: 85, min: 60, unit: 'L', price: 25, lastUpdated: '2026-05-04' },
]

export default function Inventory() {
  const { t } = useTranslation()
  const [items, setItems] = useState(INITIAL_INVENTORY)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [newItem, setNewItem] = useState({ name: '', category: 'feed', current: '', min: '', unit: 'kg', price: '' })

  const getStatus = (item) => {
    if (item.current <= 0) return 'outOfStock'
    if (item.current < item.min) return 'lowStock'
    return 'inStock'
  }

  const statusConfig = {
    inStock: { color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle, iconColor: 'text-green-500' },
    lowStock: { color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: AlertTriangle, iconColor: 'text-yellow-500' },
    outOfStock: { color: 'text-red-700 bg-red-50 border-red-200', icon: AlertTriangle, iconColor: 'text-red-500' }
  }

  const filtered = items.filter(item => {
    if (!search) return true
    return t(`inventory.${item.name}`).toLowerCase().includes(search.toLowerCase())
  })

  const stats = {
    total: items.length,
    lowStock: items.filter(i => getStatus(i) === 'lowStock').length,
    outOfStock: items.filter(i => getStatus(i) === 'outOfStock').length,
    totalValue: items.reduce((sum, i) => sum + (i.current * i.price), 0)
  }

  const handleSave = () => {
    if (editItem) {
      setItems(items.map(i => i.id === editItem.id ? { ...editItem } : i))
      setEditItem(null)
    } else {
      const item = { ...newItem, id: Date.now(), current: Number(newItem.current), min: Number(newItem.min), price: Number(newItem.price), lastUpdated: new Date().toISOString().split('T')[0] }
      setItems([...items, item])
      setNewItem({ name: '', category: 'feed', current: '', min: '', unit: 'kg', price: '' })
      setShowAddModal(false)
    }
  }

  const handleDelete = (id) => {
    if (confirm('هل أنت متأكد من حذف هذه المادة؟')) {
      setItems(items.filter(i => i.id !== id))
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('inventory.title')}</h2>
          <p className="text-gray-600 mt-1">{t('inventory.subtitle')}</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {t('inventory.addItem')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">{t('inventory.totalItems')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">{t('inventory.lowStockItems')}</p>
          <p className={`text-2xl font-bold mt-1 ${stats.lowStock > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
            {stats.lowStock}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">{t('inventory.outOfStock')}</p>
          <p className={`text-2xl font-bold mt-1 ${stats.outOfStock > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {stats.outOfStock}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">{t('inventory.totalValue')}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats.totalValue.toLocaleString()} <span className="text-sm text-gray-500">{t('common.sar')}</span>
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={t('common.search') + '...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pr-10"
        />
      </div>

      {/* Inventory Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-600 uppercase">{t('inventory.category')}</th>
                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-600 uppercase">{t('inventory.currentStock')}</th>
                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-600 uppercase">{t('inventory.minRequired')}</th>
                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-600 uppercase">{t('inventory.stockLevel')}</th>
                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-600 uppercase">{t('pond.status')}</th>
                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-600 uppercase">{t('inventory.lastUpdated')}</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => {
                const status = getStatus(item)
                const config = statusConfig[status]
                const percentage = Math.min(100, (item.current / item.min) * 100)
                const StatusIcon = config.icon

                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                          <Package className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-900">{t(`inventory.${item.name}`)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {item.current.toLocaleString()} {item.unit}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.min.toLocaleString()} {item.unit}</td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-[120px]">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${percentage >= 100 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{Math.round(percentage)}%</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge border ${config.color}`}>
                        <StatusIcon className={`w-3 h-3 me-1 ${config.iconColor}`} />
                        {t(`inventory.${status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.lastUpdated}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setEditItem({ ...item })} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title={t('common.edit')}>
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors" title={t('common.delete')}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editItem) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => { setShowAddModal(false); setEditItem(null) }}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editItem ? t('common.edit') : t('inventory.addItem')}
            </h3>
            <div className="space-y-4">
              {!editItem && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                  <input className="input" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="اسم المادة" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.currentStock')}</label>
                  <input type="number" className="input" value={editItem ? editItem.current : newItem.current} onChange={e => editItem ? setEditItem({...editItem, current: Number(e.target.value)}) : setNewItem({...newItem, current: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.minRequired')}</label>
                  <input type="number" className="input" value={editItem ? editItem.min : newItem.min} onChange={e => editItem ? setEditItem({...editItem, min: Number(e.target.value)}) : setNewItem({...newItem, min: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="btn btn-primary flex-1">{t('common.save')}</button>
              <button onClick={() => { setShowAddModal(false); setEditItem(null) }} className="btn btn-secondary flex-1">{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
