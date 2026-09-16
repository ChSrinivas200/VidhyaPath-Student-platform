import axios from 'axios';

// Dynamic API URL for Render production or local development
const getBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL;
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
  }
  // In production, fallback to relative '/api' if hosted together, else local backend
  return process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';
};

const BASE_URL = getBaseUrl(); 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Automatically add the Token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers['x-auth-token'] = token; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;