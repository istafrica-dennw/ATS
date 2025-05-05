import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';
import axiosInstance from '../utils/axios';

interface AuthResponse {
  accessToken: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data and token
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    console.log('Initial auth check - storedUser:', storedUser);
    console.log('Initial auth check - storedToken:', storedToken);
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Attempting login...');
      const response = await axiosInstance.post('/auth/login', { email, password });
      const data: AuthResponse = response.data;
      console.log('AuthContext: Login successful, received data:', data);
      
      setUser(data.user);
      setToken(data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.accessToken);
      
      console.log('AuthContext: User and token set in state and localStorage');
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const response = await axiosInstance.post('/auth/signup', { email, password, firstName, lastName });
      const data: AuthResponse = response.data;
      setUser(data.user);
      setToken(data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.accessToken);
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  };

  const value = {
    user,
    token,
    login,
    signup,
    logout,
    isAuthenticated: !!user && !!token,
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
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