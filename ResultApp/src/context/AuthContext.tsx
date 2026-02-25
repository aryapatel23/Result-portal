import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, AuthResponse } from '../types';
import apiService from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('user'),
      ]);

      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('AuthContext login called with role:', credentials.role);
      
      // Build request based on role  
      let loginRequest: any = { role: credentials.role };
      
      if (credentials.role === 'student') {
        // Student login requires grNumber and dateOfBirth
        loginRequest.grNumber = credentials.grNumber;
        loginRequest.dateOfBirth = credentials.dateOfBirth;
      } else {
        // Teacher/Admin login requires email and password
        loginRequest.email = credentials.email;
        loginRequest.password = credentials.password;
      }
      
      const response: AuthResponse = await apiService.login(loginRequest);

      if (response.success) {
        console.log('Login successful, saving token and user');
        await AsyncStorage.setItem('authToken', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
