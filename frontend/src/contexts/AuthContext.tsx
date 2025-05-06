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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored user data and token
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    console.log('AuthContext - Initial auth check - storedUser:', storedUser);
    console.log('AuthContext - Initial auth check - storedToken:', storedToken);
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('AuthContext - Parsed user data:', parsedUser);
        console.log('AuthContext - User role:', parsedUser.role);
        setUser(parsedUser);
        setToken(storedToken);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('AuthContext - Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      console.log('AuthContext - Attempting login...');
      const response = await axiosInstance.post('/auth/login', { email, password });
      const data: AuthResponse = response.data;
      console.log('AuthContext - Login successful, received data:', data);
      console.log('AuthContext - User role:', data.user.role);
      console.log('AuthContext - User role type:', typeof data.user.role);
      console.log('AuthContext - User role comparison:', data.user.role === 'ADMIN');
      
      // Store user data and token in localStorage first
      localStorage.setItem('user', JSON.stringify(data.user));
      //localStorage.setItem('token', data.token);
      localStorage.setItem('token', data.accessToken);

      
      // Update state after successful storage
      setUser(data.user);
      setToken(data.accessToken);
      setIsAuthenticated(true);
      
      // Verify the data was stored correctly
      const storedUser = localStorage.getItem('user');
      console.log('AuthContext - Stored user data:', storedUser);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('AuthContext - Parsed stored user role:', parsedUser.role);
        console.log('AuthContext - Parsed stored user role type:', typeof parsedUser.role);
        console.log('AuthContext - Parsed stored user role comparison:', parsedUser.role === 'ADMIN');
      }
      
      return data;
    } catch (error) {
      console.error('AuthContext - Login error:', error);
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
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 