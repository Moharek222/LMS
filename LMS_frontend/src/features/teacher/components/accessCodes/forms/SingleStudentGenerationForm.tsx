import React, { useState, useMemo } from 'react';
import {
  Loader2,
  AlertTriangle,
  RefreshCw,
  User,
  Search,
  GraduationCap,
  X,
  Check,
  Sparkles,
} from 'lucide-react';
import type { Group, GroupStudent } from '../../../types/groupManagement';
import type { PlatformStudentItem } from '../../../api/teacherAccessCodesApi';
import { Grade } from '../../../../../types/grade';
import { AcademicTrack } from '../../../../../types/academicTrack';
import { toArabicErrorMessage } from '../../../../../utils/errorMessage';
import { AccessCodeStudentBadge } from './AccessCodeStudentBadge';

interface SingleStudentGenerationFormProps {
  selectedStudentId: string;
  selectedGroupId: string;
  safeAllStudents: PlatformStudentItem[];
  activeGroups: Group[];
  safeGroupStudents: GroupStudent[];
  isLoadingGroups: boolean;
  isErrorGroups: boolean;
  errorGroups: unknown;
  refetchGroups: () => void;
  isLoadingStudents: boolean;
  isErrorStudents: boolean;
  errorStudents: unknown;
  refetchStudents: () => void;
  isLoadingAllStudents: boolean;
  validationError: string;
  apiError: string;
  isPending: boolean;
  isGeneratingSingle: boolean;
  onGroupChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onStudentChange: (studentId: string) => void;
  onSingleSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const normalizeArabic = (text: string) => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '');
};

