import { useState, useRef } from 'react'
import { X, AlertCircle, FileSpreadsheet, Save, Droplet, Utensils } from 'lucide-react'
import { waterQualityAPI, feedingAPI } from '../../services/api'

// Column definitions per mode. `unit` is purely cosmetic; `required` controls validation.
const COLUMNS = {
  water_quality: [
    { key: 'do',          label: 'DO',     unit: 'mg/L', step: '0.1', required: true,  optimal: [6, 8] },
    { key: 'ph',          label: 'pH',     unit: '',     step: '0.1', required: true,  optimal: [7, 8.3] },
    { key: 'temperature', label: 'الحرارة', unit: '°C',  step: '0.1', required: true,  optimal: [25, 30] },
    { key: 'tan',         label: 'TAN',    unit: 'mg/L', step: '0.1', required: false, optimal: [0, 0.5] },
    { key: 'alkalinity',  label: 'القلوية', unit: 'mg/L',step: '1',   required: false, optimal: [120, 150] },
    { key: 'floc',        label: 'الفلوك', unit: '',     step: '0.5', required: false, optimal: [30, 35] },
    { key: 'ammonia',     label: 'الأمونيا',unit: 'mg/L',step: '0.01',required: false, optimal: [0, 0.05] },
  ],
  feeding: [
    { key: 'feed_amount',   label: 'الكمية',     unit: 'كجم', step: '0.1', required: true },
    { key: 'feed_type',     label: 'النوع',       unit: '',    step: null,  required: true,  options: ['starter', 'grower', 'finisher', 'fattening'] },
    { key: 'feeding_time',  label: 'الوقت',       unit: 'HH:MM', step: null, required: true },
    { key: 'duration',      label: 'المدة',       unit: 'دقيقة', step: '1',  required: false },
    { key: 'consumption',   label: 'الاستهلاك',   unit: '',    step: null,  required: false, options: ['full', 'partial', 'poor'] },
  ],
}

const MODE_META = {
  water_quality: { title: 'تسجيل جودة المياه — جماعي', icon: Droplet,  byField: 'measured_by',  notesField: 'notes' },
  feeding:       { title: 'تسجيل التغذية — جماعي',     icon: Utensils, byField: 'fed_by',       notesField: 'notes' },
}

