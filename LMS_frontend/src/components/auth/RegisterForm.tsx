import React, { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { User, Phone, Eye, EyeOff, UserPlus } from 'lucide-react';
import type { Grade } from '../../types/grade';
import type { AcademicTrack } from '../../types/academicTrack';
import type { Group } from '../../types/group';
import type { RegisterInputs } from './registerSchema';
import { RegisterAcademicFields } from './RegisterAcademicFields';

interface RegisterFormProps {
  form: UseFormReturn<RegisterInputs>;
  onSubmit: (data: RegisterInputs) => void;
  isLoading: boolean;
  selectedGrade?: Grade;
  selectedAcademicTrack?: AcademicTrack;
  filteredGroups: Group[];
  isGroupsLoading: boolean;
  groupsError: string | null;
  refetchGroups: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  form,
  onSubmit,
  isLoading,
  selectedGrade,
  selectedAcademicTrack,
  filteredGroups,
  isGroupsLoading,
  groupsError,
  refetchGroups,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)}>
      {/* Student Name */}
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
          <User
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={18}
          />
        </div>
        {errors.name && (
          <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.name.message}</p>
        )}
      </div>

      {/* Student Phone */}
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
          <Phone
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={18}
          />
        </div>
        {errors.phone && (
          <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.phone.message}</p>
        )}
      </div>

      {/* Parent Phone */}
      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-700">رقم هاتف ولي الأمر</label>
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
          <Phone
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={18}
          />
        </div>
        {errors.parentPhone && (
          <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.parentPhone.message}</p>
        )}
      </div>

      {/* Grade and Track / Center Group */}
      <RegisterAcademicFields
        form={form}
        selectedGrade={selectedGrade}
        selectedAcademicTrack={selectedAcademicTrack}
        filteredGroups={filteredGroups}
        isGroupsLoading={isGroupsLoading}
        groupsError={groupsError}
        refetchGroups={refetchGroups}
      />

      {/* Password */}
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

      {/* Confirm Password */}
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

      {/* Submit Button */}
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
  );
};

export default RegisterForm;

