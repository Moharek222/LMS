import React from 'react';
import {
  Loader2,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Users,
  Globe,
  Sparkles,
} from 'lucide-react';
import type { Group, GroupStudent } from '../../types/groupManagement';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import type { GenerationMode } from './GenerateAccessCodeModal';

interface AccessCodeGenerationFormsProps {
  mode: GenerationMode;
  selectedGroupId: string;
  selectedStudentId: string;
  activeGroups: Group[];
  safeGroupStudents: GroupStudent[];
  safeAllStudents: Array<{ _id: string; name: string; phone?: string }>;
  isLoadingGroups: boolean;
  isErrorGroups: boolean;
  errorGroups: unknown;
  refetchGroups: () => void;
  isLoadingStudents: boolean;
  isErrorStudents: boolean;
  errorStudents: unknown;
  refetchStudents: () => void;
  isLoadingAllStudents: boolean;
  isErrorAllStudents: boolean;
  errorAllStudents: unknown;
  refetchAllStudents: () => void;
  validationError: string;
  apiError: string;
  isPending: boolean;
  isGeneratingSingle: boolean;
  isGeneratingGroup: boolean;
  onGroupChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onStudentChange: (studentId: string) => void;
  onSingleSubmit: (e: React.FormEvent) => void;
  onGroupBulkSubmit: () => void;
  onAllStudentsBulkSubmit: () => void;
  onClose: () => void;
}

export const AccessCodeGenerationForms: React.FC<AccessCodeGenerationFormsProps> = ({
  mode,
  selectedGroupId,
  selectedStudentId,
  activeGroups,
  safeGroupStudents,
  safeAllStudents,
  isLoadingGroups,
  isErrorGroups,
  errorGroups,
  refetchGroups,
  isLoadingStudents,
  isErrorStudents,
  errorStudents,
  refetchStudents,
  isLoadingAllStudents,
  isErrorAllStudents,
  errorAllStudents,
  refetchAllStudents,
  validationError,
  apiError,
  isPending,
  isGeneratingSingle,
  isGeneratingGroup,
  onGroupChange,
  onStudentChange,
  onSingleSubmit,
  onGroupBulkSubmit,
  onAllStudentsBulkSubmit,
  onClose,
}) => {
  if (mode === 'single') {
    return (
      <form onSubmit={onSingleSubmit} className="space-y-4">
        {/* Select Group */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            المجموعة الدراسية <span className="text-rose-500">*</span>
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
              {activeGroups.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Select Student */}
        {selectedGroupId && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              الطالب <span className="text-rose-500">*</span>
            </label>

            {isLoadingStudents ? (
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-500">
                <Loader2 size={16} className="animate-spin text-[#0D8A82]" />
                <span>جاري تحميل طلاب المجموعة...</span>
              </div>
            ) : isErrorStudents ? (
              <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-700 flex items-center justify-between gap-2">
                <span>{toArabicErrorMessage(errorStudents, 'فشل تحميل الطلاب')}</span>
                <button
                  type="button"
                  onClick={() => refetchStudents()}
                  className="inline-flex items-center gap-1 text-[11px] underline cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            ) : !safeGroupStudents || safeGroupStudents.length === 0 ? (
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-xs font-bold text-amber-800">
                لا يوجد طلاب نشطون في هذه المجموعة.
              </div>
            ) : (
              <select
                dir="rtl"
                value={selectedStudentId}
                onChange={(e) => onStudentChange(e.target.value)}
                disabled={isPending}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-right text-sm font-medium focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] transition outline-none disabled:bg-slate-50"
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
            disabled={isPending || !selectedGroupId || !selectedStudentId || isLoadingStudents}
            className="px-6 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingSingle ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>جاري إنشاء الكود...</span>
              </>
            ) : (
              <span>إنشاء كود التفعيل</span>
            )}
          </button>
        </div>
      </form>
    );
  }

  if (mode === 'group') {
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            اختر المجموعة المراد توليد أكواد لجميع طلابها <span className="text-rose-500">*</span>
          </label>

          {isLoadingGroups ? (
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-500">
              <Loader2 size={16} className="animate-spin text-[#0D8A82]" />
              <span>جاري تحميل المجموعات...</span>
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
              {activeGroups.map((g) => (
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
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-3">
        <div className="flex items-center justify-between text-xs font-extrabold text-amber-900">
          <span className="flex items-center gap-1.5">
            <Globe size={18} className="text-amber-600" />
            <span>توليد أكواد لجميع طلاب المنصة دفعة واحدة</span>
          </span>
          {isLoadingAllStudents ? (
            <span className="flex items-center gap-1 text-slate-500">
              <Loader2 size={14} className="animate-spin" />
              جاري الفحص...
            </span>
          ) : isErrorAllStudents ? (
            <button
              type="button"
              onClick={() => refetchAllStudents()}
              className="px-2.5 py-1 rounded-xl bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>إعادة المحاولة</span>
            </button>
          ) : (
            <span className="px-3 py-1 rounded-xl bg-white border border-amber-300 text-xs font-black text-amber-900 shadow-2xs">
              {safeAllStudents.length} طالب مسجل
            </span>
          )}
        </div>

        {isErrorAllStudents && (
          <p className="text-xs font-bold text-rose-600 bg-white/80 p-2 rounded-lg">
            {toArabicErrorMessage(errorAllStudents, 'فشل تحميل بيانات طلاب المنصة')}
          </p>
        )}

        <div className="text-xs text-slate-700 font-semibold space-y-1.5 leading-relaxed bg-white/70 p-3.5 rounded-xl border border-amber-200/60">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <CheckCircle size={14} className="text-emerald-600" />
            <span>سيتم إنشاء أكواد لجميع الطلاب الذين انتهت اشتراكاتهم أو ليس لديهم كود.</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-800 font-bold">
            <AlertTriangle size={14} className="text-amber-600" />
            <span>الطلاب الذين ما زالت اشتراكاتهم سارية سيتم تخطيهم تلقائياً لمنع أي تكرار.</span>
          </div>
        </div>
      </div>

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
          type="button"
          onClick={onAllStudentsBulkSubmit}
          disabled={
            isPending ||
            isLoadingAllStudents ||
            !safeAllStudents ||
            safeAllStudents.length === 0
          }
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingGroup ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>جاري توليد الأكواد لجميع الطلاب...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>توليد أكواد لجميع طلاب المنصة ({safeAllStudents.length} طالب) ⚡</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AccessCodeGenerationForms;

