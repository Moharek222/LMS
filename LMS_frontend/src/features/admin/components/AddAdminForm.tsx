import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

const addAdminSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'اسم المدير مطلوب' })
    .min(3, { message: 'يرجى إدخال اسم ثلاثي أو 3 أحرف على الأقل' }),
  email: z
    .string()
    .min(1, { message: 'البريد الإلكتروني مطلوب' })
    .email({ message: 'يرجى إدخال بريد إلكتروني صالح' }),
  password: z
    .string()
    .min(1, { message: 'كلمة المرور مطلوبة' })
    .min(4, { message: 'كلمة المرور يجب أن تكون 4 أحرف أو أرقام على الأقل' }),
});

export type AddAdminInputs = z.infer<typeof addAdminSchema>;

interface AddAdminFormProps {
  isSubmitting: boolean;
  serverError: string | null;
  onSubmit: (data: AddAdminInputs) => void;
}

export const AddAdminForm: React.FC<AddAdminFormProps> = ({
  isSubmitting,
  serverError,
  onSubmit,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddAdminInputs>({
    resolver: zodResolver(addAdminSchema),
    mode: 'onTouched',
  });

  const handleFormSubmit = (data: AddAdminInputs) => {
    onSubmit(data);
    reset();
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#0D8A82]" />
          <span>إضافة مدير نظام جديد</span>
        </h4>

        <span className="px-2.5 py-1 rounded-xl bg-teal-50 text-[#0D8A82] text-[11px] font-bold border border-teal-100">
          Admin Role
        </span>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            اسم المدير بالكامل <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="أدخل اسم المدير..."
              {...register('name')}
              disabled={isSubmitting}
              className={`w-full pl-4 pr-10 py-3 rounded-xl border text-sm font-semibold outline-none transition ${
                errors.name
                  ? 'border-rose-300 focus:border-rose-500'
                  : 'border-slate-200 focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82]'
              } disabled:bg-slate-50 disabled:cursor-not-allowed`}
            />
            <User size={18} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
          </div>
          {errors.name && (
            <p className="text-[11px] font-semibold text-rose-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            البريد الإلكتروني <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              placeholder="admin@platform.com"
              dir="ltr"
              {...register('email')}
              disabled={isSubmitting}
              className={`w-full pl-4 pr-10 py-3 rounded-xl border text-sm font-semibold outline-none transition text-right ${
                errors.email
                  ? 'border-rose-300 focus:border-rose-500'
                  : 'border-slate-200 focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82]'
              } disabled:bg-slate-50 disabled:cursor-not-allowed`}
            />
            <Mail size={18} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
          </div>
          {errors.email && (
            <p className="text-[11px] font-semibold text-rose-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            كلمة المرور <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              disabled={isSubmitting}
              className={`w-full pl-11 pr-10 py-3 rounded-xl border text-sm font-semibold outline-none transition ${
                errors.password
                  ? 'border-rose-300 focus:border-rose-500'
                  : 'border-slate-200 focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82]'
              } disabled:bg-slate-50 disabled:cursor-not-allowed`}
            />
            <Lock size={18} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] font-semibold text-rose-600 mt-1">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 rounded-xl bg-[#0D8A82] text-white font-bold text-xs hover:bg-teal-700 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>جاري إنشاء الحساب...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              <span>حفظ وإضافة المدير</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

