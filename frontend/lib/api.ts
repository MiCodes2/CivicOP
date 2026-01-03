import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Get token from localStorage or Supabase session
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const api = {
  // Users
  users: {
    getAll: () => apiClient.get('/users'),
    getById: (id: string) => apiClient.get(`/users/${id}`),
    create: (data: any) => apiClient.post('/users', data),
    update: (id: string, data: any) => apiClient.put(`/users/${id}`, data),
    delete: (id: string) => apiClient.delete(`/users/${id}`),
  },

  // Incidents
  incidents: {
    getAll: (params?: any) => apiClient.get('/incidents', { params }),
    getById: (id: string) => apiClient.get(`/incidents/${id}`),
    create: (data: any) => apiClient.post('/incidents', data),
    update: (id: string, data: any) => apiClient.put(`/incidents/${id}`, data),
    delete: (id: string) => apiClient.delete(`/incidents/${id}`),
    analyze: (id: string) => apiClient.post(`/incidents/${id}/analyze`),
  },

  // Governance
  governance: {
    getStats: () => apiClient.get('/governance/stats'),
    getReports: (params?: any) => apiClient.get('/governance/reports', { params }),
  },

  // Auth
  auth: {
    login: (email: string, password: string) =>
      apiClient.post('/auth/login', { email, password }),
    register: (data: any) => apiClient.post('/auth/register', data),
    logout: () => apiClient.post('/auth/logout'),
    refresh: () => apiClient.post('/auth/refresh'),
  },
}

export default apiClient
