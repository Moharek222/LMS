/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import axios from 'axios';
import type { UserProfile, TeacherLoginCredentials, StudentLoginCredentials } from '../types/auth';
import { loginTeacherApi, loginStudentApi, logoutApi, getMeApi } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginTeacher: (credentials: TeacherLoginCredentials) => Promise<void>;
  loginStudent: (credentials: StudentLoginCredentials) => Promise<void>;
  updateUser: (partial: Partial<UserProfile>) => void;
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

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const savedUserStr = localStorage.getItem('lms_user');
    if (!savedUserStr) return false;
    try {
      const parsed = JSON.parse(savedUserStr);
      return parsed?.role === 'student';
    } catch {
      return false;
    }
  });

  const verifiedRef = useRef<boolean>(false);

  useEffect(() => {
    const savedUserStr = localStorage.getItem('lms_user');
    if (!savedUserStr) {
      setIsLoading(false);
      return;
    }

    let parsedUser: Partial<UserProfile> | null = null;
    try {
      parsedUser = JSON.parse(savedUserStr);
    } catch {
      localStorage.removeItem('lms_user');
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (parsedUser?.role !== 'student') {
      setIsLoading(false);
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;

    let isMounted = true;

    getMeApi()
      .then((updatedProfile) => {
        if (!isMounted) return;
        if (updatedProfile) {
          setUser((prev) => {
            const merged = { ...prev, ...updatedProfile };
            localStorage.setItem('lms_user', JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch((error: unknown) => {
        if (!isMounted) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setUser(null);
          localStorage.removeItem('lms_user');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

  const updateUser = (partial: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partial };
      localStorage.setItem('lms_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutApi().catch(() => {});
    } finally {
      if (user?.id) {
        sessionStorage.removeItem(`lms_code_verified_${user.id}`);
        localStorage.removeItem(`lms_code_verified_${user.id}`);
      }
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
        updateUser,
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
