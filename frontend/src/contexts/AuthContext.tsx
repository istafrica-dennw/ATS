import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { User, Role } from '../types/user';
import { toast } from 'react-toastify';

interface AuthResponse {
  user: User;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setUser: (user: User | null) => void;
  validateTokenAndGetUser: (token: string) => Promise<User>;
  manuallySetToken: (token: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error accessing localStorage:', e);
      return null;
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.error('Error setting localStorage:', e);
      return false;
    }
  },
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Error removing from localStorage:', e);
      return false;
    }
  }
};

// Public paths that shouldn't try to validate tokens
const PUBLIC_PATHS = ['/reset-password', '/verify-email'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Safely set authentication data with fallbacks if localStorage fails
  const safeSetAuthData = (userData: User, tokenData: string) => {
    console.log('AuthContext - Safely setting auth data');
    setUser(userData);
    setToken(tokenData);
    setIsAuthenticated(true);
    
    // Try to store in localStorage
    const tokenStored = safeLocalStorage.setItem('token', tokenData);
    const userStored = safeLocalStorage.setItem('user', JSON.stringify(userData));
    
    if (!tokenStored || !userStored) {
      console.warn('AuthContext - Failed to store auth data in localStorage, using session storage as fallback');
      try {
        sessionStorage.setItem('token', tokenData);
        sessionStorage.setItem('user', JSON.stringify(userData));
      } catch (e) {
        console.error('AuthContext - Failed to store auth data in sessionStorage:', e);
      }
    }
  };

  // Function to fetch user data from the /auth/me endpoint
  const fetchUserData = async (authToken: string) => {
    try {
      console.log('AuthContext - Fetching user data with token');
      // Set authorization header with token
      const formattedToken = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
      axiosInstance.defaults.headers.common['Authorization'] = formattedToken;
      
      // Fetch user data
      const response = await axiosInstance.get('/auth/me');
      const userData = response.data;
      
      console.log('AuthContext - User data fetched successfully:', userData);
      
      // Update state and storage using safe method
      safeSetAuthData(userData, authToken);
      
      return userData;
    } catch (error) {
      console.error('AuthContext - Error fetching user data:', error);
      // If token is invalid, clear it
      safeLocalStorage.removeItem('token');
      setToken(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  // Function to validate token and get user - can be used externally
  const validateTokenAndGetUser = async (authToken: string) => {
    try {
      console.log('AuthContext - Validating token and getting user');
      // Set authorization header with token
      const formattedToken = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
      axiosInstance.defaults.headers.common['Authorization'] = formattedToken;
      
      // Fetch user data
      const response = await axiosInstance.get('/auth/me');
      const userData = response.data;
      
      console.log('AuthContext - Token validated, user data retrieved');
      
      // Update state and storage using safe method
      safeSetAuthData(userData, authToken);
      
      return userData;
    } catch (error) {
      console.error('AuthContext - Token validation failed:', error);
      throw error;
    }
  };

  // Utility function to manually set a token (can be called from anywhere in the app)
  const manuallySetToken = async (tokenValue: string) => {
    console.log('AuthContext - Manually setting token:', tokenValue);
    safeLocalStorage.setItem('token', tokenValue);
    setToken(tokenValue);
    setIsAuthenticated(true);
    
    // Also try session storage as a backup
    try {
      sessionStorage.setItem('token', tokenValue);
    } catch (e) {
      console.error('AuthContext - Failed to store token in sessionStorage:', e);
    }
    
    // Validate and get user data
    return validateTokenAndGetUser(tokenValue);
  };

  useEffect(() => {
    // Check for stored user data and token
    const storedUser = safeLocalStorage.getItem('user');
    const storedToken = safeLocalStorage.getItem('token');
    console.log('AuthContext - Initial auth check - storedUser:', storedUser ? 'exists' : 'missing');
    console.log('AuthContext - Initial auth check - storedToken:', storedToken ? 'exists' : 'missing');
    
    // Also check URL for token (this can help with OAuth flows)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      console.log('AuthContext - Found token in URL');
    }
    
    // Check if current path is in the public paths list that shouldn't validate tokens
    const currentPath = window.location.pathname;
    const isPublicPath = PUBLIC_PATHS.some(path => currentPath.startsWith(path));
    
    const initAuth = async () => {
      // Priority: URL token > localStorage token > sessionStorage token
      const tokenToUse = urlToken || storedToken || sessionStorage.getItem('token');
      
      // If we're on a public path like reset-password, don't try to validate tokens
      if (isPublicPath) {
        console.log('AuthContext - On public path, skipping token validation');
        setIsLoading(false);
        return;
      }
      
      if (tokenToUse) {
        // We have a token
        console.log('AuthContext - Found token, attempting validation');
        
        try {
          // Always validate the token by making a /me request
          await fetchUserData(tokenToUse);
          console.log('AuthContext - Token validated successfully');
          
          // Remove token from URL if it exists
          if (urlToken) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error('AuthContext - Token validation failed, clearing authentication state');
          // If validation fails, clear everything
          safeLocalStorage.removeItem('token');
          safeLocalStorage.removeItem('user');
          try {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
          } catch (e) {}
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      console.log('AuthContext - Attempting login...');
      const response = await axiosInstance.post('/auth/login', { email, password });
      const data: AuthResponse = response.data;
      console.log('AuthContext - Login successful, received data:', data);
      
      // Store user data and token in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.accessToken);

      // Update state after successful storage
      setUser(data.user);
      setToken(data.accessToken);
      setIsAuthenticated(true);
      
      return data;
    } catch (error: any) {
      console.error('AuthContext - Login error:', error);
      // Don't transform the error - pass it as is to allow components to extract data
      throw error;
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      console.log('AuthContext - Signup attempt with email:', email);
      const response = await axiosInstance.post('/auth/signup', { email, password, firstName, lastName });
      console.log('AuthContext - Signup response:', JSON.stringify(response));
      toast.success(response.data.message || 'Registration successful. Please check your email for verification.');
      return response.data;
    } catch (error: any) {
      console.error('AuthContext - Signup error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to create account');
    }
  };

  const logout = () => {
    console.log('AuthContext - Attempting logout...');
    axiosInstance.post('/auth/logout')
      .then(() => {
        console.log('AuthContext - Logout successful');
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      })
      .catch((error) => {
        console.error('AuthContext - Logout error:', error);
      });
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated,
    setToken,
    setIsAuthenticated,
    setUser,
    validateTokenAndGetUser,
    manuallySetToken
  };

  // Return children regardless of loading state
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 