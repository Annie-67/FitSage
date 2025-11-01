import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  updateProfile: (data) => api.put('/user/profile', data),
  updateUser: (data) => api.put('/user', data),
  getStreak: () => api.get('/user/streak'),
  updateStreak: () => api.post('/user/streak'),
  getAchievements: () => api.get('/user/achievements'),
  addAchievement: (data) => api.post('/user/achievements', data),
};

// Workout API
export const workoutAPI = {
  generate: (data) => api.post('/workout/generate', data),
  getAll: () => api.get('/workout'),
  getActive: () => api.get('/workout/active'),
  getById: (id) => api.get(`/workout/${id}`),
  update: (id, data) => api.put(`/workout/${id}`, data),
  delete: (id) => api.delete(`/workout/${id}`),
  activate: (id) => api.post(`/workout/${id}/activate`),
};

// Nutrition API
export const nutritionAPI = {
  generate: (data) => api.post('/nutrition/generate', data),
  getAll: () => api.get('/nutrition'),
  getActive: () => api.get('/nutrition/active'),
  getById: (id) => api.get(`/nutrition/${id}`),
  update: (id, data) => api.put(`/nutrition/${id}`, data),
  delete: (id) => api.delete(`/nutrition/${id}`),
  activate: (id) => api.post(`/nutrition/${id}/activate`),
};

// Progress API
export const progressAPI = {
  log: (data) => api.post('/progress', data),
  getAll: (params) => api.get('/progress', { params }),
  getById: (id) => api.get(`/progress/${id}`),
  update: (id, data) => api.put(`/progress/${id}`, data),
  delete: (id) => api.delete(`/progress/${id}`),
  getStats: (period) => api.get(`/progress/stats?period=${period}`),
};

// Chat API
export const chatAPI = {
  send: (data) => api.post('/chat', data),
};

// Workout Log API
export const workoutLogAPI = {
  log: (data) => api.post('/workout-logs', data),
  getAll: (params) => api.get('/workout-logs', { params }),
  getByDate: (date) => api.get(`/workout-logs/date/${date}`),
  delete: (id) => api.delete(`/workout-logs/${id}`),
  getStats: (period) => api.get(`/workout-logs/stats?period=${period}`),
};

// Nutrition Log API
export const nutritionLogAPI = {
  log: (data) => api.post('/nutrition-logs', data),
  getAll: (params) => api.get('/nutrition-logs', { params }),
  getByDate: (date) => api.get(`/nutrition-logs/date/${date}`),
  delete: (id) => api.delete(`/nutrition-logs/${id}`),
  getStats: (period) => api.get(`/nutrition-logs/stats?period=${period}`),
};

export default api;
