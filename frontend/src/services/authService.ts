import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

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
  };
}

export const authService = {
  signup: async (email: string, password: string, firstName: string, lastName: string): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(`${API_URL}/auth/signup`, {
      email,
      password,
      firstName,
      lastName
    });
    return response.data;
  },

  login: async (data: AuthRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/auth/login`, data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
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
  }
}; 