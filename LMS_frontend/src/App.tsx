import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import ScrollToTop from './components/layout/ScrollToTop';
import { AuthProvider, useAuth } from './context/useAuth';
import { ToastProvider } from './context/ToastContext';

const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard'));

const PageFallback = () => (
  <div dir="rtl" className="h-screen w-full flex flex-col items-center justify-center bg-[#091523] text-white">
    <div className="w-12 h-12 border-4 border-[#0D8A82] border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-slate-300 font-semibold text-sm">جاري تحميل المنصة...</p>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function RootRedirect() {
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

  if (user.role === 'student') {
    return <Navigate to="/student/dashboard" replace />;
  }

  if (user.role === 'teacher' || user.role === 'admin') {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
        
        <Route path="/" element={<RootRedirect />} />

       
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

       
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'admin']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
