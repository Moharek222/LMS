import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Navigate, Link } from 'react-router-dom';
import {
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Headphones,
  LogIn,
  User,
  GraduationCap,
  CheckCircle2,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { Footer } from '../components/layout/Footer';
import type { ApiErrorResponse } from '../types/auth';

const teacherSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'البريد الإلكتروني مطلوب' })
    .email({ message: 'صيغة البريد الإلكتروني غير صحيحة' }),
  password: z.string().min(1, { message: 'كلمة المرور مطلوبة' }),
  rememberMe: z.boolean().optional(),
});

const studentSchema = z.object({
  phone: z
    .string()
    .min(1, { message: 'رقم الهاتف مطلوب' })
    .regex(/^01[0125][0-9]{8}$/, { message: 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678)' }),
  password: z.string().min(1, { message: 'كلمة المرور مطلوبة' }),
  rememberMe: z.boolean().optional(),
});

type TeacherInputs = z.infer<typeof teacherSchema>;
type StudentInputs = z.infer<typeof studentSchema>;

interface LoginPageProps {
  onNavigateToRegister?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToRegister }) => {
  const [accountType, setAccountType] = useState<'teacher' | 'student'>('teacher');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { user, isAuthenticated, loginTeacher, loginStudent, isLoading } = useAuth();


  const teacherForm = useForm<TeacherInputs>({
    resolver: zodResolver(teacherSchema),
    mode: 'onTouched',
  });

  const studentForm = useForm<StudentInputs>({
    resolver: zodResolver(studentSchema),
    mode: 'onTouched',
  });


  const onTeacherSubmit = async (data: TeacherInputs) => {
    setServerError(null);
    try {
      await loginTeacher({ email: data.email, password: data.password });
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        if (error.response) {
          const status = error.response.status;
          const msg = error.response.data?.message;

          if (status === 401) {
            setServerError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
          } else if (status === 403) {
            setServerError('هذا الحساب تم تعطيله. يرجى التواصل مع الدعم الفني.');
          } else if (status === 400 && error.response.data?.errors) {
            const firstErr = error.response.data.errors[0]?.message;
            setServerError(firstErr || 'يرجى التأكد من البيانات المدخلة.');
          } else {
            setServerError(msg || 'حدث خطأ غير متوقع في السيرفر.');
          }
        } else if (error.request) {
          setServerError('تعذر الاتصال بالسيرفر. يرجى التأكد من تشغيل الباك إند أو الاتصال بالشبكة.');
        } else {
          setServerError(error.message || 'حدث خطأ أثناء إرسال البيانات.');
        }
      } else if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError('حدث خطأ غير متوقع.');
      }
    }
  };


  const onStudentSubmit = async (data: StudentInputs) => {
    setServerError(null);
    try {
      await loginStudent({ phone: data.phone, password: data.password });
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        if (error.response) {
          const status = error.response.status;
          const msg = error.response.data?.message;

          if (status === 401) {
            setServerError('رقم الهاتف أو كلمة المرور غير صحيحة.');
          } else if (status === 403) {
            setServerError('حساب الطالب معطل. يرجى التواصل مع المعلم أو السكرتارية.');
          } else if (status === 404) {
            setServerError('خدمة تسجيل دخول الطلاب غير متاحة حالياً.');
          } else {
            setServerError(msg || 'حدث خطأ في السيرفر أثناء تسجيل دخول الطالب.');
          }
        } else if (error.request) {
          setServerError('حدث خطأ في الاتصال بالشبكة، حاول مرة أخرى.');
        } else {
          setServerError(error.message || 'حدث خطأ أثناء معالجة البيانات.');
        }
      } else if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError('حدث خطأ غير متوقع.');
      }
    }
  };

  return (
   
    <div dir="rtl" className="h-screen w-full flex flex-col lg:grid lg:grid-cols-5 font-sans bg-slate-50 overflow-hidden">
      
     
      <div className="lg:col-span-2 flex flex-col justify-center items-center px-6 py-8 sm:px-10 lg:px-12 bg-[#FAFBFC] overflow-y-auto h-full z-10 shadow-lg">
        <div className="w-full max-w-md my-auto">
          
         
          <div className="text-center mb-7">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-1.5">مرحباً بك</h1>
            <p className="text-slate-500 text-sm font-semibold">اختر نوع الحساب للمتابعة</p>
          </div>

         
          {isAuthenticated && user ? (
            <Navigate to={user.role === 'student' ? '/student/dashboard' : '/teacher/dashboard'} replace />
          ) : (
            <>
           
              <div className="grid grid-cols-2 gap-3 mb-2">
                
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountType('student');
                      setServerError(null);
                    }}
                    className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                      accountType === 'student'
                        ? 'bg-[#0D8A82] text-white shadow-md shadow-teal-700/25 hover:bg-[#0B766F] hover:shadow-lg hover:-translate-y-0.5'
                        : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-[#0D8A82]/50 hover:text-[#0D8A82] hover:shadow-sm hover:-translate-y-0.5'
                    }`}
                  >
                    <GraduationCap size={20} />
                    <span>طالب</span>
                    {accountType === 'student' && <CheckCircle2 size={18} className="text-white fill-white/20" />}
                  </button>
                  
                  <div className={`h-1 w-12 rounded-full mt-2 transition-all duration-300 ${accountType === 'student' ? 'bg-[#0D8A82]' : 'bg-transparent'}`}></div>
                </div>

               
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountType('teacher');
                      setServerError(null);
                    }}
                    className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                      accountType === 'teacher'
                        ? 'bg-[#0D8A82] text-white shadow-md shadow-teal-700/25 hover:bg-[#0B766F] hover:shadow-lg hover:-translate-y-0.5'
                        : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-[#0D8A82]/50 hover:text-[#0D8A82] hover:shadow-sm hover:-translate-y-0.5'
                    }`}
                  >
                    <User size={20} />
                    <span>مدرس </span>
                    {accountType === 'teacher' && <CheckCircle2 size={18} className="text-white fill-white/20" />}
                  </button>
                  
                  <div className={`h-1 w-12 rounded-full mt-2 transition-all duration-300 ${accountType === 'teacher' ? 'bg-[#0D8A82]' : 'bg-transparent'}`}></div>
                </div>
              </div>

             
              <div className="flex items-center justify-center gap-2 mb-6 mt-2">
                <span className="text-base font-bold text-slate-800">
                  {accountType === 'teacher' ? 'تسجيل دخول المدرس' : 'تسجيل دخول الطالب'}
                </span>
                {accountType === 'teacher' ? (
                  <User size={20} className="text-[#0D8A82]" />
                ) : (
                  <GraduationCap size={20} className="text-[#0D8A82]" />
                )}
              </div>

             
              {serverError && (
                <div className="flex items-center gap-2.5 p-3.5 mb-5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold">
                  <AlertCircle size={20} className="shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

             
              {accountType === 'teacher' ? (
                <form className="space-y-4" onSubmit={teacherForm.handleSubmit(onTeacherSubmit)}>
                  
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">البريد الإلكتروني</label>
                    <div className="relative">
                      <input
                        type="email"
                        dir="rtl"
                        placeholder="أدخل بريدك الإلكتروني"
                        {...teacherForm.register('email')}
                        className={`w-full pr-4 pl-11 py-3 rounded-xl border text-right ${
                          teacherForm.formState.errors.email ? 'border-red-400' : 'border-slate-200'
                        } focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition bg-white text-slate-900 text-sm font-medium`}
                      />
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>
                    {teacherForm.formState.errors.email && (
                      <p className="text-xs font-semibold text-red-600 mt-1">
                        {teacherForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                 
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">كلمة المرور</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        dir="rtl"
                        placeholder="أدخل كلمة المرور"
                        {...teacherForm.register('password')}
                        className={`w-full pr-4 pl-11 py-3 rounded-xl border text-right ${
                          teacherForm.formState.errors.password ? 'border-red-400' : 'border-slate-200'
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
                    {teacherForm.formState.errors.password && (
                      <p className="text-xs font-semibold text-red-600 mt-1">
                        {teacherForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  
                  <div className="flex items-center justify-between pt-1">
                    <a
                      href="#forgot-password"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('تواصل مع الدعم الفني لإعادة تعيين كلمة المرور الخاصة بك.');
                      }}
                      className="text-xs font-bold text-[#0D8A82] hover:underline transition"
                    >
                      نسيت كلمة المرور؟
                    </a>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-slate-600 font-semibold">تذكرني</span>
                      <input
                        type="checkbox"
                        {...teacherForm.register('rememberMe')}
                        className="w-4 h-4 rounded border-slate-300 text-[#0D8A82] focus:ring-[#0D8A82] cursor-pointer accent-[#0D8A82]"
                      />
                    </label>
                  </div>

                 
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#0D8A82] hover:bg-[#0B766F] disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-teal-700/20 cursor-pointer"
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
              ) : (
                
                <form className="space-y-4" onSubmit={studentForm.handleSubmit(onStudentSubmit)}>
                  
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">رقم الهاتف</label>
                    <div className="relative">
                      <input
                        type="tel"
                        dir="rtl"
                        placeholder="أدخل رقم الهاتف (مثال: 01012345678)"
                        {...studentForm.register('phone')}
                        className={`w-full pr-4 pl-11 py-3 rounded-xl border text-right ${
                          studentForm.formState.errors.phone ? 'border-red-400' : 'border-slate-200'
                        } focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition bg-white text-slate-900 text-sm font-medium`}
                      />
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>
                    {studentForm.formState.errors.phone && (
                      <p className="text-xs font-semibold text-red-600 mt-1">
                        {studentForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">كلمة المرور</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        dir="rtl"
                        placeholder="أدخل كلمة المرور"
                        {...studentForm.register('password')}
                        className={`w-full pr-4 pl-11 py-3 rounded-xl border text-right ${
                          studentForm.formState.errors.password ? 'border-red-400' : 'border-slate-200'
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
                    {studentForm.formState.errors.password && (
                      <p className="text-xs font-semibold text-red-600 mt-1">
                        {studentForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  
                  <div className="flex items-center justify-between pt-1">
                    <a
                      href="#forgot-password"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('تواصل مع الأستاذ أو السكرتارية لإعادة تعيين كلمة المرور الخاصة بك.');
                      }}
                      className="text-xs font-bold text-[#0D8A82] hover:underline transition"
                    >
                      نسيت كلمة المرور؟
                    </a>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-slate-600 font-semibold">تذكرني</span>
                      <input
                        type="checkbox"
                        {...studentForm.register('rememberMe')}
                        className="w-4 h-4 rounded border-slate-300 text-[#0D8A82] focus:ring-[#0D8A82] cursor-pointer accent-[#0D8A82]"
                      />
                    </label>
                  </div>

                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#0D8A82] hover:bg-[#0B766F] disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-teal-700/20 cursor-pointer"
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
              )}

             
              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-slate-400 text-xs font-medium">أو</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              
              <button
                type="button"
                onClick={() => alert('يمكنك التواصل مع خدمة الدعم الفني للمساعدة.')}
                className="w-full bg-white border border-slate-200/90 hover:bg-slate-50 text-[#0D8A82] font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer text-sm"
              >
                <span>تواصل معنا للمساعدة</span>
                <Headphones size={18} />
              </button>

              
              <div className="text-center mt-4 pt-2">
                <p className="text-xs text-slate-600 font-medium">
                  ليس لديك حساب طالب؟{' '}
                  {onNavigateToRegister ? (
                    <button
                      type="button"
                      onClick={onNavigateToRegister}
                      className="font-bold text-[#0D8A82] hover:underline transition cursor-pointer"
                    >
                      إنشاء حساب جديد
                    </button>
                  ) : (
                    <Link
                      to="/register"
                      className="font-bold text-[#0D8A82] hover:underline transition cursor-pointer"
                    >
                      إنشاء حساب جديد
                    </Link>
                  )}
                </p>
              </div>

             
              <div className="flex flex-col items-center justify-center gap-1 mt-5 text-slate-400">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs font-semibold">منصة آمنة ومحمية</span>
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

export default LoginPage;
