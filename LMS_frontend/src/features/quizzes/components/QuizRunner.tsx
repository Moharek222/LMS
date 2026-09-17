import React, { useState, useRef } from 'react';
import {
  Clock,
  Award,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Send,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { useStudentQuiz } from '../hooks/useStudentQuiz';
import { useSubmitQuiz } from '../hooks/useSubmitQuiz';
import { useStudentQuizHistory } from '../../student/hooks/useStudentQuizHistory';
import type { StudentQuiz } from '../types/quiz';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { useToast } from '../../../context/ToastContext';
import type { QuizSubmissionData } from '../api/quizSubmissionApi';

interface QuizRunnerProps {
  lessonId: string;
  quizId: string;
  onClose: () => void;
  onPassed?: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  lessonId,
  quizId,
  onClose,
  onPassed,
}) => {
  const toast = useToast();
  const { data: quizData, isLoading: isLoadingQuiz, isError: isQuizError } = useStudentQuiz(lessonId, quizId);
  const submitQuizMutation = useSubmitQuiz();
  const { data: quizHistoryData } = useStudentQuizHistory({ page: 1, limit: 100 });

  const isSubmittingRef = useRef<boolean>(false);
  const draftAnswersKey = `lms_quiz_draft_answers_${quizId}`;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  // Restore draft answers safely on mount
  React.useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(draftAnswersKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          setAnswers(parsed);
        } else {
          localStorage.removeItem(draftAnswersKey);
        }
      } else {
        setAnswers({});
      }
    } catch {
      // Ignore storage errors
    }
  }, [quizId, draftAnswersKey]);

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');
  const [submissionResult, setSubmissionResult] = useState<QuizSubmissionData | null>(null);

  React.useEffect(() => {
    const hasUnsavedAnswers = Object.keys(answers).length > 0 && !submissionResult;
    if (!hasUnsavedAnswers) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [answers, submissionResult]);

  const quiz: StudentQuiz | undefined = quizData;
  const questions = quiz?.questions || [];

  const existingSubmissionFromHistory = React.useMemo(() => {
    if (!quizHistoryData?.data) return null;
    return quizHistoryData.data.find((sub) => {
      const subQuizId = typeof sub.quizID === 'string' ? sub.quizID : sub.quizID?._id;
      return subQuizId && String(subQuizId).trim() === String(quizId).trim();
    });
  }, [quizHistoryData, quizId]);

  React.useEffect(() => {
    if (!isRetrying && existingSubmissionFromHistory && !submissionResult) {
      setSubmissionResult({
        score: existingSubmissionFromHistory.score,
        totalQuestions: questions.length || 1,
        isPassed: existingSubmissionFromHistory.isPassed,
      });
      if (existingSubmissionFromHistory.isPassed) {
        onPassed?.();
      }
    }
  }, [existingSubmissionFromHistory, submissionResult, questions.length, onPassed, isRetrying]);

  const handleSelectOption = (questionId: string, optionText: string) => {
    setAnswers((prev) => {
      const updated = {
        ...prev,
        [questionId]: optionText,
      };
      try {
        localStorage.setItem(draftAnswersKey, JSON.stringify(updated));
      } catch {
        // Ignore storage write error
      }
      return updated;
    });
    setValidationError('');
  };

  const handleValidateBeforeSubmit = () => {
    if (questions.length === 0) return;

    const answeredCount = Object.keys(answers).length;
    const unansweredCount = questions.length - answeredCount;

    if (unansweredCount > 0) {
      setValidationError(`متبقي ${unansweredCount} أسئلة بدون إجابة`);
      return;
    }

    setValidationError('');
    setShowConfirmModal(true);
  };

  const handleExecuteSubmission = () => {
    if (submitQuizMutation.isPending || isSubmittingRef.current || submissionResult) {
      return;
    }

    isSubmittingRef.current = true;
    setShowConfirmModal(false);

    const selectedOptionPayload = Object.entries(answers).map(([qId, ans]) => ({
      QuestionId: qId,
      selectedAnswer: ans,
    }));

    submitQuizMutation.mutate(
      {
        lessonId,
        quizId,
        payload: {
          selectedOption: selectedOptionPayload,
        },
      },
      {
        onSuccess: (data) => {
          isSubmittingRef.current = false;
          try {
            localStorage.removeItem(draftAnswersKey);
          } catch {
            // Ignore storage errors
          }
          setSubmissionResult(data);
          if (data.isPassed) {
            onPassed?.();
            toast.success(`أحسنت يا بطل! تم اجتياز الاختبار بنجاح بنسبة ${Math.round((data.score / data.totalQuestions) * 100)}% 🏆✨`);
          } else {
            toast.warning(`تم تسليم الاختبار. حصلت على ${data.score} من ${data.totalQuestions}. يمكنك المراجعة والمحاولة مجدداً 💪`);
          }
        },
        onError: (err: any) => {
          isSubmittingRef.current = false;
          const status = err?.response?.status;
          const msg = err?.message || err?.response?.data?.message || '';

          if (status === 409 || msg.includes('already submitted') || msg.includes('409') || msg.includes('CONFLICT')) {
            try {
              localStorage.removeItem(draftAnswersKey);
            } catch {
              // Ignore storage errors
            }
            const fallbackResult: QuizSubmissionData = {
              score: Object.keys(answers).length,
              totalQuestions: questions.length,
              isPassed: true,
            };
            setSubmissionResult(fallbackResult);
            onPassed?.();
            toast.info('تم تسليم هذا الاختبار سابقاً بنجاح.');
          } else {
            toast.error(toArabicErrorMessage(err, 'حدث خطأ أثناء تسليم الاختبار، حاول مرة أخرى.'));
          }
        },
      }
    );
  };

  const handleBackClick = () => {
    if (submissionResult) {
      onClose();
      return;
    }
    if (Object.keys(answers).length > 0) {
      setShowExitModal(true);
    } else {
      onClose();
    }
  };

  if (isLoadingQuiz && !quiz) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col items-center justify-center min-h-55 text-center space-y-3">
        <Loader2 size={36} className="animate-spin text-amber-500" />
        <p className="text-sm font-bold text-slate-700">جاري تجهيز أسئلة الاختبار...</p>
      </div>
    );
  }

  if (isQuizError && !quiz) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-xs text-center space-y-4">
        <AlertTriangle size={36} className="text-red-500 mx-auto" />
        <h4 className="text-base font-bold text-slate-800">تعذر تحميل أسئلة الاختبار</h4>
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition"
        >
          العودة
        </button>
      </div>
    );
  }

  /* Result screen */
  if (submissionResult) {
    const isPassed = submissionResult.isPassed;
    const score = submissionResult.score;
    const total = submissionResult.totalQuestions || questions.length || 1;
    const percentage = Math.round((score / total) * 100);

    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 text-center">
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto border shadow-sm ${
            isPassed
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : 'bg-amber-50 text-amber-600 border-amber-200'
          }`}
        >
          {isPassed ? <CheckCircle2 size={46} /> : <XCircle size={46} />}
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-xl sm:text-2xl font-black text-slate-800">
            {isPassed ? 'مبروك 🎉 تم اجتياز الاختبار بنجاح' : 'لم تحقق درجة النجاح المطلوبة هذه المرة'}
          </h3>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            {isPassed
              ? 'أحسنت الاستيعاب، استمر في التقدم والمراجعة الفعالة!'
              : 'يمكنك مراجعة الشرح التفاعلي وإعادة المحاولة مجدداً.'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/90 max-w-sm mx-auto flex items-center justify-around gap-4 shadow-2xs">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block mb-0.5">درجتك النهائية</span>
            <span className="text-2xl font-black text-slate-800">
              {score} / {total}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-200" />

          <div>
            <span className="text-[11px] text-slate-400 font-bold block mb-0.5">النسبة المئوية</span>
            <span
              className={`text-2xl font-black ${
                isPassed ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {percentage}%
            </span>
          </div>
        </div>

        {quiz?.passingPercentage !== undefined && (
          <p className="text-xs text-slate-400 font-semibold">
            درجة النجاح المطلوبة لاجتياز الاختبار: {quiz.passingPercentage}%
          </p>
        )}

        <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
          {!isPassed && (
            <button
              onClick={() => {
                setIsRetrying(true);
                setSubmissionResult(null);
                setAnswers({});
                try {
                  localStorage.removeItem(draftAnswersKey);
                } catch {
                  // Ignore storage errors
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition cursor-pointer shadow-sm"
            >
              <RotateCcw size={15} />
              <span>إعادة محاولة حل الاختبار 🔄</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-sm"
          >
            العودة لقائمة الدروس
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-6 relative">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackClick}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="رجوع"
          >
            <ArrowRight size={20} />
          </button>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-800">
              {quiz?.title || 'حل الاختبار'}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <HelpCircle size={14} className="text-teal-600" />
                <span>تم إجابة: {answeredCount} من {questions.length}</span>
              </span>
              {quiz?.duration !== undefined && (
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-amber-600" />
                  <span>المدة: {quiz.duration} دقيقة</span>
                </span>
              )}
              {quiz?.passingPercentage !== undefined && (
                <span className="flex items-center gap-1">
                  <Award size={14} className="text-amber-600" />
                  <span>درجة النجاح: {quiz.passingPercentage}%</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleValidateBeforeSubmit}
          disabled={submitQuizMutation.isPending || isSubmittingRef.current}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer shadow-sm disabled:opacity-50 shrink-0 self-end sm:self-auto"
        >
          <Send size={15} />
          <span>{submitQuizMutation.isPending ? 'جاري التسليم...' : 'تسليم الاختبار'}</span>
        </button>
      </div>

      
      {validationError && (
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-center justify-between gap-3 text-amber-800 text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600 shrink-0" />
            <span>{validationError}</span>
          </div>
          <span className="text-[11px] text-amber-700">يرجى الإجابة على كافة الأسئلة قبل التسليم</span>
        </div>
      )}

      
      {submitQuizMutation.isError && (
        <div className="bg-red-50 rounded-2xl p-4 border border-red-200 flex items-center justify-between gap-3 text-red-800 text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600 shrink-0" />
            <span>
              {toArabicErrorMessage(submitQuizMutation.error, 'حدث خطأ أثناء تسليم الاختبار، حاول مرة أخرى.')}
            </span>
          </div>
          <button
            onClick={handleValidateBeforeSubmit}
            className="px-3 py-1 bg-red-600 text-white text-[11px] font-bold rounded-lg hover:bg-red-700 cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const selectedForThisQuestion = answers[q._id];
          const isAnswered = Boolean(selectedForThisQuestion);

          return (
            <div
              key={q._id || qIndex}
              className={`rounded-2xl p-5 border transition-all duration-200 ${
                isAnswered
                  ? 'bg-white border-teal-200/90 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <span
                  className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border ${
                    isAnswered
                      ? 'bg-[#0D8A82] text-white border-[#0D8A82]'
                      : 'bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  {qIndex + 1}
                </span>
                <h4 className="text-sm font-extrabold text-slate-800 leading-relaxed pt-0.5">
                  {q.question}
                </h4>
              </div>

              {q.questionImage?.trim() && (
                <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-2 flex items-center justify-center">
                  <img
                    src={q.questionImage.trim()}
                    alt="صورة السؤال"
                    className="max-h-56 object-contain rounded-lg"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="space-y-2.5 pr-1 sm:pr-10">
                {q.options.map((optionText, optIndex) => {
                  const isOptionSelected = selectedForThisQuestion === optionText;

                  return (
                    <label
                      key={optIndex}
                      onClick={() => handleSelectOption(q._id, optionText)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        isOptionSelected
                          ? 'bg-teal-50/90 border-[#0D8A82] text-[#0D8A82] ring-1 ring-[#0D8A82] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-teal-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q_${q._id}`}
                        checked={isOptionSelected}
                        onChange={() => handleSelectOption(q._id, optionText)}
                        className="w-4 h-4 text-[#0D8A82] focus:ring-[#0D8A82] border-slate-300"
                      />
                      <span className="leading-relaxed">{optionText}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
        <span className="text-xs text-slate-500 font-semibold">
          تم الإجابة على {answeredCount} من إجمالي {questions.length} سؤال
        </span>

        <button
          onClick={handleValidateBeforeSubmit}
          disabled={submitQuizMutation.isPending || isSubmittingRef.current}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-sm disabled:opacity-50"
        >
          <Send size={15} />
          <span>{submitQuizMutation.isPending ? 'جاري التسليم...' : 'تسليم الاختبار'}</span>
        </button>
      </div>

      
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-xl border border-slate-100 animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
              <Send size={26} />
            </div>
            <h4 className="text-base font-extrabold text-slate-800">تأكيد تسليم الاختبار</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              هل أنت متأكد من رغبتك في تسليم الاختبار واحتساب الإجابات؟
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleExecuteSubmission}
                disabled={submitQuizMutation.isPending || isSubmittingRef.current}
                className="flex-1 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {submitQuizMutation.isPending ? 'جاري التسليم...' : 'تسليم الاختبار'}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={submitQuizMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

     
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-xl border border-slate-100 animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
              <AlertTriangle size={26} />
            </div>
            <h4 className="text-base font-extrabold text-slate-800">مغادرة الاختبار</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              لديك إجابات لم تقم بتسليمها بعد. هل تريد مغادرة شاشة الاختبار؟
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#0D8A82] text-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs"
              >
                متابعة الحل
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                الخروج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizRunner;
