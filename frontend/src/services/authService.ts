import axios from 'axios';
import axiosInstance from '../utils/axios';

// Use a relative path to leverage the proxy configuration in package.json
const API_URL = '';  // Since axiosInstance already has baseURL '/api', we don't need a prefix

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    department: string | null;
    linkedinProfileUrl: string | null;
    profilePictureUrl: string | null;
    authenticationMethod: string;
    isEmailPasswordEnabled: boolean;
    lastLogin: string | null;
    isActive: boolean;
    mfaEnabled?: boolean;
  };
}

export interface SignupResponse {
  message: string;
}

export interface MfaSetupRequest {
  currentPassword: string;
}

export interface MfaSetupResponse {
  secret: string;
  qrCodeImageUrl: string;
  recoveryCodes: string[];
}

export interface MfaVerifyRequest {
  code: string;
  secret: string;
}

export interface MfaLoginRequest {
  email: string;
  code: string;
  recoveryCode?: string;
}

export interface MfaRequiredResponse {
  message: string;
  email: string;
  requires2FA: boolean;
}

export const authService = {
  signup: async (email: string, password: string, firstName: string, lastName: string): Promise<SignupResponse> => {
    const response = await axiosInstance.post<SignupResponse>(`/auth/signup`, {
      email,
      password,
      firstName,
      lastName
    });
    return response.data;
  },

  login: async (data: AuthRequest): Promise<AuthResponse | MfaRequiredResponse> => {
    const response = await axiosInstance.post(`/auth/login`, data);
    
    // Check if 2FA is required
    if (response.status === 202 && response.data.requires2FA) {
      return response.data as MfaRequiredResponse;
    }
    
    // Normal login success
    return response.data as AuthResponse;
  },
  
  loginWithMfa: async (data: MfaLoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(`/auth/mfa/login`, data);
    return response.data;
  },
  
  setupMfa: async (currentPassword: string): Promise<MfaSetupResponse> => {
    // Use axiosInstance which includes the auth token in headers
    const response = await axiosInstance.post<MfaSetupResponse>('/auth/mfa/setup', { currentPassword });
    return response.data;
  },
  
  verifyAndEnableMfa: async (code: string, secret: string): Promise<{ message: string }> => {
    // Use axiosInstance which includes the auth token in headers
    const response = await axiosInstance.post<{ message: string }>('/auth/mfa/verify', { code, secret });
    return response.data;
  },
  
  disableMfa: async (currentPassword: string): Promise<{ message: string }> => {
    // Use axiosInstance which includes the auth token in headers
    const response = await axiosInstance.post<{ message: string }>('/auth/mfa/disable', { currentPassword });
    return response.data;
  },

  logout: () => {
    // Clear all auth-related data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('mfaVerified');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authExpires');
    localStorage.removeItem('loginTime');
    
    // Also clear from sessionStorage to be thorough
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('mfaVerified');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('authExpires');
    sessionStorage.removeItem('loginTime');
    
    console.log('AuthService - Cleared all auth data from storage');
    console.log('- localStorage token after clearing:', localStorage.getItem('token'));
    console.log('- sessionStorage token after clearing:', sessionStorage.getItem('token'));
  },

  getCurrentUser: (): AuthResponse['user'] | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  setAuthData: (data: AuthResponse) => {
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // If this is from an MFA login, mark MFA as verified
    // Otherwise, set it based on whether the user has MFA enabled
    if (window.location.pathname.includes('login') && data.user.mfaEnabled) {
      localStorage.setItem('mfaVerified', 'true');
      console.log('AuthService - Setting mfaVerified to true after MFA login');
    } else if (!data.user.mfaEnabled) {
      // User without MFA is always "verified"
      localStorage.setItem('mfaVerified', 'true');
      console.log('AuthService - User has no MFA, setting mfaVerified to true');
    }
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>('/auth/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  },
  
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>('/auth/change-password', { 
      currentPassword, 
      newPassword 
    });
    return response.data;
  }
}; 