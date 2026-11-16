import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Layers, ChevronDown, GraduationCap } from 'lucide-react';
import { Grade, GRADE_OPTIONS } from '../../types/grade';
import { AcademicTrack, ACADEMIC_TRACK_OPTIONS } from '../../types/academicTrack';
import type { Group } from '../../types/group';
import type { RegisterInputs } from './registerSchema';

interface RegisterAcademicFieldsProps {
  form: UseFormReturn<RegisterInputs>;
  selectedGrade?: Grade;
  selectedAcademicTrack?: AcademicTrack;
  filteredGroups: Group[];
  isGroupsLoading: boolean;
  groupsError: string | null;
  refetchGroups: () => void;
}

export const RegisterAcademicFields: React.FC<RegisterAcademicFieldsProps> = ({
  form,
  selectedGrade,
  selectedAcademicTrack,
  filteredGroups,
  isGroupsLoading,
  groupsError,
  refetchGroups,
}) => {
  const { register, setValue, formState: { errors } } = form;

  return (
    <>
      {/* Grade Level Selection */}
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

      {/* 2nd Secondary: Academic Track Cards (General vs Baccalaureate) */}
      {selectedGrade === Grade.SecondSecondary ? (
        <div className="space-y-2 animate-in fade-in duration-150">
          <label className="block text-xs font-bold text-slate-700">
            المسار الأكاديمي (تانية ثانوي) <span className="text-teal-600">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ACADEMIC_TRACK_OPTIONS.map((track) => {
              const isSelected = selectedAcademicTrack === track.value;
              return (
                <button
                  type="button"
                  key={track.value}
                  onClick={() => {
                    setValue('academicTrack', track.value, { shouldValidate: true });
                  }}
                  className={`p-3 rounded-xl border text-right transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#0D8A82] bg-teal-50/70 text-[#0D8A82] ring-1 ring-[#0D8A82]'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold">{track.label}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-[#0D8A82] bg-[#0D8A82]'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    {track.description}
                  </p>
                </button>
              );
            })}
          </div>
          {errors.academicTrack && (
            <p className="text-xs font-semibold text-red-600 mt-0.5">{errors.academicTrack.message}</p>
          )}
          
        </div>
      ) : (
        /* 1st & 3rd Secondary: Center Group Dropdown */
        <div className="space-y-1 animate-in fade-in duration-150">
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
                onClick={() => void refetchGroups()}
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
      )}
    </>
  );
};

export default RegisterAcademicFields;

