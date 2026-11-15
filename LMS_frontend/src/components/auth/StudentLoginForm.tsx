import React, { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Phone, Eye, EyeOff, LogIn } from 'lucide-react';
import type { StudentInputs } from './loginSchemas';

interface StudentLoginFormProps {
  form: UseFormReturn<StudentInputs>;
  onSubmit: (data: StudentInputs) => void;
  isLoading: boolean;
  onForgotPassword: () => void;
}

export const StudentLoginForm: React.FC<StudentLoginFormProps> = ({
  form,
  onSubmit,
  isLoading,
  onForgotPassword,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {/* Phone Field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">رقم الهاتف</label>
        <div className="relative">
          <input
            type="tel"
            dir="rtl"
            placeholder="أدخل رقم الهاتف (مثال: 01012345678)"
            {...register('phone')}
            className={`w-full pr-4 pl-11 py-3 rounded-xl border text-right ${
              errors.phone ? 'border-red-400' : 'border-slate-200'
            } focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition bg-white text-slate-900 text-sm font-medium`}
          />
          <Phone
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={18}
          />
        </div>
        {errors.phone && (
          <p className="text-xs font-semibold text-red-600 mt-1">{errors.phone.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">كلمة المرور</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            dir="rtl"
            placeholder="أدخل كلمة المرور"
            {...register('password')}
            className={`w-full pr-4 pl-11 py-3 rounded-xl border text-right ${
              errors.password ? 'border-red-400' : 'border-slate-200'
            } focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition bg-white text-slate-900 text-sm font-medium`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0D8A82] transition-colors p-1 cursor-pointer"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs font-semibold text-red-600 mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Actions: Forgot Password & Remember Me */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-xs font-bold text-[#0D8A82] hover:underline transition cursor-pointer"
        >
          نسيت كلمة المرور؟
        </button>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-slate-600 font-semibold">تذكرني</span>
          <input
            type="checkbox"
            {...register('rememberMe')}
            className="w-4 h-4 rounded border-slate-300 text-[#0D8A82] focus:ring-[#0D8A82] cursor-pointer accent-[#0D8A82]"
          />
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#0D8A82] hover:bg-[#0B766F] disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-teal-700/20 cursor-pointer text-sm"
      >
        {isLoading ? (
          <span>جاري تسجيل الدخول...</span>
        ) : (
          <>
            <span>تسجيل الدخول</span>
            <LogIn size={18} className="rotate-180" />
          </>
        )}
      </button>
    </form>
  );
};

export default StudentLoginForm;

