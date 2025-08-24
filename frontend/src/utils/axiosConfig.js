import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'https://aurasphere-rehd.onrender.com',
});

// Request interceptor to add JWT token
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

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('loggedInUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 