import React, { useState } from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import type { Lesson } from '../../../lessons/types/lesson';
import { useDeleteLesson } from '../../../lessons/hooks/useDeleteLesson';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';

interface DeleteLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  courseId: string;
}

export const DeleteLessonModal: React.FC<DeleteLessonModalProps> = ({
  isOpen,
  onClose,
  lesson,
  courseId,
}) => {
  const toast = useToast();
  const deleteLessonMutation = useDeleteLesson(courseId);
  const [deleteError, setDeleteError] = useState<string>('');

  const handleCloseModal = () => {
    if (deleteLessonMutation.isPending) return;
    onClose();
    setDeleteError('');
  };

  const handleConfirmDelete = () => {
    if (!lesson || !courseId) return;

    setDeleteError('');
    deleteLessonMutation.mutate(
      { lessonId: lesson._id },
      {
        onSuccess: () => {
          onClose();
          setDeleteError('');
          toast.success('تم حذف الدرس بنجاح 🎓');
        },
        onError: (err) => {
          const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء حذف الدرس');
          setDeleteError(msg);
          toast.error(msg);
        },
      }
    );
  };

  if (!isOpen || !lesson) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCloseModal();
        }
      }}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 text-center space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 shadow-2xs">
          <Trash2 size={28} />
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-black text-slate-800">حذف الدرس</h4>
          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
            هل أنت متأكد من حذف هذا الدرس؟
          </p>
          <p className="text-[11px] text-amber-700 font-bold bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            ⚠️ سيتم حذف الدرس والفيديو المرتبط به من التخزين نهائيًا.
          </p>
          {lesson.title && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 mt-2">
              {lesson.title}
            </div>
          )}
        </div>

        {deleteError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 text-right">
            <AlertTriangle size={16} className="shrink-0 text-rose-600" />
            <span>{deleteError}</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleCloseModal}
            disabled={deleteLessonMutation.isPending}
            className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={deleteLessonMutation.isPending}
            className="w-1/2 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleteLessonMutation.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>جاري حذف الدرس...</span>
              </>
            ) : (
              <span>حذف الدرس</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteLessonModal;
