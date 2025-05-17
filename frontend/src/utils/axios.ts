import axios from 'axios';
import { toast } from 'react-toastify';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Axios - Setting up request config');
    let token = null;
    
    // Try to get token from localStorage with error handling
    try {
      token = localStorage.getItem('token');
      console.log('Axios - Token from localStorage:', token ? 'found' : 'not found');
    } catch (e) {
      console.error('Axios - Error accessing localStorage:', e);
    }
    
    // Try sessionStorage as fallback if localStorage fails
    if (!token) {
      try {
        token = sessionStorage.getItem('token');
        console.log('Axios - Token from sessionStorage:', token ? 'found' : 'not found');
      } catch (e) {
        console.error('Axios - Error accessing sessionStorage:', e);
      }
    }
    
    if (token) {
      // Ensure token has Bearer prefix
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = formattedToken;
      console.log('Axios - Authorization header set');
    } else {
      console.log('Axios - No token found for Authorization header');
    }
    
    return config;
  },
  (error) => {
    console.error('Axios - Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios - Response error:', error.response?.status, error.config?.url);
    console.error('Axios - Error data:', error.response?.data);
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !error.response?.config?.url?.includes('/login')) {
      console.log('Axios - 401 Unauthorized, clearing auth data');
      // Clear auth data
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('mfaVerified');
      } catch (e) {
        console.error('Axios - Error clearing localStorage:', e);
      }
      
      // Redirect to login
      window.location.href = '/login';
    }
    
    // Handle MFA Required errors (403 with requiresMfa flag)
    if (error.response?.status === 403 && error.response?.data?.requiresMfa === true) {
      console.log('Axios - MFA required for this operation');
      
      // Show a toast message informing the user
      toast.error('Two-factor authentication is required for this operation. Please set up 2FA in your security settings.', {
        autoClose: 7000,  // Keep the message visible longer
        onClose: () => {
          // Redirect to security settings page
          window.location.href = '/profile/security';
        }
      });
      
      // Prevent further navigation while the toast is visible
      return new Promise(() => {});  // Never resolves, effectively blocking the request
    }

    // Ensure the original error is passed through with response data intact
    return Promise.reject(error);
  }
);

export default axiosInstance; 