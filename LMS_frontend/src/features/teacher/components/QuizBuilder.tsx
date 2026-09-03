import React, { useState } from 'react';
import { FileText, Plus, Trash2, Loader2, CheckCircle2, AlertTriangle, HelpCircle, Check } from 'lucide-react';
import { useTeacherCourses } from '../hooks/useTeacherCourses';
import { useCourseLessons } from '../../lessons/hooks/useCourseLessons';
import { useCreateQuiz } from '../hooks/useCreateQuiz';
import type { QuizQuestionPayload } from '../api/teacherApi';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { useToast } from '../../../context/ToastContext';

interface QuestionDraft {
  id: string;
  question: string;
  options: string[];
  answer: string;
}

export const QuizBuilder: React.FC = () => {
  const toast = useToast();
  const { data: courses, isLoading: isLoadingCourses } = useTeacherCourses();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const { data: lessons, isLoading: isLoadingLessons } = useCourseLessons(selectedCourseId);
  const [selectedLessonId, setSelectedLessonId] = useState('');

  const createQuizMutation = useCreateQuiz();

  // Quiz Meta
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState<number>(15);
  const [passingPercentage, setPassingPercentage] = useState<number>(60);

  // Questions Draft State
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      id: 'q_1',
      question: '',
      options: ['', ''],
      answer: '',
    },
  ]);

  // UI Feedback
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
          const newOptions = q.options.filter((_, idx) => idx !== optIndex);
          const newAnswer = q.answer === q.options[optIndex] ? '' : q.answer;
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
    if (!title.trim() || title.trim().length < 3) {
      setValidationError('عنوان الاختبار يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    // Validate Questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setValidationError(`يرجى كتابة نص السؤال رقم ${i + 1}`);
        return;
      }
      const validOptions = q.options.filter((opt) => opt.trim() !== '');
      if (validOptions.length < 2) {
        setValidationError(`السؤال رقم ${i + 1} يجب أن يحتوي على اختيارين على الأقل`);
        return;
      }
      if (!q.answer || !validOptions.includes(q.answer)) {
        setValidationError(`يرجى تحديد الإجابة الصحيحة للسؤال رقم ${i + 1}`);
        return;
      }
    }

    setValidationError('');
    setSuccessMessage('');

    const formattedQuestions: QuizQuestionPayload[] = questions.map((q) => ({
      question: q.question.trim(),
      options: q.options.map((opt) => opt.trim()).filter((opt) => opt !== ''),
      answer: q.answer.trim(),
    }));

    createQuizMutation.mutate(
      {
        lessonId: selectedLessonId,
        payload: {
          title: title.trim(),
          duration: Number(duration) || 15,
          passingPercentage: Number(passingPercentage) || 60,
          questions: formattedQuestions,
        },
      },
      {
        onSuccess: () => {
          setTitle('');
          setQuestions([
            {
              id: `q_${Date.now()}`,
              question: '',
              options: ['', ''],
              answer: '',
            },
          ]);
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-6">
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
          {/* Step 1: Select Course & Lesson */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/90">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                1. اختر الكورس / المقرر *
              </label>
              {isLoadingCourses ? (
                <div className="p-2.5 bg-white rounded-xl text-xs font-semibold text-slate-400 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-amber-500" />
                  <span>جاري تحميل الكورسات...</span>
                </div>
              ) : (
                <select
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    setSelectedLessonId('');
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- اختر كورس --</option>
                  {courses?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                2. اختر الدرس التابع له الاختبار *
              </label>
              {!selectedCourseId ? (
                <div className="p-2.5 bg-white rounded-xl text-xs font-semibold text-slate-400">
                  اختر الكورس أولاً لعرض درووسه
                </div>
              ) : isLoadingLessons ? (
                <div className="p-2.5 bg-white rounded-xl text-xs font-semibold text-slate-400 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-amber-500" />
                  <span>جاري تحميل الدروس...</span>
                </div>
              ) : !lessons || lessons.length === 0 ? (
                <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl text-xs font-bold border border-amber-200">
                  لا توجد دروس مضافة لهذا الكورس بعد
                </div>
              ) : (
                <select
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- اختر الدرس --</option>
                  {lessons.map((l) => (
                    <option key={l._id} value={l._id}>
                      الدرس {l.order}: {l.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Step 2: Quiz Meta */}
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Step 3: Dynamic Questions Section */}
          <div className="space-y-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <HelpCircle size={18} className="text-amber-500" />
                <span>الأسئلة والاختيارات ({questions.length})</span>
              </h5>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
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
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="حذف السؤال"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Question Input */}
                <div>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                    placeholder="اكتب نص السؤال هنا..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Options Inputs */}
                <div className="space-y-2.5 pr-2 sm:pr-6">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    الاختيارات (اضغط على الدائرة بجانب الاختيار لتحديده كإجابة صحيحة):
                  </label>

                  {q.options.map((opt, optIdx) => {
                    const isCorrectAnswer = q.answer && q.answer === opt && opt.trim() !== '';

                    return (
                      <div key={optIdx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => opt.trim() && handleSelectAnswer(q.id, opt)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition cursor-pointer ${
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
                          className={`flex-1 px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white focus:outline-none ${
                            isCorrectAnswer
                              ? 'border-emerald-500 ring-1 ring-emerald-500'
                              : 'border-slate-200 focus:border-amber-500'
                          }`}
                        />

                        {q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(q.id, optIdx)}
                            className="p-1 text-slate-400 hover:text-red-500 transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => handleAddOption(q.id)}
                    className="mt-2 text-xs font-bold text-amber-600 hover:text-amber-700 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>إضافة اختيار آخر</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={createQuizMutation.isPending || !selectedLessonId}
            className="w-full py-3.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
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
        </form>
      </div>
    </div>
  );
};

export default QuizBuilder;
