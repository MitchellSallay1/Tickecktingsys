import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, LoginCredentials, AuthResponse, Role } from '../types';
import {
  registerApi,
  forgotPasswordApi,
  resetPasswordApi,
  RegisterData,
  ResetPasswordData,
} from '../services/authService';
import { toast } from 'react-toastify';

// Test users for development
const TEST_USERS = {
  admin: {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  organizer: {
    id: '2',
    name: 'Event Organizer',
    email: 'organizer@example.com',
    role: 'organizer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  user: {
    id: '3',
    name: 'Regular User',
    email: 'user@example.com',
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
} as const;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!user;

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login - in a real app, you would make an API call
      const mockUsers: Record<string, User> = {
        'admin@example.com': TEST_USERS.admin,
        'organizer@example.com': TEST_USERS.organizer,
        'user@example.com': TEST_USERS.user,
      };

      if (password !== 'password123' || !mockUsers[email]) {
        throw new Error('Invalid credentials');
      }

      const user = mockUsers[email];
      
      // Check if the user is trying to access the correct login page
      const currentPath = window.location.pathname;
      const isCorrectRole = (
        (currentPath.includes('/auth/admin/login') && user.role === 'admin') ||
        (currentPath.includes('/auth/organizer/login') && user.role === 'organizer') ||
        (currentPath.includes('/auth/user/login') && user.role === 'user')
      );

      if (!isCorrectRole) {
        throw new Error('Invalid account type for this login page');
      }

      setUser(user);
      toast.success('Login successful');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const { user, token } = await registerApi(data);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success('Registration successful');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      await forgotPasswordApi(email);
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Failed to send password reset instructions');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordData) => {
    try {
      setIsLoading(true);
      await resetPasswordApi(data);
      toast.success('Password reset successful');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to reset password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;