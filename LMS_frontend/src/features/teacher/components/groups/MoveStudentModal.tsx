import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Loader2, X, AlertTriangle } from 'lucide-react';
import { useTeacherGroups } from '../../hooks/useTeacherGroups';
import { useMoveStudent } from '../../hooks/useMoveStudent';
import type { Group, GroupStudent } from '../../types/groupManagement';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';

interface MoveStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: GroupStudent | null;
  currentGroup: Group | null;
}

export const MoveStudentModal: React.FC<MoveStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  currentGroup,
}) => {
  const toast = useToast();
  const moveStudentMutation = useMoveStudent();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [apiError, setApiError] = useState<string>('');

  const { data: groupsData, isLoading: isLoadingGroups } = useTeacherGroups({ limit: 100 });

  const allGroups = groupsData?.data || [];
  const availableGroups = allGroups.filter(
    (g) => g._id !== currentGroup?._id && g.isActive !== false
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedGroupId('');
      setValidationError('');
      setApiError('');
    }
  }, [isOpen]);

  if (!isOpen || !student || !currentGroup) return null;

  const handleClose = () => {
    if (moveStudentMutation.isPending) return;
    setSelectedGroupId('');
    setValidationError('');
    setApiError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setApiError('');

    if (!selectedGroupId) {
      setValidationError('يرجى اختيار المجموعة الجديدة لنقل الطالب إليها');
      return;
    }

    moveStudentMutation.mutate(
      {
        studentId: student._id,
        payload: { newGroupID: selectedGroupId },
      },
      {
        onSuccess: () => {
          toast.success('تم نقل الطالب إلى المجموعة الجديدة بنجاح.');
          setSelectedGroupId('');
          setValidationError('');
          setApiError('');
          onClose();
        },
        onError: (err) => {
          const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء نقل الطالب');
          setApiError(msg);
          toast.error(msg);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
       
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100">
              <ArrowLeftRight size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">نقل الطالب</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                تغيير مجموعة الطالب وتعديل قيده الدراسية
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={moveStudentMutation.isPending}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

       
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">اسم الطالب:</span>
            <span className="font-extrabold text-slate-800">{student.name}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">المجموعة الحالية:</span>
            <span className="font-bold text-[#0D8A82]">{currentGroup.name}</span>
          </div>
        </div>

       
        <form onSubmit={handleSubmit} className="space-y-4">
          {isLoadingGroups ? (
            <div className="py-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
              <Loader2 size={18} className="animate-spin text-[#0D8A82]" />
              <span>جاري تحميل المجموعات المتاحة...</span>
            </div>
          ) : availableGroups.length === 0 ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <span>لا توجد مجموعة أخرى متاحة لنقل الطالب إليها.</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                المجموعة الجديدة <span className="text-rose-500">*</span>
              </label>
              <select
                dir="rtl"
                value={selectedGroupId}
                onChange={(e) => {
                  setSelectedGroupId(e.target.value);
                  setValidationError('');
                  setApiError('');
                }}
                disabled={moveStudentMutation.isPending}
                className={`w-full px-4 py-3 rounded-xl border text-right text-sm font-medium transition outline-none ${
                  validationError
                    ? 'border-rose-400 bg-rose-50/20'
                    : 'border-slate-200 focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82]'
                } disabled:bg-slate-50 disabled:cursor-not-allowed`}
              >
                <option value="">اختر المجموعة الجديدة</option>
                {availableGroups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
              {validationError && (
                <p className="text-xs font-bold text-rose-600 mt-1">{validationError}</p>
              )}
            </div>
          )}

          {apiError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              {apiError}
            </div>
          )}

          
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={moveStudentMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={
                moveStudentMutation.isPending ||
                isLoadingGroups ||
                availableGroups.length === 0
              }
              className="px-6 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {moveStudentMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري النقل...</span>
                </>
              ) : (
                <span>نقل الطالب</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MoveStudentModal;
