import React, { useState } from 'react';
import { X, Loader2, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { useTeacherGroups } from '../../hooks/useTeacherGroups';
import { useMoveStudent } from '../../hooks/useMoveStudent';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';
import type { GroupStudent, Group } from '../../types/groupManagement';

export interface MoveStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: GroupStudent | null;
  currentGroup?: Group | null;
  studentId?: string;
  studentName?: string;
  currentGroupId?: string;
}

export const MoveStudentModal: React.FC<MoveStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  currentGroup,
  studentId: propStudentId,
  studentName: propStudentName,
  currentGroupId: propCurrentGroupId,
}) => {
  const toast = useToast();
  const [targetGroupId, setTargetGroupId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const effectiveStudentId = student?._id || propStudentId || '';
  const effectiveStudentName = student?.name || propStudentName || 'الطالب';
  const effectiveCurrentGroupId = currentGroup?._id || propCurrentGroupId || '';

  const { data: groupsData, isLoading: isLoadingGroups } = useTeacherGroups({ limit: 100 });
  const moveStudentMutation = useMoveStudent();

  if (!isOpen || !effectiveStudentId) return null;

  const availableGroups = (groupsData?.data || []).filter(
    (g) => g._id !== effectiveCurrentGroupId && g.isActive !== false
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetGroupId) return;

    setErrorMsg(null);

    moveStudentMutation.mutate(
      { studentId: effectiveStudentId, payload: { newGroupID: targetGroupId } },
      {
        onSuccess: () => {
          toast.success(`تم نقل الطالب (${effectiveStudentName}) إلى المجموعة الجديدة بنجاح.`);
          onClose();
        },
        onError: (err) => {
          const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء نقل الطالب إلى المجموعة الجديدة');
          setErrorMsg(msg);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100">
              <ArrowRightLeft size={24} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">نقل الطالب لمجموعة أخرى</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">الطالب: {effectiveStudentName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              اختر المجموعة الجديدة المقصد <span className="text-rose-500">*</span>
            </label>

            {isLoadingGroups ? (
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-500">
                <Loader2 size={16} className="animate-spin text-[#0D8A82]" />
                <span>جاري تحميل المجموعات المتاحة...</span>
              </div>
            ) : availableGroups.length === 0 ? (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-xs font-bold text-amber-800">
                لا توجد مجموعات أخرى متاحة لنقل الطالب إليها.
              </div>
            ) : (
              <select
                dir="rtl"
                value={targetGroupId}
                onChange={(e) => setTargetGroupId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-right text-sm font-medium focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition"
              >
                <option value="">اختر المجموعة المقصد...</option>
                {availableGroups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={moveStudentMutation.isPending || !targetGroupId}
              className="flex-1 py-3 px-4 rounded-xl bg-[#0D8A82] text-white font-bold text-xs hover:bg-teal-700 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {moveStudentMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري نقل الطالب...</span>
                </>
              ) : (
                <>
                  <ArrowRightLeft size={16} />
                  <span>تأكيد النقل الآن</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MoveStudentModal;