export const SingleStudentGenerationForm: React.FC<SingleStudentGenerationFormProps> = ({
  selectedStudentId,
  selectedGroupId,
  safeAllStudents,
  activeGroups,
  safeGroupStudents,
  isLoadingGroups,
  isErrorGroups,
  errorGroups,
  refetchGroups,
  isLoadingStudents,
  isErrorStudents,
  errorStudents,
  refetchStudents,
  isLoadingAllStudents,
  validationError,
  apiError,
  isPending,
  isGeneratingSingle,
  onGroupChange,
  onStudentChange,
  onSingleSubmit,
  onClose,
}) => {
  const [singleGradeTab, setSingleGradeTab] = useState<'search' | Grade>('search');
  const [singleTrackFilter, setSingleTrackFilter] = useState<'all' | AcademicTrack>('all');
  const [singleStudentSearch, setSingleStudentSearch] = useState<string>('');

  // Selected student object details
  const selectedStudentObj = useMemo(() => {
    if (!selectedStudentId) return null;
    return safeAllStudents.find((s) => String(s._id) === String(selectedStudentId)) || null;
  }, [selectedStudentId, safeAllStudents]);

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

  // Filtered 2nd secondary students for single selection
  const singleSecondSecStudents = useMemo(() => {
    if (singleTrackFilter === AcademicTrack.General) {
      return secondSecGeneralStudents;
    }
    if (singleTrackFilter === AcademicTrack.Baccalaureate) {
      return secondSecBacStudents;
    }
    return secondSecAllStudents;
  }, [singleTrackFilter, secondSecGeneralStudents, secondSecBacStudents, secondSecAllStudents]);

  // Search filtered students for quick picker
  const directSearchResults = useMemo(() => {
    if (!singleStudentSearch.trim()) return [];
    const q = normalizeArabic(singleStudentSearch);
    const raw = singleStudentSearch.trim().toLowerCase();

    return safeAllStudents
      .filter((s) => {
        const name = normalizeArabic(s.name || '');
        const phone = s.phone || '';
        return name.includes(q) || phone.includes(raw);
      })
      .slice(0, 10);
  }, [safeAllStudents, singleStudentSearch]);

  return (
    <form onSubmit={onSingleSubmit} className="space-y-4">
      {/* Selected Student Confirmation Chip */}
      {selectedStudentObj && (
        <div className="p-3.5 rounded-2xl bg-teal-50/90 border border-teal-200 flex items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-[#0D8A82] flex items-center justify-center font-bold">
              <Check size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-800">
                  الطالب المختار: {selectedStudentObj.name}
                </span>
                <AccessCodeStudentBadge student={selectedStudentObj} />
              </div>
              {selectedStudentObj.phone && (
                <span className="text-[11px] text-slate-500 font-semibold dir-ltr block text-right">
                  {selectedStudentObj.phone}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onStudentChange('')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition cursor-pointer"
            title="تغيير الطالب"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Grade / Selection Mode Tabs */}
      {!selectedStudentObj && (
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700">
            اختر طريقة تحديد الطالب <span className="text-rose-500">*</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSingleGradeTab('search')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                singleGradeTab === 'search'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search size={14} className="text-[#0D8A82]" />
              <span>بحث فوري</span>
            </button>

            <button
              type="button"
              onClick={() => setSingleGradeTab(Grade.SecondSecondary)}
              className={`py-2 px-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 cursor-pointer ${
                singleGradeTab === Grade.SecondSecondary
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Sparkles size={14} />
              <span>تانية ثانوي (أونلاين)</span>
            </button>

            <button
              type="button"
              onClick={() => setSingleGradeTab(Grade.FirstSecondary)}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                singleGradeTab === Grade.FirstSecondary
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap size={14} />
              <span>أولى ثانوي</span>
            </button>

            <button
              type="button"
              onClick={() => setSingleGradeTab(Grade.ThirdSecondary)}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                singleGradeTab === Grade.ThirdSecondary
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap size={14} />
              <span>تالتة ثانوي</span>
            </button>
          </div>

          {/* TAB 1: Instant Search */}
          {singleGradeTab === 'search' && (
            <div className="space-y-2">
              <div className="relative">
                <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={singleStudentSearch}
                  onChange={(e) => setSingleStudentSearch(e.target.value)}
                  placeholder="اكتب اسم الطالب أو رقم هاتفه للبحث المباشر..."
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] bg-slate-50/70 transition"
                />
              </div>

              {isLoadingAllStudents && (
                <div className="p-3 text-center text-xs text-slate-500 font-semibold flex items-center justify-center gap-2">
                  <Loader2 size={15} className="animate-spin text-[#0D8A82]" />
                  <span>جاري تحميل بيانات طلاب المنصة...</span>
                </div>
              )}

              {singleStudentSearch.trim() && directSearchResults.length === 0 && !isLoadingAllStudents && (
                <p className="text-xs text-slate-400 text-center py-3">
                  لا يوجد طالب مطابق لـ &quot;{singleStudentSearch}&quot;
                </p>
              )}

              {directSearchResults.length > 0 && (
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto bg-white shadow-xs">
                  {directSearchResults.map((s) => (
                    <button
                      key={s._id}
                      type="button"
                      onClick={() => {
                        onStudentChange(s._id);
                        setSingleStudentSearch('');
                      }}
                      className="w-full p-2.5 text-right hover:bg-teal-50/50 flex items-center justify-between gap-2 transition cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-800">{s.name}</span>
                          <AccessCodeStudentBadge student={s} />
                        </div>
                        {s.phone && (
                          <span className="text-[11px] text-slate-400 font-semibold dir-ltr block text-right">
                            {s.phone}
                          </span>
                        )}
                      </div>
                      <User size={15} className="text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Second Secondary (General vs Baccalaureate) */}
          {singleGradeTab === Grade.SecondSecondary && (
            <div className="space-y-3 p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-black text-purple-900">
                  فلترة مسار طلاب تانية ثانوي:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSingleTrackFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      singleTrackFilter === 'all'
                        ? 'bg-purple-700 text-white'
                        : 'bg-white text-purple-800 border border-purple-200'
                    }`}
                  >
                    الكل ({secondSecAllStudents.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSingleTrackFilter(AcademicTrack.General)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer ${
                      singleTrackFilter === AcademicTrack.General
                        ? 'bg-purple-700 text-white'
                        : 'bg-white text-purple-800 border border-purple-200'
                    }`}
                  >
                    عام ({secondSecGeneralStudents.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSingleTrackFilter(AcademicTrack.Baccalaureate)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer ${
                      singleTrackFilter === AcademicTrack.Baccalaureate
                        ? 'bg-fuchsia-700 text-white'
                        : 'bg-white text-fuchsia-800 border border-fuchsia-200'
                    }`}
                  >
                    بكالوريا ({secondSecBacStudents.length})
                  </button>
                </div>
              </div>

              {isLoadingAllStudents ? (
                <div className="p-3 text-center text-xs text-slate-500 font-semibold flex items-center justify-center gap-2">
                  <Loader2 size={15} className="animate-spin text-purple-600" />
                  <span>جاري تحميل طلاب تانية ثانوي...</span>
                </div>
              ) : singleSecondSecStudents.length === 0 ? (
                <p className="text-xs text-purple-800 font-semibold text-center py-2">
                  لا يوجد طلاب مسجلون في هذا المسار حالياً.
                </p>
              ) : (
                <select
                  dir="rtl"
                  value={selectedStudentId}
                  onChange={(e) => onStudentChange(e.target.value)}
                  disabled={isPending}
                  className="w-full px-4 py-2.5 rounded-xl border border-purple-200 text-right text-xs font-semibold focus:border-purple-600 focus:ring-1 focus:ring-purple-600 bg-white transition outline-none"
                >
                  <option value="">
                    اختر الطالب من قائمة طلاب تانية ثانوي ({singleSecondSecStudents.length} طالب)
                  </option>
                  {singleSecondSecStudents.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} {student.phone ? `(${student.phone})` : ''} — [
                      {student.academicTrack === AcademicTrack.Baccalaureate
                        ? 'مسار بكالوريا'
                        : 'مسار عام'}
                      ]
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* TAB 3 & 4: 1st & 3rd Secondary (with center groups) */}
          {(singleGradeTab === Grade.FirstSecondary || singleGradeTab === Grade.ThirdSecondary) && (
            <div className="space-y-3">
              {/* Select Group */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  مجموعة السنتر ({singleGradeTab === Grade.FirstSecondary ? 'أولى ثانوي' : 'تالتة ثانوي'}):
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-right text-xs font-semibold focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] transition outline-none"
                  >
                    <option value="">اختر المجموعة الدراسية</option>
                    {activeGroups
                      .filter(
                        (g) =>
                          g.grade === singleGradeTab ||
                          !g.grade
                      )
                      .map((g) => (
                        <option key={g._id} value={g._id}>
                          {g.name}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              {/* Select Student from Group */}
              {selectedGroupId && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    الطالب من طلاب المجموعة:
                  </label>

                  {isLoadingStudents ? (
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Loader2 size={16} className="animate-spin text-[#0D8A82]" />
                      <span>جاري تحميل طلاب المجموعة...</span>
                    </div>
                  ) : isErrorStudents ? (
                    <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-700 flex items-center justify-between gap-2">
                      <span>{toArabicErrorMessage(errorStudents, 'فشل تحميل طلاب المجموعة')}</span>
                      <button
                        type="button"
                        onClick={() => refetchStudents()}
                        className="inline-flex items-center gap-1 text-[11px] underline cursor-pointer"
                      >
                        <RefreshCw size={12} />
                        <span>إعادة المحاولة</span>
                      </button>
                    </div>
                  ) : safeGroupStudents.length === 0 ? (
                    <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-xs font-bold text-amber-800">
                      لا يوجد طلاب في هذه المجموعة.
                    </div>
                  ) : (
                    <select
                      dir="rtl"
                      value={selectedStudentId}
                      onChange={(e) => onStudentChange(e.target.value)}
                      disabled={isPending}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-right text-xs font-semibold focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] transition outline-none"
                    >
                      <option value="">اختر الطالب</option>
                      {safeGroupStudents.map((student: GroupStudent) => (
                        <option key={student._id} value={student._id}>
                          {student.name} {student.phone ? `(${student.phone})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          )}
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
          type="submit"
          disabled={isPending || !selectedStudentId}
          className="px-6 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingSingle ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>جاري إنشاء الكود...</span>
            </>
          ) : (
            <span>إنشاء كود التفعيل للطالب</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default SingleStudentGenerationForm;
