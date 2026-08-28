import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import type { UserProfile, TeacherLoginCredentials, StudentLoginCredentials } from '../types/auth';

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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Restore session from localStorage if saved
    const savedUser = localStorage.getItem('lms_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('lms_user');
      }
    }
  }, []);

  const loginTeacher = async (credentials: TeacherLoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/teacher/login', credentials, {
        withCredentials: true,
      });
      const userData = response.data?.user || response.data?.data;
      const profile: UserProfile = {
        id: userData._id || userData.id || '1',
        name: userData.name || 'الأستاذ الصادق',
        email: credentials.email,
        role: userData.role || 'teacher',
      };
      setUser(profile);
      localStorage.setItem('lms_user', JSON.stringify(profile));
    } finally {
      setIsLoading(false);
    }
  };

  const loginStudent = async (credentials: StudentLoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/student/login', credentials, {
        withCredentials: true,
      });
      const userData = response.data?.data || response.data?.user;
      const profile: UserProfile = {
        id: userData?._id || userData?.id || '1',
        name: userData?.name || 'الطالب',
        phone: credentials.phone,
        role: 'student',
        hasActiveSubscription: userData?.hasActiveSubscription,
      };
      setUser(profile);
      localStorage.setItem('lms_user', JSON.stringify(profile));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true }).catch(() => {});
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Provide safe default fallback when rendered outside provider during dev/preview
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      loginTeacher: async () => {},
      loginStudent: async () => {},
      logout: async () => {},
    };
  }
  return context;
};
