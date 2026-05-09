import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ==================== Authentication ====================

export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  login: async (username, password) => {
    const response = await api.post('/auth/login/json', {
      username,
      password
    })
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token)
    }
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  }
}

// ==================== Ponds ====================

export const pondsAPI = {
  getAll: async () => {
    const response = await api.get('/ponds')
    return response.data
  },

  getById: async (pondId) => {
    const response = await api.get(`/ponds/${pondId}`)
    return response.data
  },

  create: async (pondData) => {
    const response = await api.post('/ponds', pondData)
    return response.data
  },

  getBatches: async (pondId) => {
    const response = await api.get(`/ponds/${pondId}/batches`)
    return response.data
  },

  createBatch: async (batchData) => {
    const response = await api.post('/ponds/batches', batchData)
    return response.data
  }
}

// ==================== Water Quality ====================

export const waterQualityAPI = {
  create: async (data) => {
    const response = await api.post('/operations/water-quality', data)
    return response.data
  },

  getByPond: async (pondId, days = 7) => {
    const response = await api.get(`/operations/water-quality/pond/${pondId}`, {
      params: { days }
    })
    return response.data
  }
}

// ==================== Feeding ====================

export const feedingAPI = {
  create: async (data) => {
    const response = await api.post('/operations/feeding', data)
    return response.data
  },

  getByPond: async (pondId, days = 7) => {
    const response = await api.get(`/operations/feeding/pond/${pondId}`, {
      params: { days }
    })
    return response.data
  }
}

// ==================== Mortality ====================

export const mortalityAPI = {
  create: async (data) => {
    const response = await api.post('/operations/mortality', data)
    return response.data
  },

  getByPond: async (pondId, days = 30) => {
    const response = await api.get(`/operations/mortality/pond/${pondId}`, {
      params: { days }
    })
    return response.data
  }
}

// ==================== Additives ====================

export const additivesAPI = {
  create: async (data) => {
    const response = await api.post('/operations/additives', data)
    return response.data
  },

  getByPond: async (pondId, days = 30) => {
    const response = await api.get(`/operations/additives/pond/${pondId}`, {
      params: { days }
    })
    return response.data
  }
}

// ==================== Batches (NEW) ====================

export const batchesAPI = {
  // Create new batch
  create: async (batchData) => {
    const response = await api.post('/batches', batchData)
    return response.data
  },

  // Get all batches with filters
  getAll: async (filters = {}) => {
    const response = await api.get('/batches', { params: filters })
    return response.data
  },

  // Get active batches only
  getActive: async () => {
    const response = await api.get('/batches/active')
    return response.data
  },

  // Get batches by stage
  getByStage: async (stage) => {
    const response = await api.get(`/batches/by-stage/${stage}`)
    return response.data
  },

  // Get batch details
  getById: async (batchId) => {
    const response = await api.get(`/batches/${batchId}`)
    return response.data
  },

  // Update batch
  update: async (batchId, updateData) => {
    const response = await api.patch(`/batches/${batchId}`, updateData)
    return response.data
  },

  // Delete batch
  delete: async (batchId) => {
    const response = await api.delete(`/batches/${batchId}`)
    return response.data
  },

  // Get batch history
  getHistory: async (batchId, actionType = null, limit = 100) => {
    const params = { limit }
    if (actionType) params.action_type = actionType
    const response = await api.get(`/batches/${batchId}/history`, { params })
    return response.data
  },

  // Get batch metrics (KPIs)
  getMetrics: async (batchId) => {
    const response = await api.get(`/batches/${batchId}/metrics`)
    return response.data
  }
}

// ==================== Samplings (NEW) ====================

export const samplingsAPI = {
  // Record new sampling
  create: async (samplingData) => {
    const response = await api.post('/samplings', samplingData)
    return response.data
  },

  // Get all samplings for a batch
  getByBatch: async (batchId, limit = 50) => {
    const response = await api.get(`/samplings/batch/${batchId}`, {
      params: { limit }
    })
    return response.data
  },

  // Get sampling details
  getById: async (samplingId) => {
    const response = await api.get(`/samplings/${samplingId}`)
    return response.data
  }
}

// ==================== Transfers (NEW) ====================

export const transfersAPI = {
  // Validate transfer before executing
  validate: async (transferData) => {
    const response = await api.post('/transfers/validate', transferData)
    return response.data
  },

  // Execute transfer
  create: async (transferData) => {
    const response = await api.post('/transfers', transferData)
    return response.data
  },

  // Get all transfers for a batch
  getByBatch: async (batchId) => {
    const response = await api.get(`/transfers/batch/${batchId}`)
    return response.data
  },

  // Get transfer details
  getById: async (transferId) => {
    const response = await api.get(`/transfers/${transferId}`)
    return response.data
  }
}

// ==================== Predictions (NEW) ====================

export const predictionsAPI = {
  // Predict future weight
  predictWeight: async (batchId, daysAhead) => {
    const response = await api.post('/predictions/weight', {
      batch_id: batchId,
      days_ahead: daysAhead
    })
    return response.data
  },

  // Predict harvest date
  predictHarvest: async (batchId, targetWeight = 450) => {
    const response = await api.post('/predictions/harvest', {
      batch_id: batchId,
      target_weight: targetWeight
    })
    return response.data
  },

  // Get all predictions for a batch
  getByBatch: async (batchId) => {
    const response = await api.get(`/predictions/batch/${batchId}`)
    return response.data
  }
}

