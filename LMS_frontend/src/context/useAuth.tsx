/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { UserProfile, TeacherLoginCredentials, StudentLoginCredentials } from '../types/auth';
import { loginTeacherApi, loginStudentApi, logoutApi } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginTeacher: (credentials: TeacherLoginCredentials) => Promise<void>;
  loginStudent: (credentials: StudentLoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('lms_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        localStorage.removeItem('lms_user');
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loginTeacher = async (credentials: TeacherLoginCredentials) => {
    setIsLoading(true);
    try {
      const profile = await loginTeacherApi(credentials);
      setUser(profile);
      localStorage.setItem('lms_user', JSON.stringify(profile));
    } finally {
      setIsLoading(false);
    }
  };

  const loginStudent = async (credentials: StudentLoginCredentials) => {
    setIsLoading(true);
    try {
      const profile = await loginStudentApi(credentials);
      setUser(profile);
      localStorage.setItem('lms_user', JSON.stringify(profile));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutApi().catch(() => {});
    } finally {
      setUser(null);
      localStorage.removeItem('lms_user');
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginTeacher,
        loginStudent,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
