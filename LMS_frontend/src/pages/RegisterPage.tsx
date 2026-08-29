import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import {
  User,
  Phone,
  GraduationCap,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle2,
  LogIn,
  AlertCircle,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { registerStudentApi } from '../services/authService';
import { getGroupsApi, FALLBACK_GROUPS } from '../services/groupService';
import { Footer } from '../components/layout/Footer';
import type { ApiErrorResponse } from '../types/auth';
import type { Group } from '../types/group';

const registerSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'اسم الطالب مطلوب' })
    .min(3, { message: 'يرجى إدخال اسم الطالب الثلاثي على الأقل' }),
  phone: z
    .string()
    .min(1, { message: 'رقم هاتف الطالب مطلوب' })
    .regex(/^01[0125][0-9]{8}$/, { message: 'يرجى إدخال رقم هاتف مصري صحيح (11 رقم)' }),
  parentPhone: z
    .string()
    .optional()
    .refine((val) => !val || /^01[0125][0-9]{8}$/.test(val), {
      message: 'يرجى إدخال رقم هاتف مصري صحيح لولي الأمر',
    }),
  groupId: z.string().min(1, { message: 'يرجى اختيار الصف الدراسي والمجموعة' }),
  password: z
    .string()
    .min(1, { message: 'كلمة المرور مطلوبة' })
    .min(4, { message: 'كلمة المرور يجب أن تكون 4 عناصر على الأقل' }),
  confirmPassword: z.string().min(1, { message: 'تأكيد كلمة المرور مطلوب' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword'],
});

type RegisterInputs = z.infer<typeof registerSchema>;

interface RegisterPageProps {
  onNavigateToLogin?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>(FALLBACK_GROUPS);
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchGroups = async () => {
      try {
        const data = await getGroupsApi();
        if (isMounted && data.length > 0) {
          setGroups(data);
        }
      } catch (e) {
        if (isMounted) {
          setGroups(FALLBACK_GROUPS);
        }
      } finally {
        if (isMounted) {
          setIsGroupsLoading(false);
        }
      }
    };

