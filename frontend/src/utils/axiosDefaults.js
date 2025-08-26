import axios from 'axios';

// Set base URL
// axios.defaults.baseURL = 'https://aurasphere-rehd.onrender.com';
axios.defaults.baseURL = 'http://localhost:8080';


// Function to update auth header
export const updateAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Function to clear auth header
export const clearAuthHeader = () => {
  delete axios.defaults.headers.common['Authorization'];
};

// Initialize auth header
updateAuthHeader();

// Response interceptor for token expiration - removed logout functionality
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors without logging out the user
    return Promise.reject(error);
  }
);

export default axios; 