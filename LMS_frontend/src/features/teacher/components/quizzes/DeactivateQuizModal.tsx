import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { QuizListItem } from '../../../quizzes/types/quiz';
import { useDeleteQuiz } from '../../../quizzes/hooks/useDeleteQuiz';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';

interface DeactivateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  quiz: QuizListItem | null;
}

export const DeactivateQuizModal: React.FC<DeactivateQuizModalProps> = ({
  isOpen,
  onClose,
  lessonId,
  quiz,
}) => {
  const toast = useToast();
  const deleteQuizMutation = useDeleteQuiz();
  const [deactivateError, setDeactivateError] = useState<string>('');

  const handleCloseModal = () => {
    if (deleteQuizMutation.isPending) return;
    onClose();
    setDeactivateError('');
  };

  const handleConfirmDeactivate = () => {
    if (!quiz || !lessonId) return;

    setDeactivateError('');
    deleteQuizMutation.mutate(
      { lessonId, quizId: quiz._id },
      {
        onSuccess: () => {
          onClose();
          setDeactivateError('');
          toast.success('تم إيقاف الاختبار بنجاح 🎓');
        },
        onError: (err) => {
          const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء إيقاف الاختبار');
          setDeactivateError(msg);
          toast.error(msg);
        },
      }
    );
  };

  if (!isOpen || !quiz) return null;

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
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
          <AlertTriangle size={28} />
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-black text-slate-800">إيقاف الاختبار</h4>
          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
            هل أنت متأكد من إيقاف هذا الاختبار؟
          </p>
          <p className="text-[11px] text-amber-700 font-bold bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            سيتم إيقاف الاختبار ولن يظهر للطلاب كاختبار نشط.
          </p>
          {quiz.title && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 mt-2">
              {quiz.title}
            </div>
          )}
        </div>

        {deactivateError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 text-right">
            <AlertTriangle size={16} className="shrink-0 text-rose-600" />
            <span>{deactivateError}</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleCloseModal}
            disabled={deleteQuizMutation.isPending}
            className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleConfirmDeactivate}
            disabled={deleteQuizMutation.isPending}
            className="w-1/2 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleteQuizMutation.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>جاري إيقاف الاختبار...</span>
              </>
            ) : (
              <span>إيقاف الاختبار</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeactivateQuizModal;
