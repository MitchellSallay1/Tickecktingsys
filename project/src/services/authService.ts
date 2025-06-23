import axios from 'axios';
import { User, Role } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Mock authentication for development
const MOCK_API = true;

interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'user' | 'organizer';
}

export interface ResetPasswordData {
  email?: string;
  token: string;
  newPassword: string;
}

export const loginApi = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple role determination based on email for demo
    let role: Role = 'user';
    if (credentials.email.includes('admin')) {
      role = 'admin';
    } else if (credentials.email.includes('organizer')) {
      role = 'organizer';
    }
    
    return {
      user: {
        id: '1',
        name: credentials.email.split('@')[0],
        email: credentials.email,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: 'mock-jwt-token',
    };
  }
  
  const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials);
  return response.data;
};

export const registerApi = async (data: RegisterData): Promise<AuthResponse> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      user: {
        id: '1',
        name: data.name || 'User',
        email: data.email || 'user@example.com',
        phone: data.phone,
        role: data.role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: 'mock-jwt-token',
    };
  }
  
  const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, data);
  return response.data;
};

export const getCurrentUserApi = async (): Promise<User> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock user based on token
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    return {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  
  const response = await axios.get<User>(`${API_URL}/auth/me`);
  return response.data;
};

export const logoutApi = async (): Promise<void> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return;
  }
  
  await axios.post(`${API_URL}/auth/logout`);
};

export const updateUserProfileApi = async (userData: Partial<User>): Promise<User> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: '1',
      name: userData.name || 'John Doe',
      email: userData.email || 'john@example.com',
      phone: userData.phone,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profileImage: userData.profileImage,
    };
  }
  
  const response = await axios.put<User>(`${API_URL}/users/profile`, userData);
  return response.data;
};

export const changePasswordApi = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return;
  }
  
  await axios.post(`${API_URL}/auth/change-password`, { currentPassword, newPassword });
};

export const forgotPasswordApi = async (email: string): Promise<{ message: string }> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { message: 'Password reset email sent' };
  }
  
  const response = await axios.post<{ message: string }>(`${API_URL}/auth/forgot-password`, { email });
  return response.data;
};

export const resetPasswordApi = async (data: ResetPasswordData): Promise<{ message: string }> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { message: 'Password reset successful' };
  }
  
  const response = await axios.post<{ message: string }>(`${API_URL}/auth/reset-password`, data);
  return response.data;
};

export const verifyTokenApi = async (token: string): Promise<{ valid: boolean }> => {
  const response = await axios.post<{ valid: boolean }>(`${API_URL}/auth/verify-token`, { token });
  return response.data;
};

// Axios interceptor for adding auth token to requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Axios interceptor for handling token expiration
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);