// ==================== Alerts (NEW) ====================

export const alertsAPI = {
  // Get all alerts with filters
  getAll: async (filters = {}) => {
    const response = await api.get('/alerts', { params: filters })
    return response.data
  },

  // Get unread alerts
  getUnread: async (limit = 50) => {
    const response = await api.get('/alerts/unread', { params: { limit } })
    return response.data
  },

  // Get alert summary statistics
  getSummary: async () => {
    const response = await api.get('/alerts/summary')
    return response.data
  },

  // Get alerts for a specific batch
  getByBatch: async (batchId, isResolved = null) => {
    const params = {}
    if (isResolved !== null) params.is_resolved = isResolved
    const response = await api.get(`/alerts/batch/${batchId}`, { params })
    return response.data
  },

  // Mark alert as read
  markRead: async (alertId) => {
    const response = await api.patch(`/alerts/${alertId}/read`)
    return response.data
  },

  // Mark multiple alerts as read
  markMultipleRead: async (alertIds) => {
    const response = await api.post('/alerts/mark-read', {
      alert_ids: alertIds
    })
    return response.data
  },

  // Resolve alert
  resolve: async (alertId, resolvedBy, notes = null) => {
    const response = await api.patch(`/alerts/${alertId}/resolve`, {
      alert_id: alertId,
      resolved_by: resolvedBy,
      notes
    })
    return response.data
  }
}

// ==================== Feeding Calculations (NEW) ====================

export const feedingCalculationsAPI = {
  // Calculate daily feed for a batch
  calculateDaily: async (batchId) => {
    const response = await api.get(`/feeding/calculate/${batchId}`)
    return response.data
  },

  // Get complete feeding schedule for a batch
  getSchedule: async (batchId) => {
    const response = await api.get(`/feeding/schedule/${batchId}`)
    return response.data
  },

  // Validate feed type for a batch
  validateFeedType: async (batchId, feedType) => {
    const response = await api.get(`/feeding/validate-feed-type/${batchId}`, {
      params: { feed_type: feedType }
    })
    return response.data
  },

  // Get feeding rates reference for all stages
  getRates: async () => {
    const response = await api.get('/feeding/rates')
    return response.data
  }
}

// ==================== Harvests (NEW) ====================

export const harvestsAPI = {
  // Create new harvest record
  create: async (harvestData) => {
    const response = await api.post('/harvests', harvestData)
    return response.data
  },

  // Get all harvests with filters
  getAll: async (filters = {}) => {
    const response = await api.get('/harvests', { params: filters })
    return response.data
  },

  // Get harvest-ready batches
  getReady: async (minWeight = null, maxWeight = null) => {
    const params = {}
    if (minWeight) params.min_weight = minWeight
    if (maxWeight) params.max_weight = maxWeight
    const response = await api.get('/harvests/ready', { params })
    return response.data
  },

  // Get harvest summary statistics
  getSummary: async (startDate = null, endDate = null) => {
    const params = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    const response = await api.get('/harvests/summary', { params })
    return response.data
  },

  // Get harvest details by ID
  getById: async (harvestId) => {
    const response = await api.get(`/harvests/${harvestId}`)
    return response.data
  },

  // Get harvest by batch ID
  getByBatch: async (batchId) => {
    const response = await api.get(`/harvests/batch/${batchId}`)
    return response.data
  },

  // Update harvest record
  update: async (harvestId, updateData) => {
    const response = await api.patch(`/harvests/${harvestId}`, updateData)
    return response.data
  },

  // Delete harvest record
  delete: async (harvestId) => {
    const response = await api.delete(`/harvests/${harvestId}`)
    return response.data
  }
}

// ==================== Analytics (NEW) ====================

export const analyticsAPI = {
  // Water Quality Analysis
  analyzeWaterQuality: async (batchId, days = 30) => {
    const response = await api.get(`/analytics/water-quality/batch/${batchId}`, {
      params: { days }
    })
    return response.data
  },

  // Water Quality Correlation with Growth
  correlateWaterQuality: async (batchId, days = 30) => {
    const response = await api.get(`/analytics/water-quality/correlation/${batchId}`, {
      params: { days }
    })
    return response.data
  },

  // Compare Multiple Batches
  compareBatches: async (batchIds, includeWaterQuality = false) => {
    const response = await api.post('/analytics/compare/batches', {
      batch_ids: batchIds,
      include_water_quality: includeWaterQuality
    })
    return response.data
  },

  // Compare Batches by Stage
  compareByStage: async (stage, limit = 10) => {
    const response = await api.get(`/analytics/compare/by-stage/${stage}`, {
      params: { limit }
    })
    return response.data
  },

  // Compare Batches by Date Range
  compareByDateRange: async (startDate, endDate, limit = 10) => {
    const response = await api.get('/analytics/compare/by-date-range', {
      params: {
        start_date: startDate,
        end_date: endDate,
        limit
      }
    })
    return response.data
  }
}

export default api
