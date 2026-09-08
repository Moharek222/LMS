import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useDeleteGroup } from '../../hooks/useDeleteGroup';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';

interface DeactivateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

export const DeactivateGroupModal: React.FC<DeactivateGroupModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
}) => {
  const toast = useToast();
  const deleteGroupMutation = useDeleteGroup();
  const [apiError, setApiError] = useState<string>('');

  if (!isOpen || !groupId) return null;

  const handleClose = () => {
    if (deleteGroupMutation.isPending) return;
    setApiError('');
    onClose();
  };

  const handleConfirmDeactivate = () => {
    setApiError('');
    deleteGroupMutation.mutate(groupId, {
      onSuccess: (data) => {
        const count = data?.affectedStudentsCount;
        const successMessage =
          typeof count === 'number'
            ? `تم إيقاف المجموعة وتعطيل ${count} طالب بنجاح`
            : 'تم إيقاف المجموعة بنجاح';
        toast.success(successMessage);
        setApiError('');
        onClose();
      },
      onError: (err) => {
        const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء إيقاف المجموعة');
        setApiError(msg);
        toast.error(msg);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 text-center space-y-5">
       
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
          <AlertTriangle size={28} />
        </div>

      
        <div className="space-y-2">
          <h4 className="text-lg font-black text-slate-800">إيقاف وتجميد المجموعة</h4>
          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
            هل أنت متأكد من إيقاف هذه المجموعة؟
          </p>

          {groupName && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 mt-2">
              {groupName}
            </div>
          )}

       
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold text-right leading-relaxed mt-3 flex items-start gap-2">
            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <span>
              تنبيه هام: إيقاف المجموعة سيؤدي أيضاً إلى تعطيل جميع الطلاب الموجودين بها وإزالة ارتباطهم بالمجموعة.
            </span>
          </div>
        </div>

        {apiError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
            {apiError}
          </div>
        )}

       
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={deleteGroupMutation.isPending}
            className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleConfirmDeactivate}
            disabled={deleteGroupMutation.isPending}
            className="w-1/2 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {deleteGroupMutation.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>جاري إيقاف المجموعة...</span>
              </>
            ) : (
              <span>إيقاف المجموعة</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeactivateGroupModal;
