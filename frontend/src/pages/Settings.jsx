import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings as SettingsIcon, User, Bell, Palette, Shield, Save, Check, Globe, Droplet, AlertTriangle, Package } from 'lucide-react'

export default function Settings() {
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState('general')
  const [saved, setSaved] = useState(false)

  const [farmSettings, setFarmSettings] = useState({
    farmName: 'مزرعة الإنتاج الوطني',
    farmLocation: 'المملكة العربية السعودية',
    ownerName: 'أحمد محمد',
    phone: '+966 5x xxx xxxx',
    email: 'admin@tibyan.com',
  })

  const [notifications, setNotifications] = useState({
    waterQuality: true,
    mortality: true,
    inventory: true,
    harvest: true,
    email: false,
  })

  const [thresholds, setThresholds] = useState({
    doMin: 6.0, doMax: 8.0,
    phMin: 7.0, phMax: 8.3,
    tempMin: 25, tempMax: 30,
    tanMax: 0.5,
    mortalityAlert: 5,
    lowStockPercent: 30,
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const tabs = [
    { id: 'general', label: t('settings.general'), icon: SettingsIcon },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'thresholds', label: t('settings.thresholds'), icon: Shield },
    { id: 'appearance', label: t('settings.appearance'), icon: Palette },
    { id: 'about', label: t('settings.about'), icon: AlertTriangle },
  ]

  const toggleLang = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(newLang)
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = newLang
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h2>
        <p className="text-gray-600 mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="card p-2 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* General */}
          {activeTab === 'general' && (
            <div className="card space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('settings.farmProfile')}</h3>
                  <p className="text-sm text-gray-500">معلومات المزرعة الأساسية</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.farmName')}</label>
                  <input className="input" value={farmSettings.farmName} onChange={e => setFarmSettings({...farmSettings, farmName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.farmLocation')}</label>
                  <input className="input" value={farmSettings.farmLocation} onChange={e => setFarmSettings({...farmSettings, farmLocation: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم المالك</label>
                  <input className="input" value={farmSettings.ownerName} onChange={e => setFarmSettings({...farmSettings, ownerName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                  <input className="input" value={farmSettings.phone} onChange={e => setFarmSettings({...farmSettings, phone: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                  <input className="input" value={farmSettings.email} onChange={e => setFarmSettings({...farmSettings, email: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="card space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('settings.notifications')}</h3>
                  <p className="text-sm text-gray-500">إدارة تنبيهات وإشعارات النظام</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'waterQuality', icon: Droplet, label: t('settings.waterQualityAlerts'), desc: 'تنبيه عند خروج معايير المياه عن النطاق الطبيعي', color: 'text-blue-600' },
                  { key: 'mortality', icon: AlertTriangle, label: t('settings.mortalityAlerts'), desc: 'تنبيه عند ارتفاع معدل النفوق فوق الحد المقبول', color: 'text-red-600' },
                  { key: 'inventory', icon: Package, label: t('settings.inventoryAlerts'), desc: 'تنبيه عند انخفاض المخزون تحت الحد الأدنى', color: 'text-orange-600' },
                  { key: 'harvest', icon: Package, label: 'تنبيهات الحصاد', desc: 'تنبيه عند وصول دفعة لوزن السوق', color: 'text-green-600' },
                  { key: 'email', icon: Globe, label: t('settings.emailNotifications'), desc: 'إرسال التنبيهات عبر البريد الإلكتروني', color: 'text-purple-600' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications({...notifications, [item.key]: !notifications[item.key]})}
                      className={`relative w-11 h-6 rounded-full transition-colors ${notifications[item.key] ? 'bg-primary-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[item.key] ? 'start-[22px]' : 'start-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thresholds */}
          {activeTab === 'thresholds' && (
            <div className="card space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('settings.alertThresholds')}</h3>
                  <p className="text-sm text-gray-500">تحديد حدود التنبيه لمعايير جودة المياه والنفوق</p>
                </div>
              </div>

              <div className="space-y-5">
                <h4 className="font-semibold text-gray-800">{t('waterQuality.title')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: `${t('waterQuality.do')} - ${t('feeding.minAmount')}`, key: 'doMin', unit: 'mg/L' },
                    { label: `${t('waterQuality.do')} - ${t('feeding.maxAmount')}`, key: 'doMax', unit: 'mg/L' },
                    { label: `${t('waterQuality.ph')} - ${t('feeding.minAmount')}`, key: 'phMin', unit: '' },
                    { label: `${t('waterQuality.ph')} - ${t('feeding.maxAmount')}`, key: 'phMax', unit: '' },
                    { label: `${t('waterQuality.temp')} - ${t('feeding.minAmount')}`, key: 'tempMin', unit: '°C' },
                    { label: `${t('waterQuality.temp')} - ${t('feeding.maxAmount')}`, key: 'tempMax', unit: '°C' },
                    { label: `${t('waterQuality.tan')} - ${t('feeding.maxAmount')}`, key: 'tanMax', unit: 'mg/L' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                      <div className="relative">
                        <input type="number" step="0.1" className="input" value={thresholds[field.key]} onChange={e => setThresholds({...thresholds, [field.key]: Number(e.target.value)})} />
                        {field.unit && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{field.unit}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <h4 className="font-semibold text-gray-800 pt-2">{t('kpi.mortality')} والمخزون</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">حد تنبيه النفوق (%)</label>
                    <input type="number" step="0.5" className="input" value={thresholds.mortalityAlert} onChange={e => setThresholds({...thresholds, mortalityAlert: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نسبة المخزون المنخفض (%)</label>
                    <input type="number" className="input" value={thresholds.lowStockPercent} onChange={e => setThresholds({...thresholds, lowStockPercent: Number(e.target.value)})} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="card space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Palette className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('settings.appearance')}</h3>
                  <p className="text-sm text-gray-500">تخصيص مظهر واجهة النظام</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t('settings.language')}</p>
                      <p className="text-xs text-gray-500">اختر لغة الواجهة</p>
                    </div>
                  </div>
                  <button onClick={toggleLang} className="btn btn-secondary text-sm">
                    {i18n.language === 'ar' ? 'English' : 'العربية'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* About */}
          {activeTab === 'about' && (
            <div className="card space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <SettingsIcon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('settings.about')}</h3>
                  <p className="text-sm text-gray-500">معلومات عن النظام</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">اسم النظام</span>
                  <span className="font-semibold">تبيان - نظام إدارة مزارع الأسماك</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">{t('settings.version')}</span>
                  <span className="font-semibold">2.0.0</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">الإطار الأمامي</span>
                  <span className="font-semibold">React 18 + Vite 5</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">الإطار الخلفي</span>
                  <span className="font-semibold">FastAPI + SQLite</span>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          {activeTab !== 'about' && (
            <div className="mt-6 flex items-center gap-3">
              <button onClick={handleSave} className="btn btn-primary flex items-center gap-2">
                {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                {saved ? t('settings.settingsSaved') : t('settings.saveSettings')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