    fetchGroups();
    return () => {
      isMounted = false;
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: RegisterInputs) => {
    setServerError(null);
    setIsLoading(true);

    try {
      await registerStudentApi({
        name: data.name,
        phone: data.phone,
        parentPhone: data.parentPhone,
        groupId: data.groupId,
        password: data.password,
      });

      setIsSuccess(true);
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const errObj = error as { response?: { status?: number; data?: ApiErrorResponse } };
        const status = errObj.response?.status;
        const msg = errObj.response?.data?.message;

        if (status === 409) {
          setServerError('رقم الهاتف مسجل بالفعل. يمكنك تسجيل الدخول مباشرة.');
        } else if (status === 400 && errObj.response?.data?.errors) {
          const firstErr = errObj.response.data.errors[0]?.message;
          setServerError(firstErr || 'يرجى التأكد من البيانات المدخلة.');
        } else {
          setServerError(msg || 'حدث خطأ في السيرفر أثناء إنشاء الحساب.');
        }
      } else {
        setServerError('حدث خطأ غير متوقع أثناء معالجة الطلب.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="h-screen w-full flex flex-col lg:grid lg:grid-cols-5 font-sans bg-slate-50 overflow-hidden">
      
      <div className="lg:col-span-2 flex flex-col justify-center items-center px-6 py-6 sm:px-10 lg:px-12 bg-[#FAFBFC] overflow-y-auto h-full z-10 shadow-lg">
        <div className="w-full max-w-md my-auto py-4">
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 text-[#0D8A82] mb-3 border border-teal-100 shadow-xs">
              <UserPlus size={26} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1">حساب طالب جديد</h1>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold">أدخل بياناتك للانضمام إلى منصة الصادق</p>
          </div>

          {isSuccess ? (
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
          ) : (
            <>
              {serverError && (
                <div className="flex items-center gap-2.5 p-3.5 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-bold">
                  <AlertCircle size={20} className="shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)}>
                
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">اسم الطالب الثلاثي</label>
                  <div className="relative">
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="أدخل اسمك الثلاثي (مثال: أحمد محمد علي)"
                      {...register('name')}
                      className={`w-full pr-4 pl-11 py-2.5 sm:py-3 rounded-xl border text-right ${
                        errors.name ? 'border-red-400' : 'border-slate-200'
                      } focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition bg-white text-slate-900 text-sm font-medium`}
                    />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                  {errors.name && (
                    <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">رقم هاتف الطالب</label>
                  <div className="relative">
                    <input
                      type="tel"
                      dir="rtl"
                      placeholder="أدخل رقم الهاتف (مثال: 01012345678)"
                      {...register('phone')}
                      className={`w-full pr-4 pl-11 py-2.5 sm:py-3 rounded-xl border text-right ${
                        errors.phone ? 'border-red-400' : 'border-slate-200'
                      } focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition bg-white text-slate-900 text-sm font-medium`}
                    />
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                  {errors.phone && (
                    <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    رقم هاتف ولي الأمر <span className="text-slate-400 font-normal">(اختياري)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      dir="rtl"
                      placeholder="أدخل رقم هاتف ولي الأمر (مثال: 01112345678)"
                      {...register('parentPhone')}
                      className={`w-full pr-4 pl-11 py-2.5 sm:py-3 rounded-xl border text-right ${
                        errors.parentPhone ? 'border-red-400' : 'border-slate-200'
                      } focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition bg-white text-slate-900 text-sm font-medium`}
                    />
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                  {errors.parentPhone && (
                    <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.parentPhone.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">الصف الدراسي والمجموعة</label>
                  <div className="relative">
                    <select
                      dir="rtl"
                      {...register('groupId')}
                      disabled={isGroupsLoading && groups.length === 0}
                      className={`w-full pr-4 pl-10 py-2.5 sm:py-3 rounded-xl border text-right appearance-none ${
                        errors.groupId ? 'border-red-400' : 'border-slate-200'
                      } focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition bg-white text-slate-900 text-sm font-medium cursor-pointer`}
                    >
                      <option value="">
                        {isGroupsLoading && groups.length === 0 ? 'جاري تحميل المجموعات...' : 'اختر الصف الدراسي والمجموعة'}
                      </option>
                      {groups.map((group) => (
                        <option key={group._id} value={group._id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center gap-1">
                      <GraduationCap size={18} />
                      <ChevronDown size={14} />
                    </div>
                  </div>
                  {errors.groupId && (
                    <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.groupId.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      dir="rtl"
                      placeholder="أدخل كلمة المرور"
                      {...register('password')}
                      className={`w-full pr-4 pl-11 py-2.5 sm:py-3 rounded-xl border text-right ${
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
                    <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">تأكيد كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      dir="rtl"
                      placeholder="أعد كتابة كلمة المرور لتأكيدها"
                      {...register('confirmPassword')}
                      className={`w-full pr-4 pl-11 py-2.5 sm:py-3 rounded-xl border text-right ${
                        errors.confirmPassword ? 'border-red-400' : 'border-slate-200'
                      } focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition bg-white text-slate-900 text-sm font-medium`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0D8A82] transition-colors p-1 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0D8A82] hover:bg-[#0B766F] disabled:opacity-70 text-white font-bold py-3 sm:py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-teal-700/20 cursor-pointer text-sm"
                >
                  {isLoading ? (
                    <span>جاري إنشاء الحساب...</span>
                  ) : (
                    <>
                      <span>إنشاء الحساب الآن</span>
                      <UserPlus size={18} />
                    </>
                  )}
                </button>
              </form>

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

              <div className="flex flex-col items-center justify-center gap-1 mt-4 text-slate-400">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs font-semibold">منصة تعليمية آمنة ومحمية</span>
                  <ShieldCheck size={16} />
                </div>
                <Footer variant="card" />
              </div>
            </>
          )}

        </div>
      </div>

      <div className="hidden lg:block lg:col-span-3 relative h-full w-full overflow-hidden select-none bg-[#091523]">
        <img
          src="/slogan8k3.png"
          alt="منصة الصادق - تعلم الكيمياء بفهم وتطبيق وثقة"
          className="w-full h-full object-cover object-center"
        />
      </div>

    </div>
  );
};

export default RegisterPage;
