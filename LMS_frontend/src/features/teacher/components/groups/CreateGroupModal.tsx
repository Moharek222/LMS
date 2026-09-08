import React, { useState } from 'react';
import { FolderKanban, Loader2, X } from 'lucide-react';
import { useCreateGroup } from '../../hooks/useCreateGroup';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const toast = useToast();
  const createGroupMutation = useCreateGroup();
  const [name, setName] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [apiError, setApiError] = useState<string>('');

  if (!isOpen) return null;

  const handleClose = () => {
    if (createGroupMutation.isPending) return;
    setName('');
    setValidationError('');
    setApiError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setApiError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('اسم المجموعة مطلوب');
      return;
    }

    if (trimmedName.length < 3) {
      setValidationError('اسم المجموعة يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    if (trimmedName.length > 50) {
      setValidationError('اسم المجموعة يجب ألا يتجاوز 50 حرفاً');
      return;
    }

    createGroupMutation.mutate(
      { name: trimmedName },
      {
        onSuccess: () => {
          toast.success('تم إنشاء المجموعة بنجاح 📁');
          setName('');
          setValidationError('');
          setApiError('');
          onClose();
        },
        onError: (err) => {
          const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء إنشاء المجموعة');
          setApiError(msg);
          toast.error(msg);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100">
              <FolderKanban size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">إضافة مجموعة جديدة</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                أدخل اسم المجموعة لتنظيم الطلاب والمواعيد
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={createGroupMutation.isPending}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

       
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              اسم المجموعة <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              dir="rtl"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setValidationError('');
                setApiError('');
              }}
              disabled={createGroupMutation.isPending}
              placeholder="مثال: مجموعة السبت والأربعاء - الصف الأول الثانوي"
              className={`w-full px-4 py-3 rounded-xl border text-right text-sm font-medium transition outline-none ${
                validationError ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82]'
              } disabled:bg-slate-50 disabled:cursor-not-allowed`}
            />
            {validationError && (
              <p className="text-xs font-bold text-rose-600 mt-1">{validationError}</p>
            )}
          </div>

          {apiError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              {apiError}
            </div>
          )}

       
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={createGroupMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={createGroupMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {createGroupMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري الإنشاء...</span>
                </>
              ) : (
                <span>إنشاء المجموعة</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
