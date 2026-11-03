import React, { useState } from 'react';
import { Edit, Loader2, CheckCircle2, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { useTeacherQuiz } from '../../../quizzes/hooks/useTeacherQuiz';
import { useUpdateQuiz } from '../../../quizzes/hooks/useUpdateQuiz';
import type { TeacherQuiz, TeacherQuizQuestion } from '../../../quizzes/types/quiz';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';
import { QuizQuestionsListEditor, type QuestionDraft } from './QuizQuestionsListEditor';

interface EditQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  quizId: string | null;
}

export const EditQuizModal: React.FC<EditQuizModalProps> = ({
  isOpen,
  onClose,
  lessonId,
  quizId,
}) => {
  const {
    data: teacherQuiz,
    isLoading,
    isError,
    error,
    refetch,
  } = useTeacherQuiz(
    isOpen && lessonId && quizId ? lessonId : undefined,
    isOpen && lessonId && quizId ? quizId : undefined
  );

  if (!isOpen || !quizId) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-3xl w-full p-6 sm:p-8 space-y-6 relative my-8 text-right max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 shrink-0">
              <Edit size={18} />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-800">تعديل بيانات الاختبار</h4>
              <p className="text-[11px] text-slate-500 font-semibold">تعديل العنوان والمدة ونسبة النجاح والأسئلة</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 size={32} className="animate-spin text-amber-600" />
            <p className="text-xs font-semibold text-slate-500">جاري تحميل بيانات الاختبار...</p>
          </div>
        ) : isError || !teacherQuiz ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
            <AlertTriangle size={28} className="mx-auto text-red-600" />
            <p className="text-xs font-bold text-slate-800">
              {toArabicErrorMessage(error, 'تعذر تحميل بيانات الاختبار للتعديل')}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        ) : (
          <EditQuizForm
            key={teacherQuiz._id}
            teacherQuiz={teacherQuiz}
            lessonId={lessonId}
            quizId={quizId}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

const EditQuizForm: React.FC<{
  teacherQuiz: TeacherQuiz;
  lessonId: string;
  quizId: string;
  onClose: () => void;
}> = ({ teacherQuiz, lessonId, quizId, onClose }) => {
  const toast = useToast();
  const updateQuizMutation = useUpdateQuiz();

  const [title, setTitle] = useState(teacherQuiz.title || '');
  const [duration, setDuration] = useState<number>(teacherQuiz.duration ?? 15);
  const [passingPercentage, setPassingPercentage] = useState<number>(teacherQuiz.passingPercentage ?? 60);
  const [questions, setQuestions] = useState<QuestionDraft[]>(() =>
    teacherQuiz.questions && teacherQuiz.questions.length > 0
      ? teacherQuiz.questions.map((q, idx) => ({
          id: q._id || `q_${idx}`,
          _id: q._id,
          question: q.question || '',
          questionImage: q.questionImage || '',
          options: q.options ? [...q.options] : ['', ''],
          answer: q.answer || '',
        }))
      : [
          {
            id: 'q_0',
            question: '',
            questionImage: '',
            options: ['', ''],
            answer: '',
          },
        ]
  );
  const [validationError, setValidationError] = useState('');

  const handleCloseModal = () => {
    if (updateQuizMutation.isPending) return;
    onClose();
    setValidationError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!quizId || !lessonId) return;

    const triggerValidationError = (msg: string) => {
      setValidationError(msg);
      toast.error(msg);
    };

    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle.length < 3) {
      triggerValidationError('عنوان الاختبار يجب أن يكون 3 أحرف على الأقل ⚠️');
      return;
    }

    const parsedDuration = Number(duration);
    if (isNaN(parsedDuration) || parsedDuration < 0) {
      triggerValidationError('مدة الاختبار يجب أن تكون رقماً موجباً ⚠️');
      return;
    }

    const parsedPassing = Number(passingPercentage);
    if (isNaN(parsedPassing) || parsedPassing < 0 || parsedPassing > 100) {
      triggerValidationError('نسبة النجاح يجب أن تكون بين 0% و 100% ⚠️');
      return;
    }

    if (!questions || questions.length < 1) {
      triggerValidationError('الاختبار يجب أن يحتوي على سؤال واحد على الأقل ⚠️');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const trimmedQuestionText = q.question.trim();
      if (!trimmedQuestionText || trimmedQuestionText.length < 3) {
        triggerValidationError(`نص السؤال رقم ${i + 1} يجب أن يكون 3 أحرف على الأقل ⚠️`);
        return;
      }
      const validOptions = q.options.map((opt) => opt.trim()).filter((opt) => opt !== '');
      if (validOptions.length < 2) {
        triggerValidationError(`السؤال رقم ${i + 1} يجب أن يحتوي على اختيارين غير فارغين على الأقل ⚠️`);
        return;
      }
      if (!q.answer.trim() || !validOptions.includes(q.answer.trim())) {
        triggerValidationError(`يرجى تحديد الإجابة الصحيحة للسؤال رقم ${i + 1} ⚠️`);
        return;
      }
    }

    setValidationError('');

    const formattedQuestions: TeacherQuizQuestion[] = questions.map((q) => ({
      ...(q._id ? { _id: q._id } : {}),
      question: q.question.trim(),
      questionImage: q.questionImage?.trim() || undefined,
      options: q.options.map((opt) => opt.trim()).filter((opt) => opt !== ''),
      answer: q.answer.trim(),
    }));

    updateQuizMutation.mutate(
      {
        lessonId,
        quizId,
        payload: {
          title: trimmedTitle,
          duration: parsedDuration,
          passingPercentage: parsedPassing,
          questions: formattedQuestions,
        },
      },
      {
        onSuccess: () => {
          toast.success('تم تعديل الاختبار بنجاح 🎓');
          onClose();
        },
        onError: (err) => {
          const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء حفظ تعديلات الاختبار');
          setValidationError(msg);
          toast.error(msg);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {validationError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-bold flex items-center gap-2">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            اسم / عنوان الاختبار *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: اختبار تقييمي على الدرس الأول"
            disabled={updateQuizMutation.isPending}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            مدة الاختبار (بالدقائق) *
          </label>
          <input
            type="number"
            min={0}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            disabled={updateQuizMutation.isPending}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            نسبة النجاح المطلوبة (%) *
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={passingPercentage}
            onChange={(e) => setPassingPercentage(Number(e.target.value))}
            disabled={updateQuizMutation.isPending}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <QuizQuestionsListEditor
        lessonId={lessonId}
        questions={questions}
        onChangeQuestions={setQuestions}
        disabled={updateQuizMutation.isPending}
        onValidationError={setValidationError}
      />

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          disabled={updateQuizMutation.isPending}
          onClick={handleCloseModal}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={updateQuizMutation.isPending}
          className="px-6 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateQuizMutation.isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>جاري حفظ التعديلات...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              <span>حفظ التعديلات</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default EditQuizModal;
