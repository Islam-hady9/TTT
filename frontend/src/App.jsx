import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import HatcheryUnit from './pages/HatcheryUnit'
import GrowoutUnit from './pages/GrowoutUnit'
import FatteningUnit from './pages/FatteningUnit'
import Harvest from './pages/Harvest'
import PondDetails from './pages/PondDetails'
import BatchManagement from './pages/BatchManagement'
import Analytics from './pages/Analytics'
import Inventory from './pages/Inventory'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Login from './pages/Login'

// Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  
  // Check if token exists
  if (!token) {
    console.log('🔒 No token found, redirecting to login...')
    return <Navigate to="/login" replace />
  }
  
  console.log('✅ Token found, allowing access')
  return children
}

function App() {
  const { i18n } = useTranslation()

  // Set document direction based on language
  document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = i18n.language

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="hatchery" element={<HatcheryUnit />} />
          <Route path="growout" element={<GrowoutUnit />} />
          <Route path="fattening" element={<FatteningUnit />} />
          <Route path="harvest" element={<Harvest />} />
          <Route path="pond/:unitType/:pondId" element={<PondDetails />} />
          <Route path="batches" element={<BatchManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
