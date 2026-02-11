import axios from 'axios';

// 🔴 COMMENT OUT THE RENDER URL FOR NOW
// const BASE_URL = 'https://project-hggd.onrender.com/api'; 

// ✅ USE LOCALHOST TO TEST NEW FEATURES
const BASE_URL = 'http://localhost:5000/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Automatically  add the Token to every request
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