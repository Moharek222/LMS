import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import { AuthSplitLayout } from '../components/layout/AuthSplitLayout';
import { useRegisterLogic } from '../components/auth/useRegisterLogic';
import { RegisterSuccessCard } from '../components/auth/RegisterSuccessCard';
import { RegisterForm } from '../components/auth/RegisterForm';

interface RegisterPageProps {
  onNavigateToLogin?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
  const {
    form,
    serverError,
    isSuccess,
    isLoading,
    selectedGrade,
    selectedAcademicTrack,
    filteredGroups,
    isGroupsLoading,
    groupsError,
    refetchGroups,
    onSubmit,
  } = useRegisterLogic();

  return (
    <AuthSplitLayout securityText="منصة تعليمية آمنة ومحمية">
      {/* Header Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 text-[#0D8A82] mb-3 border border-teal-100 shadow-xs">
          <UserPlus size={26} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1">حساب طالب جديد</h1>
        <p className="text-slate-500 text-xs sm:text-sm font-semibold">أدخل بياناتك للانضمام إلى منصة الصادق</p>
      </div>

      {isSuccess ? (
        <RegisterSuccessCard onNavigateToLogin={onNavigateToLogin} />
      ) : (
        <>
          {serverError && (
            <div className="flex items-center gap-2.5 p-3.5 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-bold">
              <AlertCircle size={20} className="shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <RegisterForm
            form={form}
            onSubmit={onSubmit}
            isLoading={isLoading}
            selectedGrade={selectedGrade}
            selectedAcademicTrack={selectedAcademicTrack}
            filteredGroups={filteredGroups}
            isGroupsLoading={isGroupsLoading}
            groupsError={groupsError}
            refetchGroups={refetchGroups}
          />

          {/* Footer Navigation */}
          <div className="text-center mt-5 pt-3 border-t border-slate-200/80">
            <p className="text-xs text-slate-600 font-medium">
              لديك حساب بالفعل؟{' '}
              {onNavigateToLogin ? (
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="font-bold text-[#0D8A82] hover:underline transition cursor-pointer"
                >
                  تسجيل الدخول
                </button>
              ) : (
                <Link
                  to="/login"
                  className="font-bold text-[#0D8A82] hover:underline transition cursor-pointer"
                >
                  تسجيل الدخول
                </Link>
              )}
            </p>
          </div>
        </>
      )}
    </AuthSplitLayout>
  );
};

export default RegisterPage;
