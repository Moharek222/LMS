import React, { useState } from 'react';
import { Award, Plus, Loader2, AlertTriangle, X, Trash2, HelpCircle, Check } from 'lucide-react';
import { useCreateExam } from '../../hooks/useCreateExam';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';

interface QuestionDraft {
  id: string;
  question: string;
  options: string[];
  answer: string;
}

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourseId: string;
}

export const CreateExamModal: React.FC<CreateExamModalProps> = ({
  isOpen,
  onClose,
  selectedCourseId,
}) => {
  const toast = useToast();
  const createExamMutation = useCreateExam();

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      id: 'q_1',
      question: '',
      options: ['', ''],
      answer: '',
    },
  ]);
  const [validationError, setValidationError] = useState('');

  const resetForm = () => {
    setTitle('');
    setDuration(30);
    setQuestions([
      {
        id: `q_${Date.now()}`,
        question: '',
        options: ['', ''],
        answer: '',
      },
    ]);
    setValidationError('');
  };

  const handleCloseModal = () => {
    if (createExamMutation.isPending) return;
    onClose();
    setValidationError('');
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        question: '',
        options: ['', ''],
        answer: '',
      },
    ]);
  };

  const handleRemoveQuestion = (qId: string) => {
    if (questions.length <= 1) {
      setValidationError('الامتحان يجب أن يحتوي على سؤال واحد على الأقل');
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
      prev.map((q) => (q.id === qId ? { ...q, options: [...q.options, ''] } : q))
    );
  };

  const handleRemoveOption = (qId: string, optIndex: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          if (q.options.length <= 2) return q;
          const removedOpt = q.options[optIndex];
          const newOptions = q.options.filter((_, idx) => idx !== optIndex);
          const newAnswer = q.answer === removedOpt ? '' : q.answer;
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
          const oldOptText = q.options[optIndex];
          const newOptions = [...q.options];
          newOptions[optIndex] = text;
          const newAnswer = q.answer === oldOptText ? text : q.answer;
          return { ...q, options: newOptions, answer: newAnswer };
        }
        return q;
      })
    );
  };

  const handleSetAnswer = (qId: string, selectedAnswer: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, answer: selectedAnswer } : q))
    );
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourseId) {
      setValidationError('يرجى اختيار الكورس أولاً');
      return;
    }

    if (!title.trim() || title.trim().length < 3) {
      setValidationError('عنوان الامتحان يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    const numDuration = Number(duration);
    if (isNaN(numDuration) || numDuration <= 0) {
      setValidationError('مدة الامتحان يجب أن تكون رقماً أكبر من صفر');
      return;
    }

    if (questions.length === 0) {
      setValidationError('الامتحان يجب أن يحتوي على سؤال واحد على الأقل');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim() || q.question.trim().length < 3) {
        setValidationError(`السؤال رقم ${i + 1} يجب أن يتكون من 3 أحرف على الأقل`);
        return;
      }

      const validOptions = q.options.map((opt) => opt.trim()).filter((opt) => opt !== '');
      if (validOptions.length < 2) {
        setValidationError(`السؤال رقم ${i + 1} يجب أن يحتوي على اختيارين غير فارغين على الأقل`);
        return;
      }

      if (!q.answer.trim() || !validOptions.includes(q.answer.trim())) {
        setValidationError(`يرجى تحديد إجابة صحيحة تطابق أحد الاختيارات في السؤال رقم ${i + 1}`);
        return;
      }
    }

    setValidationError('');

    const formattedQuestions = questions.map((q) => ({
      question: q.question.trim(),
      options: q.options.map((opt) => opt.trim()).filter((opt) => opt !== ''),
      answer: q.answer.trim(),
    }));

    createExamMutation.mutate(
      {
        courseId: selectedCourseId,
        payload: {
          title: title.trim(),
          duration: numDuration,
          questions: formattedQuestions,
        },
      },
      {
        onSuccess: () => {
          onClose();
          resetForm();
          toast.success('تم إنشاء وتفعيل الامتحان الشامل بنجاح 🎓✨');
        },
        onError: (err) => {
          const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء إنشاء الامتحان، يرجى المحاولة مرة أخرى.');
          setValidationError(msg);
          toast.error(msg);
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
              <Award size={22} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800">إضافة امتحان شامل جديد</h3>
              <p className="text-xs text-slate-500 font-semibold">
                إضافة امتحان جديد وتحديد مدته والأسئلة والاختيارات
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            disabled={createExamMutation.isPending}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                عنوان الامتحان الشامل *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: امتحان الباب الأول - الكيمياء العامة"
                disabled={createExamMutation.isPending}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0D8A82] focus:ring-2 focus:ring-teal-500/10 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                المدة الزمنية (بالدقائق) *
              </label>
              <input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={createExamMutation.isPending}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0D8A82] focus:ring-2 focus:ring-teal-500/10 transition"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <HelpCircle size={16} className="text-[#0D8A82]" />
                <span>أسئلة الامتحان الشامل ({questions.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleAddQuestion}
                disabled={createExamMutation.isPending}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 text-[#0D8A82] border border-teal-100 text-xs font-bold hover:bg-teal-100 transition cursor-pointer"
              >
                <Plus size={14} />
                <span>إضافة سؤال آخر</span>
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
              {questions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-4 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#0D8A82] text-white text-[11px] font-extrabold">
                      السؤال {qIndex + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        disabled={createExamMutation.isPending}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={14} />
                        <span>حذف السؤال</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                      placeholder={`نص السؤال رقم ${qIndex + 1}...`}
                      disabled={createExamMutation.isPending}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-[#0D8A82]"
                    />
                  </div>

                  <div className="space-y-2.5 pr-2">
                    <label className="block text-[11px] font-bold text-slate-500">
                      الاختيارات المتاحة (انقر على الاختيار لتحديده كإجابة صحيحة):
                    </label>
                    {q.options.map((opt, optIndex) => {
                      const isCorrect = q.answer !== '' && q.answer === opt;
                      return (
                        <div key={optIndex} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (opt.trim()) handleSetAnswer(q.id, opt);
                            }}
                            title={isCorrect ? 'الإجابة الصحيحة المحددة' : 'تحديد كإجابة صحيحة'}
                            className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border transition ${
                              isCorrect
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                : 'bg-white text-slate-400 border-slate-200 hover:border-teal-400'
                            }`}
                          >
                            {isCorrect ? <Check size={14} /> : String.fromCharCode(65 + optIndex)}
                          </button>

                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionTextChange(q.id, optIndex, e.target.value)}
                            placeholder={`اختيار ${optIndex + 1}...`}
                            disabled={createExamMutation.isPending}
                            className={`flex-1 px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white focus:outline-none ${
                              isCorrect
                                ? 'border-emerald-500 ring-2 ring-emerald-500/10'
                                : 'border-slate-200 focus:border-[#0D8A82]'
                            }`}
                          />

                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(q.id, optIndex)}
                              disabled={createExamMutation.isPending}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => handleAddOption(q.id)}
                      disabled={createExamMutation.isPending}
                      className="text-[11px] text-[#0D8A82] font-bold hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>إضافة اختيار آخر</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={createExamMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={createExamMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              {createExamMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري إنشاء الامتحان...</span>
                </>
              ) : (
                <span>إنشاء الامتحان</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExamModal;
