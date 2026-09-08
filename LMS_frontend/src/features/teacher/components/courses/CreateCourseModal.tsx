import React, { useState } from 'react';
import { Plus, Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useCreateCourse } from '../../hooks/useCreateCourse';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ isOpen, onClose }) => {
  const toast = useToast();
  const createCourseMutation = useCreateCourse();

  const [title, setTitle] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleCloseModal = () => {
    if (createCourseMutation.isPending) return;
    onClose();
    setValidationError('');
    setSuccessMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 3) {
      setValidationError('اسم المقرر يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    setValidationError('');
    setSuccessMessage('');

    createCourseMutation.mutate(
      {
        title: title.trim(),
        isPublished,
      },
      {
        onSuccess: () => {
          setTitle('');
          onClose();
          toast.success('تم إنشاء المقرر الدراسي بنجاح ✨');
        },
        onError: (err) => {
          toast.error(toArabicErrorMessage(err, 'تعذر إنشاء المقرر، يرجى إعادة المحاولة.'));
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCloseModal();
        }
      }}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative my-8 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Plus size={18} className="text-[#0D8A82]" />
            <span>إضافة مقرر جديد</span>
          </h4>
          <button
            type="button"
            disabled={createCourseMutation.isPending}
            onClick={handleCloseModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        {validationError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {createCourseMutation.isError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{toArabicErrorMessage(createCourseMutation.error, 'حصلت مشكلة أثناء إنشاء الكورس، حاول مرة تانية.')}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              عنوان المقرر / الكورس *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: الكيمياء العضوية - الصف الثالث"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82]"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-700">تفعيل النشر للطلاب</span>
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isPublished ? 'bg-[#0D8A82]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isPublished ? 'translate-x-0' : '-translate-x-5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={createCourseMutation.isPending}
              onClick={handleCloseModal}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={createCourseMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createCourseMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري الإنشاء...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>حفظ المقرر</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;