export default function BulkEntryGrid({ unitType, ponds = [], onClose, onSubmit }) {
  const [mode, setMode] = useState('water_quality')
  const [performedBy, setPerformedBy] = useState('')
  const [rows, setRows] = useState(() => makeEmptyRows(ponds))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const inputRefs = useRef({}) // { `${pondId}:${colKey}`: ref }

  function makeEmptyRows(ps) {
    const out = {}
    for (const p of ps) out[p.id] = {}
    return out
  }

  const cols = COLUMNS[mode]
  const meta = MODE_META[mode]
  const Icon = meta.icon

  const setCell = (pondId, key, value) => {
    setRows((prev) => ({ ...prev, [pondId]: { ...prev[pondId], [key]: value } }))
  }

  // Tab moves right (default), Enter moves down to next pond, same column
  const onKeyDown = (e, pondIdx, colKey) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const nextPond = ponds[pondIdx + 1]
      if (nextPond) {
        const ref = inputRefs.current[`${nextPond.id}:${colKey}`]
        ref?.focus()
      }
    }
  }

  const cellStatus = (col, raw) => {
    if (!col.optimal || raw === '' || raw == null) return ''
    const v = parseFloat(raw)
    if (Number.isNaN(v)) return ''
    const [lo, hi] = col.optimal
    if (v < lo || v > hi) return 'border-amber-400 bg-amber-50'
    return 'border-green-300 bg-green-50'
  }

  const buildRecords = () => {
    const records = []
    for (const pond of ponds) {
      const r = rows[pond.id] || {}
      const filled = cols.some((c) => r[c.key] !== undefined && r[c.key] !== '')
      if (!filled) continue // skip blank rows
      // Validate required
      for (const c of cols) {
        if (c.required && (r[c.key] === undefined || r[c.key] === '')) {
          throw new Error(`الحقل "${c.label}" مطلوب لحوض ${pond.pond_code}`)
        }
      }
      const record = { pond_id: pond.id, [meta.byField]: performedBy }
      for (const c of cols) {
        if (r[c.key] === undefined || r[c.key] === '') continue
        record[c.key] = c.step ? parseFloat(r[c.key]) : r[c.key]
      }
      records.push(record)
    }
    return records
  }

  const handleSubmit = async () => {
    setError(null)
    if (!performedBy) {
      setError('أدخل اسم المنفذ أولاً')
      return
    }
    let records
    try {
      records = buildRecords()
    } catch (e) {
      setError(e.message)
      return
    }
    if (!records.length) {
      setError('لم يتم إدخال أي صف')
      return
    }
    setSubmitting(true)
    try {
      if (mode === 'water_quality') await waterQualityAPI.bulkCreate(records)
      else await feedingAPI.bulkCreate(records)
      onSubmit?.()
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{meta.title}</h2>
              <p className="text-sm text-gray-600">
                <FileSpreadsheet className="inline w-3 h-3 mx-1" />
                {ponds.length} حوض - {unitType}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Mode + performedBy */}
        <div className="border-b border-gray-200 px-6 py-3 flex items-center gap-4 flex-wrap">
          <div className="inline-flex items-center gap-2">
            <span className="text-sm text-gray-700">النوع:</span>
            <div className="inline-flex border border-gray-300 rounded overflow-hidden">
              {['water_quality', 'feeding'].map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setRows(makeEmptyRows(ponds)) }}
                  className={`px-3 py-1 text-sm ${mode === m ? 'bg-primary-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  {m === 'water_quality' ? 'جودة المياه' : 'التغذية'}
                </button>
              ))}
            </div>
          </div>
          <input
            type="text"
            placeholder="اسم المنفذ"
            value={performedBy}
            onChange={(e) => setPerformedBy(e.target.value)}
            className="input w-48"
          />
        </div>

        {/* Grid */}
        <div className="overflow-auto flex-1 p-2">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr>
                <th className="text-start py-2 px-3 font-medium text-gray-700 border-b border-gray-200">الحوض</th>
                {cols.map((c) => (
                  <th key={c.key} className="text-center py-2 px-3 font-medium text-gray-700 border-b border-gray-200">
                    {c.label}
                    {c.unit && <div className="text-xs text-gray-400 font-normal">{c.unit}</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ponds.map((pond, idx) => (
                <tr key={pond.id} className="hover:bg-gray-50">
                  <td className="py-1 px-3 font-medium text-gray-900 border-b border-gray-100">
                    {pond.pond_code}
                  </td>
                  {cols.map((c) => {
                    const value = rows[pond.id]?.[c.key] ?? ''
                    if (c.options) {
                      return (
                        <td key={c.key} className="py-1 px-1 border-b border-gray-100">
                          <select
                            ref={(el) => { inputRefs.current[`${pond.id}:${c.key}`] = el }}
                            value={value}
                            onChange={(e) => setCell(pond.id, c.key, e.target.value)}
                            onKeyDown={(e) => onKeyDown(e, idx, c.key)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-center text-xs"
                          >
                            <option value="">—</option>
                            {c.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </td>
                      )
                    }
                    return (
                      <td key={c.key} className="py-1 px-1 border-b border-gray-100">
                        <input
                          ref={(el) => { inputRefs.current[`${pond.id}:${c.key}`] = el }}
                          type={c.step ? 'number' : 'text'}
                          step={c.step || undefined}
                          value={value}
                          onChange={(e) => setCell(pond.id, c.key, e.target.value)}
                          onKeyDown={(e) => onKeyDown(e, idx, c.key)}
                          className={`w-full px-2 py-1 border rounded text-center text-xs ${cellStatus(c, value) || 'border-gray-300'}`}
                          placeholder={c.unit || ''}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-3 flex items-center justify-between flex-wrap gap-3">
          {error ? (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              Tab للحقل التالي • Enter للحوض التالي • صفوف فارغة سيتم تجاهلها
            </p>
          )}
          <div className="flex items-center gap-2">
            <button onClick={onClose} disabled={submitting} className="btn btn-secondary">إلغاء</button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'جاري الحفظ...' : 'حفظ الكل'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
