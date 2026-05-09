import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Loader, AlertTriangle } from 'lucide-react'
import { routineTasksAPI } from '../../services/api'

// Daily binary tasks tracked per pond. The unit defines what is logged
// alongside the boolean (e.g. minutes spent, % water changed).
const TASKS = [
  { key: 'waste_removal',     label: 'إزالة النفايات', unit: 'دقيقة' },
  { key: 'diffuser_cleaning', label: 'تنظيف الديفيوزر', unit: 'عدد' },
  { key: 'water_change',      label: 'تغيير الماء',     unit: '%' },
]

export default function DailyTaskChecklist({ unitType, ponds, onChange }) {
  const [todayTasks, setTodayTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [performedBy, setPerformedBy] = useState('')

  useEffect(() => {
    if (unitType) loadToday()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitType])

  const loadToday = async () => {
    try {
      setLoading(true)
      const data = await routineTasksAPI.getTodayByUnit(unitType)
      setTodayTasks(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Already completed today? lookup by (pond_id, task_type)
  const isDone = (pondId, taskKey) =>
    todayTasks.some((t) => t.pond_id === pondId && t.task_type === taskKey)

  // Past noon local time and not done = visual warning
  const pastNoon = new Date().getHours() >= 12

  const submitOne = async (pond, taskKey, valueRaw) => {
    if (isDone(pond.id, taskKey)) return
    if (!performedBy) {
      setError('أدخل اسم المنفذ أولاً')
      return
    }
    const value = valueRaw && !Number.isNaN(parseFloat(valueRaw)) ? parseFloat(valueRaw) : null
    const unit = TASKS.find((t) => t.key === taskKey)?.unit || null
    try {
      await routineTasksAPI.create({
        pond_id: pond.id,
        task_type: taskKey,
        status: 'completed',
        performed_by: performedBy,
        value,
        unit,
        notes: null,
      })
      await loadToday()
      onChange?.()
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
    }
  }

  const markAll = async () => {
    if (!performedBy) {
      setError('أدخل اسم المنفذ أولاً')
      return
    }
    try {
      setSubmitting(true)
      // Create rows for every (pond, task) pair that isn't already done today
      const tasks = []
      for (const pond of ponds) {
        for (const t of TASKS) {
          if (!isDone(pond.id, t.key)) {
            tasks.push({
              pond_id: pond.id,
              task_type: t.key,
              status: 'completed',
              performed_by: performedBy,
              value: null,
              unit: t.unit,
              notes: null,
            })
          }
        }
      }
      if (tasks.length) {
        await routineTasksAPI.bulkCreate(tasks)
      }
      await loadToday()
      onChange?.()
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!ponds?.length) return null

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">قائمة المهام اليومية</h3>
          <p className="text-sm text-gray-600">انقر على الخلية لتسجيل المهمة (يتم حساب الوقت تلقائياً)</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="اسم المنفذ"
            value={performedBy}
            onChange={(e) => setPerformedBy(e.target.value)}
            className="input w-40"
          />
          <button
            type="button"
            onClick={markAll}
            disabled={submitting}
            className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            تسجيل الكل لليوم
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-start py-2 px-3 font-medium text-gray-700">الحوض</th>
                {TASKS.map((t) => (
                  <th key={t.key} className="text-center py-2 px-3 font-medium text-gray-700">
                    {t.label}
                    <div className="text-xs text-gray-400 font-normal">{t.unit}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ponds.map((pond) => (
                <tr key={pond.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium text-gray-900">{pond.pond_code}</td>
                  {TASKS.map((task) => {
                    const done = isDone(pond.id, task.key)
                    return (
                      <td key={task.key} className="py-2 px-3 text-center">
                        <DailyTaskCell
                          done={done}
                          pastNoon={pastNoon}
                          unit={task.unit}
                          onSubmit={(valueRaw) => submitOne(pond, task.key, valueRaw)}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function DailyTaskCell({ done, pastNoon, unit, onSubmit }) {
  const [value, setValue] = useState('')
  if (done) {
    return (
      <div className="inline-flex items-center gap-1 text-green-600">
        <CheckCircle2 className="w-5 h-5" />
        <span className="text-xs">تم</span>
      </div>
    )
  }
  return (
    <div className="inline-flex items-center gap-1">
      <input
        type="number"
        step="0.1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={unit}
        className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-xs"
      />
      <button
        type="button"
        onClick={() => onSubmit(value)}
        className={`p-1 rounded hover:bg-gray-200 ${pastNoon ? 'text-amber-500' : 'text-gray-400'}`}
        title={pastNoon ? 'لم يتم التسجيل بعد الظهر' : 'تسجيل'}
      >
        <Circle className="w-5 h-5" />
      </button>
    </div>
  )
}
