import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { User, Role } from '../types/user';
import { toast } from 'react-toastify';
import { authService, AuthResponse, MfaRequiredResponse, MfaLoginRequest } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse | MfaRequiredResponse>;
  loginWithMfa: (data: MfaLoginRequest) => Promise<AuthResponse>;
  setupMfa: (currentPassword: string) => Promise<any>;
  verifyAndEnableMfa: (code: string, secret: string) => Promise<any>;
  disableMfa: (currentPassword: string) => Promise<any>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setUser: (user: User | null) => void;
  validateTokenAndGetUser: (token: string) => Promise<User>;
  manuallySetToken: (token: string) => Promise<User>;
  mfaVerified: boolean;
  setMfaVerified: (verified: boolean) => void;
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
  const [mfaVerified, setMfaVerified] = useState(false);

  // Safely set authentication data with fallbacks if localStorage fails
  const safeSetAuthData = (userData: any, tokenData: string) => {
    console.log('AuthContext - Safely setting auth data');
    // Convert string role to Role enum and handle date conversion
    const userWithCorrectTypes = {
      ...userData,
      role: userData.role as Role,
      lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : undefined
    } as User;
    
    setUser(userWithCorrectTypes);
    setToken(tokenData);
    setIsAuthenticated(true);
    
    // Only store in localStorage
    try {
      localStorage.setItem('token', tokenData);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('AuthContext - Auth data stored in localStorage');
    } catch (e) {
      console.error('AuthContext - Failed to store auth data in localStorage:', e);
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
      
      // Check if user has MFA enabled but MFA hasn't been verified for this session
      if (userData.mfaEnabled && !mfaVerified) {
        console.log('AuthContext - User has MFA enabled but not verified for this session');
        // We need to redirect to login to verify MFA
        // Clear authentication to force login with MFA verification
        return userData;
      }
      
      return userData;
    } catch (error) {
      console.error('AuthContext - Token validation failed:', error);
      throw error;
    }
  };

  // Utility function to manually set a token (can be called from anywhere in the app)
  const manuallySetToken = async (tokenValue: string) => {
    console.log('AuthContext - Manually setting token:', tokenValue);
    
    // Set in localStorage only
    try {
      localStorage.setItem('token', tokenValue);
      console.log('AuthContext - Token stored in localStorage');
    } catch (e) {
      console.error('AuthContext - Failed to store token in localStorage:', e);
    }
    
    setToken(tokenValue);
    setIsAuthenticated(true);
    
    // Validate and get user data
    return validateTokenAndGetUser(tokenValue);
  };

  useEffect(() => {
    // Check for stored user data and token
    const storedUser = safeLocalStorage.getItem('user');
    const storedToken = safeLocalStorage.getItem('token');
    const storedMfaVerified = safeLocalStorage.getItem('mfaVerified') === 'true';
    
    console.log('AuthContext - Initial auth check - storedUser:', storedUser ? 'exists' : 'missing');
    console.log('AuthContext - Initial auth check - storedToken:', storedToken ? 'exists' : 'missing');
    console.log('AuthContext - Initial auth check - storedMfaVerified:', storedMfaVerified);
    
    // Initialize mfaVerified from local storage
    setMfaVerified(storedMfaVerified);
    
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
      // Only use localStorage token or URL token
      const tokenToUse = urlToken || storedToken;
      
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
          const userData = await fetchUserData(tokenToUse);
          console.log('AuthContext - Token validated successfully');
          
          // If user has MFA enabled but we haven't verified MFA for this session,
          // and we're not already on the login page, redirect to login
          if (userData.mfaEnabled && !storedMfaVerified && currentPath !== '/login') {
          }
        } catch (error) {
          console.error('AuthContext - Error validating stored token:', error);
          safeLocalStorage.removeItem('token');
          safeLocalStorage.removeItem('mfaVerified');
          setIsAuthenticated(false);
          setUser(null);
          setToken(null);
          setMfaVerified(false);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse | MfaRequiredResponse> => {
    try {
      console.log('AuthContext - Attempting login...');
      const response = await authService.login({ email, password });
      
      // Check if 2FA verification is required
      if ('requires2FA' in response && response.requires2FA) {
        console.log('AuthContext - 2FA required for login');
        return response as MfaRequiredResponse;
      }
      
      // Normal login successful
      const authResponse = response as AuthResponse;
      console.log('AuthContext - Login successful, received data:', authResponse);
      
      // For standard login (no MFA), we need to store auth data with proper MFA status
      try {
        // Store user data and token only in localStorage
        localStorage.setItem('user', JSON.stringify(authResponse.user));
        localStorage.setItem('token', authResponse.accessToken);
        
        // If user has MFA enabled, we should NOT set mfaVerified to true here
        // because they haven't gone through MFA verification yet
        if (authResponse.user.mfaEnabled) {
          localStorage.removeItem('mfaVerified');
          setMfaVerified(false);
          console.log('AuthContext - User has MFA enabled, setting mfaVerified to false');
        } else {
          // For users without MFA, we can consider them verified
          localStorage.setItem('mfaVerified', 'true');
          setMfaVerified(true);
          console.log('AuthContext - User has no MFA, setting mfaVerified to true');
        }
      } catch (e) {
        console.error('AuthContext - Error storing auth data during login:', e);
      }

      // Update state after successful storage
      setUser({
        ...authResponse.user, 
        role: authResponse.user.role as Role,
        lastLogin: authResponse.user.lastLogin ? new Date(authResponse.user.lastLogin) : undefined
      } as User);
      setToken(authResponse.accessToken);
      setIsAuthenticated(true);
      
      return authResponse;
    } catch (error: any) {
      console.error('AuthContext - Login error:', error);
      // Don't transform the error - pass it as is to allow components to extract data
      throw error;
    }
  };
  
  const loginWithMfa = async (data: MfaLoginRequest): Promise<AuthResponse> => {
    try {
      console.log('AuthContext - Attempting MFA login...');
      const response = await authService.loginWithMfa(data);
      console.log('AuthContext - MFA Login successful, response:', response);
      
      // Store user data and token only in localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('mfaVerified', 'true');
      
      console.log('AuthContext - MFA verification state stored, mfaVerified set to true');

      // Convert string role to Role enum
      const userRole = response.user.role as Role;
      console.log('AuthContext - User role:', userRole);
      
      // Update state after successful storage
      setUser({
        ...response.user, 
        role: userRole,
        lastLogin: response.user.lastLogin ? new Date(response.user.lastLogin) : undefined
      } as User);
      setToken(response.accessToken);
      setIsAuthenticated(true);
      setMfaVerified(true);
      
      // Set the auth header for future requests
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;
      console.log('AuthContext - Authentication header set for future requests');
      
      return response;
    } catch (error: any) {
      console.error('AuthContext - MFA Login error:', error);
      throw error;
    }
  };
  
  const setupMfa = async (currentPassword: string) => {
    try {
      return await authService.setupMfa(currentPassword);
    } catch (error) {
      console.error('AuthContext - Setup MFA error:', error);
      throw error;
    }
  };
  
  const verifyAndEnableMfa = async (code: string, secret: string) => {
    try {
      const response = await authService.verifyAndEnableMfa(code, secret);
      
      // Update the user object to reflect MFA is now enabled
      if (user) {
        const updatedUser = { 
          ...user, 
          mfaEnabled: true 
        } as User;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return response;
    } catch (error) {
      console.error('AuthContext - Verify MFA error:', error);
      throw error;
    }
  };
  
  const disableMfa = async (currentPassword: string) => {
    try {
      const response = await authService.disableMfa(currentPassword);
      
      // Update the user object to reflect MFA is now disabled
      if (user) {
        const updatedUser = { 
          ...user, 
          mfaEnabled: false 
        } as User;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return response;
    } catch (error) {
      console.error('AuthContext - Disable MFA error:', error);
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

  // Comprehensive function to clear all auth data from everywhere
  const clearAllAuthData = () => {
    console.log('AuthContext - Clearing all auth data');
    
    // Clear state
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setMfaVerified(false);
    
    // Clear ALL possible auth data from localStorage
    try {
      // Clear standard auth items
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('mfaVerified');
      
      // Clear any other potentially auth-related items
      localStorage.removeItem('refreshToken'); // In case refresh tokens are stored
      localStorage.removeItem('authExpires');  // In case expiration is stored
      localStorage.removeItem('loginTime');    // In case login time is stored
      
      // ALSO clear everything from sessionStorage to be thorough
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('mfaVerified');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('authExpires');
      sessionStorage.removeItem('loginTime');
      
      // For debugging purposes
      console.log('AuthContext - Storage after clearing:');
      console.log('- localStorage token:', localStorage.getItem('token'));
      console.log('- sessionStorage token:', sessionStorage.getItem('token'));
      
      console.log('AuthContext - Successfully cleared all storage auth data');
    } catch (e) {
      console.error('AuthContext - Error clearing storage:', e);
    }
    
    // Clear auth header from axios instance
    delete axiosInstance.defaults.headers.common['Authorization'];
    
    console.log('AuthContext - All auth data cleared');
  };

  const logout = () => {
    console.log('AuthContext - Attempting logout...');
    
    // First clear all local auth data regardless of server response
    clearAllAuthData();
    
    // Then notify the server (but don't wait for it)
    axiosInstance.post('/auth/logout')
      .then(() => {
        console.log('AuthContext - Server notified of logout');
      })
      .catch((error) => {
        console.error('AuthContext - Error notifying server of logout:', error);
      })
      .finally(() => {
        // Additional check to make sure data is cleared
        if (localStorage.getItem('token')) {
          console.warn('AuthContext - Token still exists after logout, forcing removal');
          localStorage.removeItem('token');
        }
        
        if (sessionStorage.getItem('token')) {
          console.warn('AuthContext - Token still exists in sessionStorage after logout, forcing removal');
          sessionStorage.removeItem('token');
        }
        
        // Clear ALL storage as a last resort
        try {
          // Try a more direct approach to ensure token is removed from both storage types
          window.localStorage.removeItem('token');
          window.sessionStorage.removeItem('token');
          
          // Brute force removal of all potentially sensitive data
          for (let key in localStorage) {
            if (key.includes('token') || key.includes('auth') || key.includes('user') || key.includes('mfa')) {
              console.log('AuthContext - Removing localStorage item:', key);
              localStorage.removeItem(key);
            }
          }
          
          for (let key in sessionStorage) {
            if (key.includes('token') || key.includes('auth') || key.includes('user') || key.includes('mfa')) {
              console.log('AuthContext - Removing sessionStorage item:', key);
              sessionStorage.removeItem(key);
            }
          }
        } catch (e) {
          console.error('AuthContext - Error during final storage cleanup:', e);
        }
        
        // Force redirect to login page
        console.log('AuthContext - Redirecting to login page');
        window.location.href = '/login';
      });
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    loginWithMfa,
    setupMfa,
    verifyAndEnableMfa,
    disableMfa,
    signup,
    logout,
    isAuthenticated,
    setToken,
    setIsAuthenticated,
    setUser,
    validateTokenAndGetUser,
    manuallySetToken,
    mfaVerified,
    setMfaVerified
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