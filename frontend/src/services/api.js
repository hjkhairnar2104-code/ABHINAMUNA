import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartev_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const stationApi = {
  getAll: (params) => api.get('/stations', { params }),
  getById: (id, params) => api.get(`/stations/${id}`, { params }),
  getNearby: (lat, lng, radius) => api.get('/stations/nearby', { params: { lat, lng, radius } }),
  create: (data) => api.post('/stations', data),
  update: (id, data) => api.put(`/stations/${id}`, data),
  delete: (id) => api.delete(`/stations/${id}`),
};

export const navigationApi = {
  planRoute: (data) => api.post('/navigation/plan-route', data),
};

export const bookingApi = {
  createHold: (data) => api.post('/bookings/hold', data),
  verifyPayment: (data) => api.post('/bookings/verify-payment', data),
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  getAllBookings: () => api.get('/bookings/all'),
  getByRef: (ref) => api.get(`/bookings/${ref}`),
  cancel: (id) => api.post(`/bookings/${id}/cancel`),
};

export const vehicleApi = {
  getAll: () => api.get('/vehicles'),
  add: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

export const batteryApi = {
  getLatest: (vehicleId = 1) => api.get(`/battery/latest/${vehicleId}`),
  submitTelemetry: (vehicleId, data) => api.post(`/battery/telemetry/${vehicleId}`, data),
  getHistory: (vehicleId = 1) => api.get(`/battery/history/${vehicleId}`),
  getModelEvaluation: () => 
    api.get('/battery/model-evaluation').catch(() => axios.get('http://localhost:8000/models/evaluation')),
  runDiagnostics: (data) => 
    api.post('/battery/diagnostics', data).catch(() => axios.post('http://localhost:8000/predict/battery-diagnostics', data)),
  getChemistryInsights: () => 
    api.get('/battery/chemistry-insights').catch(() => axios.get('http://localhost:8000/battery/chemistry-insights')),
  predictMasterCell: (data) => 
    axios.post('http://localhost:8000/predict/master-cell', data),
  getResearchPaper: () => 
    axios.get('http://localhost:8000/research/paper-data'),
};

export const aiApi = {
  chat: (message, conversationHistory = [], userContext = {}) => 
    api.post('/ai/chat', { message, conversation_history: conversationHistory, user_context: userContext }),
  getDemand: (stationId, date, hour) => 
    api.get(`/ai/demand/${stationId}`, { params: { date, hour } }),
};

export const analyticsApi = {
  getAdminStats: () => api.get('/analytics/admin-dashboard'),
};

export const reviewApi = {
  getByStation: (stationId) => api.get(`/reviews/station/${stationId}`),
  addReview: (stationId, rating, comment) => api.post(`/reviews/station/${stationId}`, { rating, comment }),
  getAiSummary: (stationId) => api.get(`/reviews/station/${stationId}/summary`),
};

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAllRead: () => api.post('/notifications/mark-all-read'),
};

export default api;
