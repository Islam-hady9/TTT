import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Fish, Lock, User, AlertCircle } from 'lucide-react'
import { authAPI } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await authAPI.login(formData.username, formData.password)
      
      // Store user info (token is already stored by authAPI.login)
      localStorage.setItem('user', JSON.stringify({
        username: formData.username
      }))
      
      // Redirect to dashboard
      navigate('/')
    } catch (err) {
      console.error('Login error:', err)
      setError(
        err.response?.data?.detail || 
        'فشل تسجيل الدخول. يرجى التحقق من اسم المستخدم وكلمة المرور.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Fish className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تبيان</h1>
          <p className="text-gray-600">نظام إدارة مزارع الأسماك</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المستخدم
            </label>
            <div className="relative">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input pr-10"
                placeholder="أدخل اسم المستخدم"
                required
                autoFocus
              />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input pr-10"
                placeholder="أدخل كلمة المرور"
                required
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center mb-2">للتجربة، استخدم:</p>
          <div className="text-xs text-gray-700 space-y-1">
            <p><strong>المستخدم:</strong> engineer1</p>
            <p><strong>كلمة المرور:</strong> password123</p>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            (يجب إنشاء المستخدم أولاً عبر API)
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>© 2026 تبيان - نظام إدارة مزارع الأسماك</p>
        </div>
      </div>
    </div>
  )
}
