import React, { useState, useEffect } from 'react';
import { Edit, Plus, Trash2, Loader2, CheckCircle2, AlertTriangle, HelpCircle, Check, X, RefreshCw } from 'lucide-react';
import { useTeacherQuiz } from '../../../quizzes/hooks/useTeacherQuiz';
import { useUpdateQuiz } from '../../../quizzes/hooks/useUpdateQuiz';
import type { TeacherQuizQuestion } from '../../../quizzes/types/quiz';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';

interface QuestionDraft {
  id: string;
  _id?: string;
  question: string;
  options: string[];
  answer: string;
}

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
  const toast = useToast();
  const updateQuizMutation = useUpdateQuiz();

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

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState<number>(15);
  const [passingPercentage, setPassingPercentage] = useState<number>(60);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (teacherQuiz && isOpen) {
      setTitle(teacherQuiz.title || '');
      setDuration(teacherQuiz.duration ?? 15);
      setPassingPercentage(teacherQuiz.passingPercentage ?? 60);
      setQuestions(
        teacherQuiz.questions && teacherQuiz.questions.length > 0
          ? teacherQuiz.questions.map((q, idx) => ({
              id: q._id || `q_${idx}_${Date.now()}`,
              _id: q._id,
              question: q.question || '',
              options: q.options ? [...q.options] : ['', ''],
              answer: q.answer || '',
            }))
          : [
              {
                id: `q_${Date.now()}`,
                question: '',
                options: ['', ''],
                answer: '',
              },
            ]
      );
      setValidationError('');
    }
  }, [teacherQuiz, isOpen]);

  const handleCloseModal = () => {
    if (updateQuizMutation.isPending) return;
    onClose();
    setValidationError('');
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q_${Date.now()}`,
        question: '',
        options: ['', ''],
        answer: '',
      },
    ]);
  };

  const handleRemoveQuestion = (qId: string) => {
    if (questions.length <= 1) {
      setValidationError('الاختبار يجب أن يحتوي على سؤال واحد على الأقل');
      return;
    }
    setQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  const handleQuestionTextChange = (qId: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, question: text } : q))
    );
  };

  const handleAddOption = (qId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          return { ...q, options: [...q.options, ''] };
        }
        return q;
      })
    );
  };

  const handleRemoveOption = (qId: string, optIndex: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          if (q.options.length <= 2) return q;
          const removedValue = q.options[optIndex];
          const newOptions = q.options.filter((_, idx) => idx !== optIndex);
          const newAnswer = q.answer === removedValue ? '' : q.answer;
          return { ...q, options: newOptions, answer: newAnswer };
        }
        return q;
      })
    );
  };

  const handleOptionTextChange = (qId: string, optIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          const oldOptionValue = q.options[optIndex];
          const newOptions = [...q.options];
          newOptions[optIndex] = text;
          const newAnswer = q.answer === oldOptionValue ? text : q.answer;
          return { ...q, options: newOptions, answer: newAnswer };
        }
        return q;
      })
    );
  };

  const handleSelectAnswer = (qId: string, answerText: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, answer: answerText } : q))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!quizId || !lessonId) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle.length < 3) {
      setValidationError('عنوان الاختبار يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    const parsedDuration = Number(duration);
    if (isNaN(parsedDuration) || parsedDuration < 0) {
      setValidationError('مدة الاختبار يجب أن تكون رقماً موجباً');
      return;
    }

    const parsedPassing = Number(passingPercentage);
    if (isNaN(parsedPassing) || parsedPassing < 0 || parsedPassing > 100) {
      setValidationError('نسبة النجاح يجب أن تكون بين 0% و 100%');
      return;
    }

    if (!questions || questions.length < 1) {
      setValidationError('الاختبار يجب أن يحتوي على سؤال واحد على الأقل');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const trimmedQuestionText = q.question.trim();
      if (!trimmedQuestionText || trimmedQuestionText.length < 3) {
        setValidationError(`نص السؤال رقم ${i + 1} يجب أن يكون 3 أحرف على الأقل`);
        return;
      }
      const validOptions = q.options.map((opt) => opt.trim()).filter((opt) => opt !== '');
      if (validOptions.length < 2) {
        setValidationError(`السؤال رقم ${i + 1} يجب أن يحتوي على اختيارين غير فارغين على الأقل`);
        return;
      }
      if (!q.answer.trim() || !validOptions.includes(q.answer.trim())) {
        setValidationError(`يرجى تحديد الإجابة الصحيحة للسؤال رقم ${i + 1}`);
        return;
      }
    }

    setValidationError('');

    const formattedQuestions: TeacherQuizQuestion[] = questions.map((q) => ({
      ...(q._id ? { _id: q._id } : {}),
      question: q.question.trim(),
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

  if (!isOpen || !quizId) return null;

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
            disabled={updateQuizMutation.isPending}
            onClick={handleCloseModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        {/* Loading details state */}
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 size={32} className="animate-spin text-amber-600" />
            <p className="text-xs font-semibold text-slate-500">جاري تحميل بيانات الاختبار...</p>
          </div>
        ) : isError ? (
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

            <div className="space-y-6 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <HelpCircle size={18} className="text-amber-500" />
                  <span>الأسئلة والاختيارات ({questions.length})</span>
                </h5>

                <button
                  type="button"
                  disabled={updateQuizMutation.isPending}
                  onClick={handleAddQuestion}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition cursor-pointer disabled:opacity-50"
                >
                  <Plus size={14} />
                  <span>إضافة سؤال جديد</span>
                </button>
              </div>

              {questions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-800 font-black text-xs border border-amber-200">
                      السؤال {qIndex + 1}
                    </span>

                    {questions.length > 1 && (
                      <button
                        type="button"
                        disabled={updateQuizMutation.isPending}
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
                        title="حذف السؤال"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                      placeholder="اكتب نص السؤال هنا (3 أحرف على الأقل)..."
                      disabled={updateQuizMutation.isPending}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-2.5 pr-2 sm:pr-6">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      الاختيارات (اضغط على الدائرة بجانب الاختيار لتحديده كإجابة صحيحة):
                    </label>

                    {q.options.map((opt, optIdx) => {
                      const isCorrectAnswer = Boolean(q.answer && q.answer === opt && opt.trim() !== '');

                      return (
                        <div key={optIdx} className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={updateQuizMutation.isPending}
                            onClick={() => opt.trim() && handleSelectAnswer(q.id, opt)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition cursor-pointer disabled:opacity-50 ${
                              isCorrectAnswer
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'bg-white border-slate-300 hover:border-amber-400'
                            }`}
                            title="تحديد كإجابة صحيحة"
                          >
                            {isCorrectAnswer && <Check size={14} />}
                          </button>

                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionTextChange(q.id, optIdx, e.target.value)}
                            placeholder={`الاختيار رقم ${optIdx + 1}`}
                            disabled={updateQuizMutation.isPending}
                            className={`flex-1 px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white focus:outline-none ${
                              isCorrectAnswer
                                ? 'border-emerald-500 ring-1 ring-emerald-500'
                                : 'border-slate-200 focus:border-amber-500'
                            }`}
                          />

                          {q.options.length > 2 && (
                            <button
                              type="button"
                              disabled={updateQuizMutation.isPending}
                              onClick={() => handleRemoveOption(q.id, optIdx)}
                              className="p-1 text-slate-400 hover:text-red-500 transition cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      disabled={updateQuizMutation.isPending}
                      onClick={() => handleAddOption(q.id)}
                      className="mt-2 text-xs font-bold text-amber-600 hover:text-amber-700 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Plus size={14} />
                      <span>إضافة اختيار آخر</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

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
        )}
      </div>
    </div>
  );
};

export default EditQuizModal;
