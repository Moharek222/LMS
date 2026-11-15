import React from 'react';
import {
  Loader2,
  AlertTriangle,
  RefreshCw,
  Globe,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import type { PlatformStudentItem } from '../../../api/teacherAccessCodesApi';
import { toArabicErrorMessage } from '../../../../../utils/errorMessage';

interface AllStudentsGenerationFormProps {
  safeAllStudents: PlatformStudentItem[];
  isLoadingAllStudents: boolean;
  isErrorAllStudents: boolean;
  errorAllStudents: unknown;
  refetchAllStudents: () => void;
  validationError: string;
  apiError: string;
  isPending: boolean;
  isGeneratingGroup: boolean;
  onAllStudentsBulkSubmit: () => void;
  onClose: () => void;
}

export const AllStudentsGenerationForm: React.FC<AllStudentsGenerationFormProps> = ({
  safeAllStudents,
  isLoadingAllStudents,
  isErrorAllStudents,
  errorAllStudents,
  refetchAllStudents,
  validationError,
  apiError,
  isPending,
  isGeneratingGroup,
  onAllStudentsBulkSubmit,
  onClose,
}) => {
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

export default AllStudentsGenerationForm;

