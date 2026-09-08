import React, { useState } from 'react';
import { Plus, Trash2, Loader2, CheckCircle2, AlertTriangle, HelpCircle, Check, FileText, X, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { useCreateQuiz } from '../../hooks/useCreateQuiz';
import type { QuizQuestionPayload } from '../../api/teacherApi';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';

interface QuestionDraft {
  id: string;
  question: string;
  questionImage?: string;
  options: string[];
  answer: string;
}

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

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q_${Date.now()}`,
        question: '',
        questionImage: '',
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

  const handleQuestionImageChange = (qId: string, imageUrl: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, questionImage: imageUrl } : q))
    );
  };

  const handleImageFileSelect = (qId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميجابايت');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        handleQuestionImageChange(qId, result);
        toast.success('تم تحميل الصورة بنجاح 🖼️');
      }
    };
    reader.readAsDataURL(file);
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

    if (!selectedLessonId) {
      setValidationError('يرجى اختيار الدرس التابع له هذا الاختبار أولاً');
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle.length < 3) {
      setValidationError('عنوان الاختبار يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    const parsedDuration = Number(duration);
    if (isNaN(parsedDuration) || parsedDuration < 1) {
      setValidationError('مدة الاختبار يجب أن تكون دقيقة واحدة على الأقل');
      return;
    }

    const parsedPassing = Number(passingPercentage);
    if (isNaN(parsedPassing) || parsedPassing < 1 || parsedPassing > 100) {
      setValidationError('نسبة النجاح يجب أن تكون بين 1% و 100%');
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

        {/* Validation / Success Banners */}
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

        {/* Form */}
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

          <div className="space-y-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <HelpCircle size={18} className="text-amber-500" />
                <span>الأسئلة والاختيارات ({questions.length})</span>
              </h5>

              <button
                type="button"
                disabled={createQuizMutation.isPending}
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
                      disabled={createQuizMutation.isPending}
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
                    disabled={createQuizMutation.isPending}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                    <ImageIcon size={14} className="text-amber-600" />
                    <span>صورة توضيحية للسؤال (اختياري):</span>
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <label className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition cursor-pointer shrink-0">
                      <UploadCloud size={16} />
                      <span>اختر صورة من الموبايل / الجهاز 📱</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={createQuizMutation.isPending}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageFileSelect(q.id, file);
                        }}
                      />
                    </label>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={q.questionImage || ''}
                        onChange={(e) => handleQuestionImageChange(q.id, e.target.value)}
                        placeholder="أو ألصق رابط الصورة هنا..."
                        disabled={createQuizMutation.isPending}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-amber-500"
                      />
                      {q.questionImage && (
                        <button
                          type="button"
                          onClick={() => handleQuestionImageChange(q.id, '')}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition cursor-pointer shrink-0"
                          title="حذف الصورة"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {q.questionImage?.trim() && (
                    <div className="mt-2.5 relative rounded-xl overflow-hidden max-h-36 border border-slate-200 bg-white flex items-center justify-center p-2 w-fit max-w-xs">
                      <img
                        src={q.questionImage.trim()}
                        alt="معاينة صورة السؤال"
                        className="max-h-32 object-contain rounded-lg"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
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
                          disabled={createQuizMutation.isPending}
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
                          disabled={createQuizMutation.isPending}
                          className={`flex-1 px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white focus:outline-none ${
                            isCorrectAnswer
                              ? 'border-emerald-500 ring-1 ring-emerald-500'
                              : 'border-slate-200 focus:border-amber-500'
                          }`}
                        />

                        {q.options.length > 2 && (
                          <button
                            type="button"
                            disabled={createQuizMutation.isPending}
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
                    disabled={createQuizMutation.isPending}
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

          {/* Action buttons */}
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
