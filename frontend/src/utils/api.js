import axios from 'axios';

// Create axios instance with default config
// In development, it uses the local fallback 'http://localhost:5000'
// In production, it uses the REACT_APP_API_URL environment variable set in Vercel
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 15000,
  withCredentials: true, // Enable cookies for session management
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`);
    // If FormData is being sent, remove Content-Type header to let axios set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      // Server responded with error status
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
      // Updated message to be more generic for production/hosting environments
      error.message = 'Unable to connect to the server. Please check your internet connection or backend status.';
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;