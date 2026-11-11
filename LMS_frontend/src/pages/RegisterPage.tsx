import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
  ChevronDown,
  Layers,
} from 'lucide-react';
import { registerStudentApi } from '../services/authService';
import { getGroupsApi } from '../services/groupService';
import { AuthSplitLayout } from '../components/layout/AuthSplitLayout';
import { toArabicErrorMessage } from '../utils/errorMessage';
import type { Group } from '../types/group';
import { Grade, GRADE_OPTIONS } from '../types/grade';

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
  grade: z.enum([Grade.FirstSecondary, Grade.SecondSecondary, Grade.ThirdSecondary], {
    message: 'يرجى اختيار المرحلة الدراسية',
  }),
  groupId: z.string().min(1, { message: 'يرجى اختيار المجموعة الدراسية' }),
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
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGroupsLoading, setIsGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  const loadGroups = React.useCallback(async () => {
    setIsGroupsLoading(true);
    setGroupsError(null);
    try {
      const data = await getGroupsApi();
      setGroups(data);
    } catch (err) {
      setGroups([]);
      setGroupsError(toArabicErrorMessage(err, 'تعذر تحميل المجموعات الدراسية حالياً.'));
    } finally {
      setIsGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    getGroupsApi()
      .then((data) => {
        if (isMounted) {
          setGroups(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setGroups([]);
          setGroupsError(toArabicErrorMessage(err, 'تعذر تحميل المجموعات الدراسية حالياً.'));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsGroupsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const selectedGrade = useWatch({ control, name: 'grade' });

  const filteredGroups = useMemo(() => {
    if (!selectedGrade) return [];
    return groups.filter((g) => g.grade === selectedGrade || !g.grade);
  }, [groups, selectedGrade]);

  useEffect(() => {
    if (selectedGrade) {
      setValue('groupId', '');
    }
  }, [selectedGrade, setValue]);

  const onSubmit = async (data: RegisterInputs) => {
    setServerError(null);
    setIsLoading(true);

    try {
      await registerStudentApi({
        name: data.name,
        phone: data.phone,
        parentPhone: data.parentPhone,
        groupId: data.groupId,
        grade: data.grade,
        password: data.password,
      });

      setIsSuccess(true);
    } catch (error: unknown) {
      setServerError(toArabicErrorMessage(error, 'حدث خطأ في السيرفر أثناء إنشاء الحساب.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout securityText="منصة تعليمية آمنة ومحمية">
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
                رقم هاتف ولي الأمر
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

            {/* المرحلة الدراسية */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                المرحلة الدراسية <span className="text-teal-600">*</span>
              </label>
              <div className="relative">
                <select
                  dir="rtl"
                  {...register('grade')}
                  className={`w-full pr-4 pl-10 py-2.5 sm:py-3 rounded-xl border text-right appearance-none ${
                    errors.grade ? 'border-red-400' : 'border-slate-200'
                  } focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition bg-white text-slate-900 text-sm font-medium cursor-pointer`}
                >
                  <option value="">اختر مرحلتك الدراسية</option>
                  {GRADE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center gap-1">
                  <Layers size={18} />
                  <ChevronDown size={14} />
                </div>
              </div>
              {errors.grade && (
                <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.grade.message}</p>
              )}
            </div>

            {/* المجموعة الدراسية */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                المجموعة الدراسية <span className="text-teal-600">*</span>
              </label>
              <div className="relative">
                <select
                  dir="rtl"
                  {...register('groupId')}
                  disabled={!selectedGrade || isGroupsLoading || Boolean(groupsError)}
                  className={`w-full pr-4 pl-10 py-2.5 sm:py-3 rounded-xl border text-right appearance-none ${
                    errors.groupId ? 'border-red-400' : 'border-slate-200'
                  } focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition bg-white text-slate-900 text-sm font-medium cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed`}
                >
                  <option value="">
                    {groupsError
                      ? 'تعذر تحميل المجموعات الدراسية'
                      : !selectedGrade
                      ? 'اختر المرحلة الدراسية أولاً لعرض مجموعاتها'
                      : isGroupsLoading
                      ? 'جاري تحميل المجموعات المتاحة...'
                      : filteredGroups.length === 0
                      ? 'لا توجد مجموعات متاحة لهذه المرحلة حالياً'
                      : 'اختر مجموعتك الدراسية'}
                  </option>
                  {filteredGroups.map((group) => (
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
              {groupsError && (
                <div className="flex items-center justify-between gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-1">
                  <span>{groupsError}</span>
                  <button
                    type="button"
                    onClick={() => void loadGroups()}
                    className="text-[#0D8A82] hover:underline font-bold shrink-0 cursor-pointer"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              )}
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
        </>
      )}
    </AuthSplitLayout>
  );
};

export default RegisterPage;
