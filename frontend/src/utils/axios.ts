import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api', // Maintain this to keep the local proxy working
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: The "Token Hunter"
axiosInstance.interceptors.request.use(
  (config) => {
    // 1. Check for standard string tokens (ATS local or simple IAA save)
    let token = localStorage.getItem('token') || localStorage.getItem('ats_token');

    // 2. Fallback: If no string token found, check the IAA Widget's JSON format
    // This prevents the Widget Watchdog from logging you out!
    if (!token) {
      const authTokensStr = localStorage.getItem('auth_tokens');
      if (authTokensStr) {
        try {
          const parsed = JSON.parse(authTokensStr);
          token = parsed.accessToken; // Extract the specific field the widget saves
        } catch (e) {
          console.error("Axios Interceptor: Could not parse auth_tokens JSON", e);
        }
      }
    }

    // 3. If we found a token in ANY of those locations, attach it to the header
    if (token) {
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = formattedToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle Session Expiry
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend returns 401 (Unauthorized), the token is likely expired
    if (error.response?.status === 401) {
      console.warn("Axios: Unauthorized detected. Clearing storage and redirecting to login.");
      
      // Clear everything so the IAA Widget Watchdog doesn't get stuck
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;