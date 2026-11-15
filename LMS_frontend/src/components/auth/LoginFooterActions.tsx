import React from 'react';
import { Link } from 'react-router-dom';
import { Headphones } from 'lucide-react';
import type { AccountType } from './useLoginLogic';

interface LoginFooterActionsProps {
  accountType: AccountType;
  onNavigateToRegister?: () => void;
}

export const LoginFooterActions: React.FC<LoginFooterActionsProps> = ({
  accountType,
  onNavigateToRegister,
}) => {
  return (
    <>
      <div className="flex items-center gap-4 my-5">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-slate-400 text-xs font-medium">أو</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <a
        href="https://wa.me/mahmoud_3zb"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-white border border-slate-200/90 hover:bg-slate-50 text-[#0D8A82] font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer text-sm"
      >
        <span>تواصل معنا للمساعدة</span>
        <Headphones size={18} />
      </a>

      {accountType === 'student' && (
        <div className="text-center mt-4 pt-2">
          <p className="text-xs text-slate-600 font-medium">
            ليس لديك حساب طالب؟{' '}
            {onNavigateToRegister ? (
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="font-bold text-[#0D8A82] hover:underline transition cursor-pointer"
              >
                انشاء حساب جديد
              </button>
            ) : (
              <Link
                to="/register"
                className="font-bold text-[#0D8A82] hover:underline transition cursor-pointer"
              >
                انشاء حساب جديد
              </Link>
            )}
          </p>
        </div>
      )}
    </>
  );
};

export default LoginFooterActions;

