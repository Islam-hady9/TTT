import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Download, Calendar, TrendingUp, Fish, Droplet, Package, BarChart3 } from 'lucide-react'
import { batchesAPI } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const REPORT_TYPES = [
  { id: 'batchPerformance', icon: Fish, color: 'bg-blue-100 text-blue-600' },
  { id: 'feedingReport', icon: BarChart3, color: 'bg-green-100 text-green-600' },
  { id: 'mortalityReport', icon: TrendingUp, color: 'bg-red-100 text-red-600' },
  { id: 'waterQualityReport', icon: Droplet, color: 'bg-cyan-100 text-cyan-600' },
  { id: 'harvestReport', icon: Package, color: 'bg-purple-100 text-purple-600' },
]

const CHART_COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2']

export default function Reports() {
  const { t } = useTranslation()
  const [selectedReport, setSelectedReport] = useState('batchPerformance')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await batchesAPI.getAll()
      setBatches(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading report data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const activeBatches = batches.filter(b => b.status === 'active')
  const harvestedBatches = batches.filter(b => b.status === 'harvested')
  const batchesWithFCR = activeBatches.filter(b => b.fcr && b.fcr > 0)
  const avgFCR = batchesWithFCR.length > 0 ? (batchesWithFCR.reduce((s, b) => s + b.fcr, 0) / batchesWithFCR.length) : 0
  const totalFish = activeBatches.reduce((s, b) => s + (b.current_count || 0), 0)
  const totalBiomass = activeBatches.reduce((s, b) => s + (b.biomass || 0), 0) / 1000

  // Chart data
  const stageDistribution = (() => {
    const stages = {}
    activeBatches.forEach(b => {
      const stage = b.stage || 'unknown'
      stages[stage] = (stages[stage] || 0) + 1
    })
    return Object.entries(stages).map(([name, value]) => ({ name: t(`stages.${name}`), value }))
  })()

  const batchPerformanceData = activeBatches.slice(0, 8).map(b => ({
    name: b.batch_code?.substring(0, 8) || `B${b.id}`,
    weight: Math.round(b.avg_weight || 0),
    fcr: b.fcr ? parseFloat(b.fcr.toFixed(2)) : 0,
    fish: b.current_count || 0
  }))

  const stats = [
    { label: t('reports.totalBatches'), value: activeBatches.length, sub: t('status.active') },
    { label: t('reports.avgFCR'), value: avgFCR > 0 ? avgFCR.toFixed(2) : 'N/A', sub: avgFCR < 1.5 ? '✓ جيد' : avgFCR > 0 ? '⚠ يحتاج تحسين' : '' },
    { label: t('units.totalFish'), value: totalFish.toLocaleString(), sub: t('batchManagement.fish') },
    { label: t('kpi.totalBiomass'), value: `${totalBiomass.toFixed(0)}`, sub: t('common.kg') },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h2>
          <p className="text-gray-600 mt-1">{t('reports.subtitle')}</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="card">
            <p className="text-sm text-gray-600">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {REPORT_TYPES.map(rt => (
          <button
            key={rt.id}
            onClick={() => setSelectedReport(rt.id)}
            className={`card p-4 flex flex-col items-center gap-2 cursor-pointer transition-all ${selectedReport === rt.id ? 'ring-2 ring-primary-500 border-primary-300' : 'hover:border-gray-300'}`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${rt.color}`}>
              <rt.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-gray-700 text-center">{t(`reports.${rt.id}`)}</span>
          </button>
        ))}
      </div>

      {/* Date Range */}
      <div className="card">
        <div className="flex items-center gap-4 flex-wrap">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{t('reports.selectDateRange')}:</span>
          <input type="date" className="input max-w-[180px]" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
          <span className="text-gray-400">→</span>
          <input type="date" className="input max-w-[180px]" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
        </div>
      </div>

      {/* Charts */}
      {loading ? (
        <div className="card flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Batch Performance */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedReport === 'batchPerformance' ? t('kpi.avgWeight') + ' / FCR' : t(`reports.${selectedReport}`)}
            </h3>
            {batchPerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={batchPerformanceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  />
                  <Bar dataKey="weight" fill="#1890ff" radius={[4, 4, 0, 0]} name={t('kpi.avgWeight') + ' (g)'} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p>{t('common.noData')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Pie Chart - Stage Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع المراحل</h3>
            {stageDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stageDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {stageDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p>{t('common.noData')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
