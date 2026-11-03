import React, { useState } from 'react';
import { Plus, Loader2, CheckCircle2, AlertTriangle, FileText, X } from 'lucide-react';
import { useCreateQuiz } from '../../hooks/useCreateQuiz';
import type { QuizQuestionPayload } from '../../api/teacherApi';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';
import { QuizQuestionsListEditor, type QuestionDraft } from './QuizQuestionsListEditor';

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLessonId: string;
}

export const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  isOpen,
  onClose,
  selectedLessonId,
}) => {
  const toast = useToast();
  const createQuizMutation = useCreateQuiz();

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState<number>(15);
  const [passingPercentage, setPassingPercentage] = useState<number>(60);

  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      id: 'q_1',
      question: '',
      options: ['', ''],
      answer: '',
    },
  ]);

  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const resetForm = () => {
    setTitle('');
    setDuration(15);
    setPassingPercentage(60);
    setQuestions([
      {
        id: `q_${Date.now()}`,
        question: '',
        questionImage: '',
        options: ['', ''],
        answer: '',
      },
    ]);
    setValidationError('');
    setSuccessMessage('');
  };

  const handleCloseModal = () => {
    if (createQuizMutation.isPending) return;
    onClose();
    setValidationError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const triggerValidationError = (msg: string) => {
      setValidationError(msg);
      toast.error(msg);
    };

    if (!selectedLessonId) {
      triggerValidationError('يرجى اختيار الدرس التابع له هذا الاختبار أولاً');
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle.length < 3) {
      triggerValidationError('اسم / عنوان الاختبار يجب أن يكون 3 أحرف على الأقل ⚠️');
      return;
    }

    const parsedDuration = Number(duration);
    if (isNaN(parsedDuration) || parsedDuration < 1) {
      triggerValidationError('مدة الاختبار يجب أن تكون دقيقة واحدة على الأقل ⚠️');
      return;
    }

    const parsedPassing = Number(passingPercentage);
    if (isNaN(parsedPassing) || parsedPassing < 1 || parsedPassing > 100) {
      triggerValidationError('نسبة النجاح يجب أن تكون بين 1% و 100% ⚠️');
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
    setSuccessMessage('');

    const formattedQuestions: QuizQuestionPayload[] = questions.map((q) => ({
      question: q.question.trim(),
      questionImage: q.questionImage?.trim() || undefined,
      options: q.options.map((opt) => opt.trim()).filter((opt) => opt !== ''),
      answer: q.answer.trim(),
    }));

    createQuizMutation.mutate(
      {
        lessonId: selectedLessonId,
        payload: {
          title: trimmedTitle,
          duration: parsedDuration,
          passingPercentage: parsedPassing,
          questions: formattedQuestions,
        },
      },
      {
        onSuccess: () => {
          resetForm();
          onClose();
          toast.success('تم إنشاء وتفعيل الاختبار بنجاح 📝✨');
        },
        onError: (err) => {
          const msg = toArabicErrorMessage(err, 'حصلت مشكلة أثناء إنشاء الاختبار، حاول مرة تانية.');
          setValidationError(msg);
          toast.error(msg);
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
        className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-3xl w-full p-6 sm:p-8 space-y-6 relative my-8 text-right max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Plus size={18} className="text-amber-600" />
            <span>إضافة اختبار جديد</span>
          </h4>
          <button
            type="button"
            disabled={createQuizMutation.isPending}
            onClick={handleCloseModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        {validationError && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
                disabled={createQuizMutation.isPending}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                مدة الاختبار (بالدقائق) *
              </label>
              <input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={createQuizMutation.isPending}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نسبة النجاح المطلوبة (%) *
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={passingPercentage}
                onChange={(e) => setPassingPercentage(Number(e.target.value))}
                disabled={createQuizMutation.isPending}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <QuizQuestionsListEditor
            lessonId={selectedLessonId}
            questions={questions}
            onChangeQuestions={setQuestions}
            disabled={createQuizMutation.isPending}
            onValidationError={setValidationError}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={createQuizMutation.isPending}
              onClick={handleCloseModal}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={createQuizMutation.isPending || !selectedLessonId}
              className="px-6 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createQuizMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>جاري حفظ الاختبار...</span>
                </>
              ) : (
                <>
                  <FileText size={18} />
                  <span>حفظ وإنشاء الاختبار</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuizModal;
