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

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const verifiedRef = useRef<boolean>(false);

  // دالة واحدة للفحص بتشتغل مرة واحدة بس
  const checkStatusOnce = async () => {
    const savedUserStr = localStorage.getItem('lms_user');
    if (!savedUserStr) {
      setIsLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUserStr);
      // بنعمل الفحص للطلاب والمدرسين مرة واحدة أول ما يفتح الموقع
      const updatedProfile = await getMeApi();
      
      if (!updatedProfile || updatedProfile.isActive === false) {
        throw new Error("User inactive or not found");
      }

      setUser((prev) => {
        if (!prev) return null;
        const userId = updatedProfile.id || prev.id;
        
        let isVerified = false;
        if (parsedUser.role === 'student') {
            isVerified = Boolean(
              userId && (
                sessionStorage.getItem(`lms_code_verified_${userId}`) === 'true' ||
                localStorage.getItem(`lms_code_verified_${userId}`) === 'true'
              )
            );
        }

        const merged: UserProfile = {
          ...prev,
          ...updatedProfile,
          hasActiveSubscription: isVerified,
        };
        localStorage.setItem('lms_user', JSON.stringify(merged));
        return merged;
      });

    } catch (error: unknown) {
      // لو التوكن خلص أو اليوزر اتمسح
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

  useEffect(() => {
    if (!verifiedRef.current) {
      verifiedRef.current = true;
      checkStatusOnce();
    }
    // مسحنا كل مصايب الـ setInterval والـ window.addEventListener
  }, []); // الأقواس فاضية عشان يشتغل مرة واحدة بس وقت فتح الموقع

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
      if (studentId) {
        localStorage.removeItem(`lms_code_verified_${studentId}`);
        sessionStorage.removeItem(`lms_code_verified_${studentId}`);
      }
      const fullProfile: UserProfile = { ...profile, hasActiveSubscription: false };
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
            localStorage.removeItem('lms_code_verified_');
          }
        });
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith('lms_code_verified_')) {
            sessionStorage.removeItem('lms_code_verified_');
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
