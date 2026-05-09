import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Bell, X, CheckCheck, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { alertsAPI } from '../../services/api'

export default function AlertBell() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  // Fetch unread alerts
  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const data = await alertsAPI.getUnread(10) // Get last 10 unread alerts
      setAlerts(data)
      setUnreadCount(data.filter(alert => !alert.is_read).length)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Poll for new alerts every 30 seconds
  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  // Mark alert as read and navigate
  const handleAlertClick = async (alert) => {
    try {
      // Mark as read
      if (!alert.is_read) {
        await alertsAPI.markRead(alert.id)
      }

      // Navigate to relevant page
      if (alert.batch_id) {
        // Navigate to batch management
        navigate(`/batches`)
      }

      // Close dropdown and refresh alerts
      setIsOpen(false)
      fetchAlerts()
    } catch (error) {
      console.error('Error handling alert click:', error)
    }
  }

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      const unreadIds = alerts.filter(a => !a.is_read).map(a => a.id)
      if (unreadIds.length > 0) {
        await alertsAPI.markMultipleRead(unreadIds)
        fetchAlerts()
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  // Get severity icon and color
  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        }
      case 'info':
      default:
        return {
          icon: Info,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        }
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) {
      return t('alerts.justNow')
    } else if (diffMins < 60) {
      return `${diffMins} ${t('alerts.minutesAgo')}`
    } else if (diffHours < 24) {
      return `${diffHours} ${t('alerts.hoursAgo')}`
    } else if (diffDays < 7) {
      return `${diffDays} ${t('alerts.daysAgo')}`
    } else {
      return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={t('alerts.notifications')}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 end-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 end-0 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              {t('alerts.notifications')}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  {t('alerts.markAllRead')}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Alert List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                {t('common.loading')}
              </div>
            ) : alerts.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{t('alerts.noAlerts')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {alerts.map((alert) => {
                  const config = getSeverityConfig(alert.severity)
                  const Icon = config.icon

                  return (
                    <button
                      key={alert.id}
                      onClick={() => handleAlertClick(alert)}
                      className={`w-full px-4 py-3 text-start hover:bg-gray-50 transition-colors ${
                        !alert.is_read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!alert.is_read ? 'font-semibold' : 'font-medium'} text-gray-900 mb-1`}>
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTimestamp(alert.created_at)}
                          </p>
                        </div>

                        {/* Unread indicator */}
                        {!alert.is_read && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {alerts.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  navigate('/batches')
                  setIsOpen(false)
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {t('alerts.viewAll')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
