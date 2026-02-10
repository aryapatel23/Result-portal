import axios from 'axios';

// Use environment variable or default to deployed backend
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://result-portal-tkom.onrender.com/api',
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
