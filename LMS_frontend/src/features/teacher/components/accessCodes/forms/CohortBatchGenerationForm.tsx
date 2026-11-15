import React, { useState, useMemo } from 'react';
import {
  Loader2,
  AlertTriangle,
  RefreshCw,
  Users,
  Sparkles,
} from 'lucide-react';
import type { Group, GroupStudent } from '../../../types/groupManagement';
import type { PlatformStudentItem } from '../../../api/teacherAccessCodesApi';
import { Grade } from '../../../../../types/grade';
import { AcademicTrack } from '../../../../../types/academicTrack';
import { toArabicErrorMessage } from '../../../../../utils/errorMessage';

interface CohortBatchGenerationFormProps {
  safeAllStudents: PlatformStudentItem[];
  isLoadingAllStudents: boolean;
  activeGroups: Group[];
  selectedGroupId: string;
  safeGroupStudents: GroupStudent[];
  isLoadingGroups: boolean;
  isErrorGroups: boolean;
  errorGroups: unknown;
  refetchGroups: () => void;
  isLoadingStudents: boolean;
  isErrorStudents: boolean;
  errorStudents: unknown;
  refetchStudents: () => void;
  validationError: string;
  apiError: string;
  isPending: boolean;
  isGeneratingGroup: boolean;
  onGroupChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onGroupBulkSubmit: () => void;
  onBatchSubmit: (studentIDs: string[], cohortName: string) => void;
  onClose: () => void;
}

