/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { UserProfile, TeacherLoginCredentials, StudentLoginCredentials } from '../types/auth';
import { loginTeacherApi, loginStudentApi, logoutApi, getMeApi } from '../services/authService';
import {
  isStudentVerified,
  setStudentVerified,
  startNewLoginSession,
  clearAllStudentVerifications,
} from '../utils/subscriptionUtils';

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
  const queryClient = useQueryClient();
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
          isVerified = isStudentVerified(userId);
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
        clearAllStudentVerifications();
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
      let isVerified = false;

      if (studentId) {
        startNewLoginSession(studentId);
        // التحقق مما إذا كان الطالب ما زال ضمن مهلة الـ 10 أيام المعتمدة
        isVerified = isStudentVerified(studentId);

        // إذا كان الباك إند يؤكد وجود اشتراك ساري نشط للطالب
        if (!isVerified && profile.hasActiveSubscription) {
          setStudentVerified(studentId);
          isVerified = true;
        }
      }

      // صلاحية التفعيل تظل سارية لمدة 10 أيام ولا يطلب الكود إلا بعد انتهائها
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
      clearAllStudentVerifications();
      queryClient.clear();
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
