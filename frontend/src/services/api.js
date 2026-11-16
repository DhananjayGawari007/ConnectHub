import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_URL || '';
const baseURL = backendUrl ? `${backendUrl.replace(/\/$/, '')}/api` : '/api';

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('connecthub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('connecthub_token');
      localStorage.removeItem('connecthub_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