export const CohortBatchGenerationForm: React.FC<CohortBatchGenerationFormProps> = ({
  safeAllStudents,
  isLoadingAllStudents,
  activeGroups,
  selectedGroupId,
  safeGroupStudents,
  isLoadingGroups,
  isErrorGroups,
  errorGroups,
  refetchGroups,
  isLoadingStudents,
  isErrorStudents,
  errorStudents,
  refetchStudents,
  validationError,
  apiError,
  isPending,
  isGeneratingGroup,
  onGroupChange,
  onGroupBulkSubmit,
  onBatchSubmit,
  onClose,
}) => {
  const [batchCategory, setBatchCategory] = useState<'second_secondary' | 'center_groups'>('second_secondary');
  const [groupGradeFilter, setGroupGradeFilter] = useState<'all' | Grade>('all');

  // 2nd Secondary cohorts
  const secondSecGeneralStudents = useMemo(() => {
    return safeAllStudents.filter(
      (s) =>
        (s.grade === Grade.SecondSecondary || s.grade === 'second_secondary') &&
        (s.academicTrack === AcademicTrack.General || s.academicTrack === 'general')
    );
  }, [safeAllStudents]);

  const secondSecBacStudents = useMemo(() => {
    return safeAllStudents.filter(
      (s) =>
        (s.grade === Grade.SecondSecondary || s.grade === 'second_secondary') &&
        (s.academicTrack === AcademicTrack.Baccalaureate || s.academicTrack === 'baccalaureate')
    );
  }, [safeAllStudents]);

  const secondSecAllStudents = useMemo(() => {
    return safeAllStudents.filter(
      (s) => s.grade === Grade.SecondSecondary || s.grade === 'second_secondary'
    );
  }, [safeAllStudents]);

  // Center groups filtered by grade
  const filteredCenterGroups = useMemo(() => {
    if (groupGradeFilter === Grade.FirstSecondary) {
      return activeGroups.filter((g) => g.grade === Grade.FirstSecondary);
    }
    if (groupGradeFilter === Grade.ThirdSecondary) {
      return activeGroups.filter((g) => g.grade === Grade.ThirdSecondary);
    }
    return activeGroups;
  }, [activeGroups, groupGradeFilter]);

  return (
    <div className="space-y-4">
      {/* Category switcher: 2nd Secondary Online Cohorts VS Center Groups */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setBatchCategory('second_secondary')}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            batchCategory === 'second_secondary'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-purple-800 hover:bg-purple-50'
          }`}
        >
          <Sparkles size={15} />
          <span>دفعة تانية ثانوي (أونلاين)</span>
        </button>

        <button
          type="button"
          onClick={() => setBatchCategory('center_groups')}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            batchCategory === 'center_groups'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users size={15} />
          <span>مجموعات السنتر (أولى وتالتة)</span>
        </button>
      </div>

      {/* SECTION 1: 2nd Secondary Cohorts (General / Baccalaureate / All) */}
      {batchCategory === 'second_secondary' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900 font-bold space-y-1">
            <p>
              طلاب الصف الثاني الثانوي يدرسون بنظام الأونلاين (المسار العام ومسار البكالوريا).
            </p>
            <p className="text-[11px] text-purple-700 font-semibold">
              اختر المسار المراد توليد أكواد تفعيل لجميع طلابه دفعة واحدة:
            </p>
          </div>

          {isLoadingAllStudents ? (
            <div className="p-6 text-center text-xs text-slate-500 font-semibold flex items-center justify-center gap-2 bg-slate-50 rounded-2xl border border-slate-200">
              <Loader2 size={18} className="animate-spin text-purple-600" />
              <span>جاري إحصاء طلاب الصف الثاني الثانوي...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cohort 1: General Track */}
              <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-2xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-900 flex items-center gap-1.5">
                      <Sparkles size={15} className="text-purple-600" />
                      <span>المسار العام (General)</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-black text-xs border border-purple-200">
                      {secondSecGeneralStudents.length} طالب
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1.5">
                    توليد أكواد شحن لجميع طلاب المسار العام المسجلين بالصف الثاني الثانوي.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onBatchSubmit(
                      secondSecGeneralStudents.map((s) => s._id),
                      'طلاب تانية ثانوي - المسار العام'
                    )
                  }
                  disabled={isPending || secondSecGeneralStudents.length === 0}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {isGeneratingGroup ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  <span>توليد أكواد المسار العام ({secondSecGeneralStudents.length})</span>
                </button>
              </div>

              {/* Cohort 2: Baccalaureate Track */}
              <div className="p-4 rounded-2xl bg-white border border-fuchsia-200 shadow-2xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-fuchsia-900 flex items-center gap-1.5">
                      <Sparkles size={15} className="text-fuchsia-600" />
                      <span>مسار البكالوريا (Baccalaureate)</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-fuchsia-50 text-fuchsia-700 font-black text-xs border border-fuchsia-200">
                      {secondSecBacStudents.length} طالب
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1.5">
                    توليد أكواد شحن لجميع طلاب مسار البكالوريا المسجلين بالصف الثاني الثانوي.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onBatchSubmit(
                      secondSecBacStudents.map((s) => s._id),
                      'طلاب تانية ثانوي - مسار البكالوريا'
                    )
                  }
                  disabled={isPending || secondSecBacStudents.length === 0}
                  className="w-full py-2.5 rounded-xl bg-fuchsia-700 hover:bg-fuchsia-800 text-white text-xs font-black transition cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {isGeneratingGroup ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  <span>توليد أكواد مسار البكالوريا ({secondSecBacStudents.length})</span>
                </button>
              </div>

              {/* Cohort 3: Combined All 2nd Secondary */}
              <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-black text-slate-800 block">
                    توليد لكافة طلاب تانية ثانوي معاً (عام وبكالوريا)
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    إجمالي طلاب الدفعة: {secondSecAllStudents.length} طالب
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onBatchSubmit(
                      secondSecAllStudents.map((s) => s._id),
                      'كافة طلاب الصف الثاني الثانوي'
                    )
                  }
                  disabled={isPending || secondSecAllStudents.length === 0}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-black transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <span>توليد لكافة طلاب تانية ({secondSecAllStudents.length})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: Center Groups (1st & 3rd Secondary) */}
      {batchCategory === 'center_groups' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* Grade filter for center groups */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">الصف:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setGroupGradeFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  groupGradeFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                كافة الصفوف
              </button>
              <button
                type="button"
                onClick={() => setGroupGradeFilter(Grade.FirstSecondary)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  groupGradeFilter === Grade.FirstSecondary
                    ? 'bg-sky-600 text-white'
                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
                }`}
              >
                أولى ثانوي
              </button>
              <button
                type="button"
                onClick={() => setGroupGradeFilter(Grade.ThirdSecondary)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  groupGradeFilter === Grade.ThirdSecondary
                    ? 'bg-teal-700 text-white'
                    : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                تالتة ثانوي
              </button>
            </div>
          </div>

          {/* Select Group */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              اختر المجموعة المراد توليد أكواد لجميع طلابها <span className="text-rose-500">*</span>
            </label>

            {isLoadingGroups ? (
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-500">
                <Loader2 size={16} className="animate-spin text-[#0D8A82]" />
                <span>جاري تحميل المجموعات...</span>
              </div>
            ) : isErrorGroups ? (
              <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-700 flex items-center justify-between gap-2">
                <span>{toArabicErrorMessage(errorGroups, 'فشل تحميل المجموعات')}</span>
                <button
                  type="button"
                  onClick={() => refetchGroups()}
                  className="inline-flex items-center gap-1 text-[11px] underline cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            ) : (
              <select
                dir="rtl"
                value={selectedGroupId}
                onChange={onGroupChange}
                disabled={isPending}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-right text-sm font-medium focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] transition outline-none disabled:bg-slate-50"
              >
                <option value="">اختر المجموعة الدراسية</option>
                {filteredCenterGroups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Group Info Box */}
          {selectedGroupId && (
            <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200/90 space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold text-[#0D8A82]">
                <span className="flex items-center gap-1.5">
                  <Users size={16} />
                  <span>حالة طلاب المجموعة</span>
                </span>
                {isLoadingStudents ? (
                  <span className="flex items-center gap-1 text-slate-500">
                    <Loader2 size={14} className="animate-spin" />
                    جاري الحساب...
                  </span>
                ) : isErrorStudents ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-rose-600 font-semibold">
                      {toArabicErrorMessage(errorStudents, 'فشل الحساب')}
                    </span>
                    <button
                      type="button"
                      onClick={() => refetchStudents()}
                      className="inline-flex items-center gap-1 text-xs text-rose-600 underline cursor-pointer"
                    >
                      <RefreshCw size={12} />
                      <span>إعادة المحاولة</span>
                    </button>
                  </div>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-teal-300 text-xs font-black">
                    {safeGroupStudents.length} طالب
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                سيقوم النظام بتوليد أكواد لجميع الطلاب في هذه المجموعة دفعة واحدة، مع تخطي أي طالب لديه كود سارٍ حالياً تلقائياً لحمايته.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={onGroupBulkSubmit}
              disabled={
                isPending ||
                !selectedGroupId ||
                isLoadingStudents ||
                !safeGroupStudents ||
                safeGroupStudents.length === 0
              }
              className="px-6 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-black hover:bg-teal-700 transition cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingGroup ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري توليد الأكواد لطلاب المجموعة...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>توليد أكواد المجموعة ({safeGroupStudents.length} طالب) 🚀</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {validationError && (
        <p className="text-xs font-bold text-rose-600 mt-1">{validationError}</p>
      )}

      {apiError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
          <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}
    </div>
  );
};

export default CohortBatchGenerationForm;
