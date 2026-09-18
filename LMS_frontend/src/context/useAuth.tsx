/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
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
    return Boolean(localStorage.getItem('lms_user'));
  });

  useEffect(() => {
    const checkStatusOnce = async () => {
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

      try {
        const updatedProfile = await getMeApi();

        if (!updatedProfile || updatedProfile.isActive === false) {
          setUser(null);
          localStorage.removeItem('lms_user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return;
        }

        setUser((prev) => {
          if (!prev) return null;
          const studentId = updatedProfile.id || prev.id;
          let isVerified = updatedProfile.hasActiveSubscription;

          if (parsedUser?.role === 'student') {
            isVerified = Boolean(
              prev.hasActiveSubscription ||
              updatedProfile.hasActiveSubscription ||
              (studentId && (
                sessionStorage.getItem(`lms_code_verified_${studentId}`) === 'true' ||
                localStorage.getItem(`lms_code_verified_${studentId}`) === 'true'
              ))
            );
          }

          const merged: UserProfile = {
            ...prev,
            ...updatedProfile,
            hasActiveSubscription: isVerified,
          };

          if (
            prev.name === merged.name &&
            prev.phone === merged.phone &&
            prev.email === merged.email &&
            prev.groupId === merged.groupId &&
            prev.isActive === merged.isActive &&
            prev.hasActiveSubscription === merged.hasActiveSubscription
          ) {
            return prev;
          }

          localStorage.setItem('lms_user', JSON.stringify(merged));
          return merged;
        });
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
          setUser(null);
          localStorage.removeItem('lms_user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkStatusOnce();
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
      const studentId = profile.id;
      const isVerified = Boolean(
        profile.hasActiveSubscription ||
        (studentId && (
          sessionStorage.getItem(`lms_code_verified_${studentId}`) === 'true' ||
          localStorage.getItem(`lms_code_verified_${studentId}`) === 'true'
        ))
      );
      const fullProfile: UserProfile = { ...profile, hasActiveSubscription: isVerified };
      setUser(fullProfile);
      localStorage.setItem('lms_user', JSON.stringify(fullProfile));
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
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('lms_code_verified_')) {
            localStorage.removeItem(key);
          }
        });
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith('lms_code_verified_')) {
            sessionStorage.removeItem(key);
          }
        });
      } catch {
        // Ignore storage errors
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

export default AuthContext;
