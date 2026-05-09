import { Info } from 'lucide-react'

export default function FCRIndicator({ fcr, showLabel = true, size = 'md' }) {
  // Determine FCR status
  const getFCRStatus = (value) => {
    if (!value || value === 0) return { status: 'unknown', color: 'gray', label: 'N/A', labelAr: 'غير متاح' }
    if (value < 1.2) return { status: 'excellent', color: 'green', label: 'Excellent', labelAr: 'ممتاز' }
    if (value <= 1.5) return { status: 'good', color: 'blue', label: 'Good', labelAr: 'جيد' }
    if (value <= 1.8) return { status: 'acceptable', color: 'yellow', label: 'Acceptable', labelAr: 'مقبول' }
    return { status: 'poor', color: 'red', label: 'Poor', labelAr: 'ضعيف' }
  }

  const status = getFCRStatus(fcr)

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  // Color classes
  const colorClasses = {
    excellent: 'bg-green-100 text-green-800 border-green-300',
    good: 'bg-blue-100 text-blue-800 border-blue-300',
    acceptable: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    poor: 'bg-red-100 text-red-800 border-red-300',
    unknown: 'bg-gray-100 text-gray-600 border-gray-300'
  }

  if (!showLabel) {
    return (
      <span className={`inline-flex items-center justify-center w-3 h-3 rounded-full ${
        status.status === 'excellent' ? 'bg-green-500' :
        status.status === 'good' ? 'bg-blue-500' :
        status.status === 'acceptable' ? 'bg-yellow-500' :
        status.status === 'poor' ? 'bg-red-500' :
        'bg-gray-400'
      }`} />
    )
  }

  return (
    <div className="inline-flex items-center gap-1 group relative">
      <span className={`inline-flex items-center rounded-full border font-medium ${sizeClasses[size]} ${colorClasses[status.status]}`}>
        {status.labelAr}
      </span>
      
      {/* Tooltip */}
      <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 z-20 w-64">
        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl">
          <div className="font-semibold mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span>معامل التحويل الغذائي (FCR)</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              <span>ممتاز: {'<'} 1.2</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>جيد: 1.2 - 1.5</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              <span>مقبول: 1.5 - 1.8</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span>ضعيف: {'>'} 1.8</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-700 text-xs">
            <strong>المعادلة:</strong> FCR = العلف المستخدم / الوزن المكتسب
          </div>
          <div className="mt-1 text-xs text-gray-300">
            كل ما الرقم يقل → الكفاءة أعلى
          </div>
          {fcr > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="text-xs">
                <strong>القيمة الحالية:</strong> {fcr.toFixed(2)}
              </div>
            </div>
          )}
          <div className="absolute top-full left-4 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// FCR Reference Card Component
export function FCRReferenceCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-5 h-5 text-primary-500" />
        <h3 className="font-semibold text-gray-900">معامل التحويل الغذائي (FCR)</h3>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
          <span className="font-medium text-green-900">ممتاز (Excellent)</span>
          <span className="text-green-700">{'<'} 1.2</span>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
          <span className="font-medium text-blue-900">جيد (Good)</span>
          <span className="text-blue-700">1.2 - 1.5</span>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
          <span className="font-medium text-yellow-900">مقبول (Acceptable)</span>
          <span className="text-yellow-700">1.5 - 1.8</span>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
          <span className="font-medium text-red-900">ضعيف (Poor)</span>
          <span className="text-red-700">{'>'} 1.8</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-700 space-y-1">
          <div><strong>المعادلة:</strong></div>
          <div className="font-mono text-xs bg-gray-50 p-2 rounded">
            FCR = كمية العلف المستخدمة (طن) / كمية الأسماك المنتجة (طن)
          </div>
          <div className="text-xs text-gray-600 mt-2">
            💡 كل ما الرقم يقل → الكفاءة أعلى
          </div>
        </div>
      </div>
    </div>
  )
}
