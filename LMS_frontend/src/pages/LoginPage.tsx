import React from 'react';
import { Navigate } from 'react-router-dom';
import { AlertCircle, Info } from 'lucide-react';
import { AuthSplitLayout } from '../components/layout/AuthSplitLayout';
import { useLoginLogic } from '../components/auth/useLoginLogic';
import { AccountTypeSelector } from '../components/auth/AccountTypeSelector';
import { TeacherLoginForm } from '../components/auth/TeacherLoginForm';
import { StudentLoginForm } from '../components/auth/StudentLoginForm';
import { LoginFooterActions } from '../components/auth/LoginFooterActions';

interface LoginPageProps {
  onNavigateToRegister?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToRegister }) => {
  const login = useLoginLogic();

  return (
    <AuthSplitLayout securityText="منصة آمنة ومحمية">
      <div className="text-center mb-6 sm:mb-7">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1.5">مرحباً بك</h1>
        <p className="text-slate-500 text-xs sm:text-sm font-semibold">اختر نوع الحساب للمتابعة</p>
      </div>

      {login.isAuthenticated && login.user ? (
        <Navigate
          to={login.user.role === 'student' ? '/student/dashboard' : '/teacher/dashboard'}
          replace
        />
      ) : (
        <>
          {/* Account Type Selector Buttons */}
          <AccountTypeSelector
            accountType={login.accountType}
            onSelectType={login.handleSwitchAccountType}
          />

          {/* Server Error Alert */}
          {login.serverError && (
            <div className="flex items-center gap-2.5 p-3.5 mb-5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-bold animate-in fade-in duration-150">
              <AlertCircle size={20} className="shrink-0" />
              <span>{login.serverError}</span>
            </div>
          )}

          {/* Info Notice Alert */}
          {login.infoNotice && (
            <div className="flex items-center justify-between p-3.5 mb-5 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-xs sm:text-sm font-semibold animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5">
                <Info size={18} className="shrink-0 text-[#0D8A82]" />
                <span>{login.infoNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => login.setInfoNotice(null)}
                className="text-teal-600 hover:text-teal-900 p-1 text-xs font-bold cursor-pointer"
                title="إغلاق"
              >
                ✕
              </button>
            </div>
          )}

          {/* Active Login Form */}
          {login.accountType === 'teacher' ? (
            <TeacherLoginForm
              form={login.teacherForm}
              onSubmit={login.onTeacherSubmit}
              isLoading={login.isLoading}
              onForgotPassword={() =>
                login.setInfoNotice(
                  'يرجى التواصل مع الدعم الفني أو إدارة المنصة لإعادة تعيين كلمة المرور الخاصة بك.'
                )
              }
            />
          ) : (
            <StudentLoginForm
              form={login.studentForm}
              onSubmit={login.onStudentSubmit}
              isLoading={login.isLoading}
              onForgotPassword={() =>
                login.setInfoNotice(
                  'يرجى التواصل مع المعلم أو إدارة السنتر لإعادة تعيين كلمة المرور الخاصة بك.'
                )
              }
            />
          )}

          {/* Support Link & Register Link */}
          <LoginFooterActions
            accountType={login.accountType}
            onNavigateToRegister={onNavigateToRegister}
          />
        </>
      )}
    </AuthSplitLayout>
  );
};

export default LoginPage;
