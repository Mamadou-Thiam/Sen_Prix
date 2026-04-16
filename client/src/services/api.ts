import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const productService = {
  getAll: (params?: { page?: number; limit?: number; category?: string }) =>
    api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`)
};

export const marketService = {
  getAll: (params?: { page?: number; limit?: number; city?: string }) =>
    api.get('/markets', { params }),
  getById: (id: string) => api.get(`/markets/${id}`),
  create: (data: any) => api.post('/markets', data),
  update: (id: string, data: any) => api.put(`/markets/${id}`, data),
  delete: (id: string) => api.delete(`/markets/${id}`)
};

export const priceService = {
  getAll: (params?: { page?: number; limit?: number; product?: string; market?: string; startDate?: string; endDate?: string }) =>
    api.get('/prices', { params }),
  create: (data: any) => api.post('/prices', data),
  getStats: (params?: { product?: string; market?: string }) =>
    api.get('/prices/stats', { params }),
  getDashboardStats: () => api.get('/prices/dashboard-stats'),
  getHistory: (productId: string, params?: { market?: string; days?: number }) =>
    api.get(`/prices/history/${productId}`, { params }),
  getPending: (params?: { page?: number; limit?: number }) =>
    api.get('/prices/pending', { params }),
  verify: (id: string, isVerified: boolean) =>
    api.put(`/prices/verify/${id}`, { isVerified })
};

export const alertService = {
  getAll: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api.get('/alerts', { params }),
  markAsRead: (id: string) => api.put(`/alerts/read/${id}`),
  markAllAsRead: () => api.put('/alerts/read-all'),
  delete: (id: string) => api.delete(`/alerts/${id}`),
  getUnreadCount: () => api.get('/alerts/unread-count')
};

export const userService = {
  updateProfile: (data: { firstName: string; lastName: string; phone?: string }) =>
    api.put('/users/profile', data),
  getAll: (params?: { page?: number; limit?: number; role?: string }) =>
    api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  verifyMerchant: (id: string, isVerified: boolean) =>
    api.put(`/users/${id}/verify`, { isVerified }),
  updateRole: (id: string, role: string) =>
    api.put(`/users/${id}/role`, { role }),
  assignMarket: (id: string, marketId: string) =>
    api.put(`/users/${id}/market`, { marketId }),
  rateMerchant: (id: string, rating: number) =>
    api.post(`/users/${id}/rate`, { rating }),
  getStats: () => api.get('/users/stats'),
  create: (data: { email: string; password: string; firstName: string; lastName: string; role: string; phone?: string }) =>
    api.post('/users', data)
};

export const reportService = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/reports', { params }),
  getMyReports: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/reports/my-reports', { params }),
  getById: (id: string) => api.get(`/reports/${id}`),
  create: (data: { type: string; description?: string; product: string; market: string; price: number; quantity: string; reporterRole: string }) =>
    api.post('/reports', data),
  updateStatus: (id: string, status: string) =>
    api.put(`/reports/${id}`, { status }),
  markAsRead: (id: string) => api.put(`/reports/${id}/read`),
  markAllAsRead: () => api.put('/reports/read-all'),
  delete: (id: string) => api.delete(`/reports/${id}`),
  getUnreadCount: () => api.get('/reports/unread-count')
};

export default api;
