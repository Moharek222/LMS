import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, LogIn } from 'lucide-react';

interface RegisterSuccessCardProps {
  onNavigateToLogin?: () => void;
}

export const RegisterSuccessCard: React.FC<RegisterSuccessCardProps> = ({ onNavigateToLogin }) => {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-teal-200 shadow-sm space-y-4">
      <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-[#0D8A82] border-2 border-[#0D8A82]">
        <CheckCircle2 size={36} />
      </div>
      <div>
        <h3 className="text-xl font-extrabold text-slate-800">تم إنشاء الحساب بنجاح! 🎉</h3>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
          مرحباً بك في منصة الصادق في الكيمياء. يمكنك الآن تسجيل الدخول باستخدام رقم هاتفك وكلمة المرور.
        </p>
      </div>
      {onNavigateToLogin ? (
        <button
          type="button"
          onClick={onNavigateToLogin}
          className="w-full bg-[#0D8A82] hover:bg-[#0B766F] text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 mt-2 shadow-md shadow-teal-700/20 cursor-pointer"
        >
          <span>الانتقال لتسجيل الدخول</span>
          <LogIn size={18} className="rotate-180" />
        </button>
      ) : (
        <Link
          to="/login"
          className="w-full bg-[#0D8A82] hover:bg-[#0B766F] text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 mt-2 shadow-md shadow-teal-700/20 cursor-pointer text-center"
        >
          <span>الانتقال لتسجيل الدخول</span>
          <LogIn size={18} className="rotate-180" />
        </Link>
      )}
    </div>
  );
};

export default RegisterSuccessCard;

