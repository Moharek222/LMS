import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

interface ProtectedRouteProps {
  allowedRoles?: Array<'student' | 'teacher' | 'admin'>;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div dir="rtl" className="h-screen w-full flex flex-col items-center justify-center bg-[#091523] text-white">
        <div className="w-12 h-12 border-4 border-[#0D8A82] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-300 font-semibold text-sm">جاري التحقق من بيانات الجلسة...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
    if (user.role === 'teacher' || user.role === 'admin') {
      return <Navigate to="/teacher/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
