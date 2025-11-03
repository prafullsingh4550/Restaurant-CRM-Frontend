import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'hhttps://restraunt-backend.up.railway.app/api/v1';
axios.defaults.withCredentials = true;

// Configure axios defaults for cookie-based auth
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token fallback for development (when server returns token in response)
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Request interceptor to add token if available
api.interceptors.request.use(
  (config) => {
    if (authToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth token on 401
      setAuthToken(null);
    }
    return Promise.reject(error);
  }
);
