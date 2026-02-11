import axios from 'axios';

// PRODUCTION BACKEND URL - Always use deployed backend
const PRODUCTION_API_URL = 'https://result-portal-tkom.onrender.com/api';

// Use production URL (can be overridden by environment variable for local dev)
const API_URL = import.meta.env.VITE_API_URL || PRODUCTION_API_URL;

console.log('🌐 API Base URL:', API_URL);

const instance = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor
instance.interceptors.request.use(
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

export default instance;
