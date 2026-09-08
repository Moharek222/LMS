import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useDeleteCourse } from '../../../courses/hooks/useDeleteCourse';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';

interface DeactivateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

export const DeactivateCourseModal: React.FC<DeactivateCourseModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
}) => {
  const toast = useToast();
  const deleteCourseMutation = useDeleteCourse();
  const [deactivateError, setDeactivateError] = useState<string>('');

  const handleCloseModal = () => {
    if (deleteCourseMutation.isPending) return;
    onClose();
    setDeactivateError('');
  };

  const handleConfirmDeactivate = () => {
    if (!courseId) return;

    setDeactivateError('');
    deleteCourseMutation.mutate(courseId, {
      onSuccess: () => {
        onClose();
        setDeactivateError('');
        toast.success('تم إيقاف الكورس بنجاح 🎓');
      },
      onError: (err) => {
        const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء إيقاف الكورس');
        setDeactivateError(msg);
        toast.error(msg);
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 shadow-2xs">
          <AlertTriangle size={28} />
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-black text-slate-800">إيقاف الكورس</h4>
          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
            هل أنت متأكد من إيقاف هذا الكورس؟ لن يظهر للطلاب ككورس متاح بعد إيقافه.
          </p>
          {courseTitle && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 mt-2">
              {courseTitle}
            </div>
          )}
        </div>

        {deactivateError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
            {deactivateError}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleCloseModal}
            disabled={deleteCourseMutation.isPending}
            className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleConfirmDeactivate}
            disabled={deleteCourseMutation.isPending}
            className="w-1/2 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {deleteCourseMutation.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>جاري إيقاف الكورس...</span>
              </>
            ) : (
              <span>إيقاف الكورس</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeactivateCourseModal;
