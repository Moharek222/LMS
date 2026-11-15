import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';
import {
  teacherSchema,
  studentSchema,
  type TeacherInputs,
  type StudentInputs,
} from './loginSchemas';
import type { ApiErrorResponse } from '../../types/auth';

export type AccountType = 'teacher' | 'student';

export const useLoginLogic = () => {
  const [accountType, setAccountType] = useState<AccountType>('student');
  const [serverError, setServerError] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  const { user, isAuthenticated, loginTeacher, loginStudent, isLoading } = useAuth();

  const teacherForm = useForm<TeacherInputs>({
    resolver: zodResolver(teacherSchema),
    mode: 'onTouched',
  });

  const studentForm = useForm<StudentInputs>({
    resolver: zodResolver(studentSchema),
    mode: 'onTouched',
  });

  const handleSwitchAccountType = (type: AccountType) => {
    setAccountType(type);
    setServerError(null);
    setInfoNotice(null);
    teacherForm.clearErrors();
    studentForm.clearErrors();
  };

  const parseAuthError = (error: unknown, role: AccountType): string => {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      if (error.response) {
        const status = error.response.status;
        const msg = error.response.data?.message;

        if (status === 401) {
          return role === 'teacher'
            ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
            : 'رقم الهاتف أو كلمة المرور غير صحيحة.';
        }
        if (status === 403) {
          return role === 'teacher'
            ? 'هذا الحساب تم تعطيله. يرجى التواصل مع الدعم الفني.'
            : 'حساب الطالب معطل. يرجى التواصل مع المعلم أو السكرتارية.';
        }
        if (status === 404 && role === 'student') {
          return 'خدمة تسجيل دخول الطلاب غير متاحة حالياً.';
        }
        if (status === 400 && error.response.data?.errors) {
          const firstErr = error.response.data.errors[0]?.message;
          return firstErr || 'يرجى التأكد من البيانات المدخلة.';
        }
        return msg || 'حدث خطأ في السيرفر أثناء تسجيل الدخول.';
      }
      if (error.request) {
        return 'تعذر الاتصال بالسيرفر. يرجى التأكد من تشغيل الباك إند أو الاتصال بالشبكة.';
      }
      return error.message || 'حدث خطأ أثناء إرسال البيانات.';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'حدث خطأ غير متوقع.';
  };

  const onTeacherSubmit = async (data: TeacherInputs) => {
    setServerError(null);
    try {
      await loginTeacher({ email: data.email, password: data.password });
    } catch (error: unknown) {
      setServerError(parseAuthError(error, 'teacher'));
    }
  };

  const onStudentSubmit = async (data: StudentInputs) => {
    setServerError(null);
    try {
      await loginStudent({ phone: data.phone, password: data.password });
    } catch (error: unknown) {
      setServerError(parseAuthError(error, 'student'));
    }
  };

  return {
    accountType,
    serverError,
    infoNotice,
    setInfoNotice,
    setServerError,
    user,
    isAuthenticated,
    isLoading,
    teacherForm,
    studentForm,
    handleSwitchAccountType,
    onTeacherSubmit,
    onStudentSubmit,
  };
};

export default useLoginLogic;

