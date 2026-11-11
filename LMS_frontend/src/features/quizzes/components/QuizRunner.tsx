import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  Award,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Send,
  HelpCircle,
} from 'lucide-react';
import { useStudentQuiz } from '../hooks/useStudentQuiz';
import { useSubmitQuiz } from '../hooks/useSubmitQuiz';
import {
  useStudentQuizHistory,
  STUDENT_QUIZ_HISTORY_QUERY_KEY,
} from '../../student/hooks/useStudentQuizHistory';
import type { StudentQuiz } from '../types/quiz';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/useAuth';
import type { QuizSubmissionData } from '../api/quizSubmissionApi';
import { QuizResultCard, QuizActionModals } from './QuizResultCard';

interface QuizRunnerProps {
  lessonId: string;
  quizId: string;
  onClose: () => void;
  onPassed?: () => void;
}

const loadDraftAnswers = (storageKey: string): Record<string, string> => {
  try {
    const savedDraft = localStorage.getItem(storageKey);
    if (!savedDraft) return {};
    const parsed = JSON.parse(savedDraft);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
    localStorage.removeItem(storageKey);
  } catch {
    // Ignore storage errors
  }
  return {};
};

const readCachedCorrectAnswers = (reviewCacheKey: string | null): string[] | undefined => {
  if (!reviewCacheKey) return undefined;
  try {
    const savedReview = localStorage.getItem(reviewCacheKey);
    if (!savedReview) return undefined;
    const parsed = JSON.parse(savedReview);
    if (Array.isArray(parsed?.correctAnswers)) {
      return parsed.correctAnswers as string[];
    }
  } catch {
    // Ignore storage errors
  }
  return undefined;
};

export const QuizRunner: React.FC<QuizRunnerProps> = (props) => {
  const { user } = useAuth();
  const instanceKey = `${user?.id || 'guest'}-${props.quizId}`;
  return <QuizRunnerContent key={instanceKey} {...props} studentId={user?.id} />;
};

interface QuizRunnerContentProps extends QuizRunnerProps {
  studentId?: string;
}

const QuizRunnerContent: React.FC<QuizRunnerContentProps> = ({
  lessonId,
  quizId,
  studentId,
  onClose,
  onPassed,
}) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: quizData, isLoading: isLoadingQuiz, isError: isQuizError } = useStudentQuiz(
    lessonId,
    quizId
  );
  const submitQuizMutation = useSubmitQuiz();
  const { data: quizHistoryData, refetch: refetchHistory } = useStudentQuizHistory({
    page: 1,
    limit: 100,
  });

  const isSubmittingRef = useRef<boolean>(false);
  const hasNotifiedPassedRef = useRef<boolean>(false);

  const draftAnswersKey = studentId
    ? `lms_quiz_draft_answers_${studentId}_${quizId}`
    : `lms_quiz_draft_answers_${quizId}`;
  const reviewCacheKey = studentId ? `lms_quiz_review_${studentId}_${quizId}` : null;
  const legacyReviewCacheKey = `lms_quiz_review_answers_${quizId}`;

  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    loadDraftAnswers(draftAnswersKey)
  );
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');
  const [submissionResult, setSubmissionResult] = useState<QuizSubmissionData | null>(null);

  const quiz: StudentQuiz | undefined = quizData;
  const questions = quiz?.questions || [];

  const existingSubmissionFromHistory = useMemo(() => {
    if (!quizHistoryData?.data) return null;
    return quizHistoryData.data.find((sub) => {
      const subQuizId = typeof sub.quizID === 'string' ? sub.quizID : sub.quizID?._id;
      return subQuizId && String(subQuizId).trim() === String(quizId).trim();
    });
  }, [quizHistoryData, quizId]);

  const effectiveSubmissionResult = useMemo<QuizSubmissionData | null>(() => {
    if (submissionResult) return submissionResult;
    if (!existingSubmissionFromHistory) return null;

    return {
      score: existingSubmissionFromHistory.score,
      answers: readCachedCorrectAnswers(reviewCacheKey),
      totalQuestions: questions.length || 1,
      isPassed: existingSubmissionFromHistory.isPassed,
      submission: {
        _id: existingSubmissionFromHistory._id,
        studentID: existingSubmissionFromHistory.studentID?._id || studentId || '',
        quizID: String(quizId),
        selectedOption: existingSubmissionFromHistory.selectedOption || [],
        score: existingSubmissionFromHistory.score,
        isPassed: existingSubmissionFromHistory.isPassed,
        createdAt: existingSubmissionFromHistory.createdAt,
      },
    };
  }, [submissionResult, existingSubmissionFromHistory, reviewCacheKey, questions.length, studentId, quizId]);

  useEffect(() => {
    if (existingSubmissionFromHistory?.isPassed && !hasNotifiedPassedRef.current) {
      hasNotifiedPassedRef.current = true;
      onPassed?.();
    }
  }, [existingSubmissionFromHistory, onPassed]);

  useEffect(() => {
    const hasUnsavedAnswers = Object.keys(answers).length > 0 && !effectiveSubmissionResult;
    if (!hasUnsavedAnswers) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [answers, effectiveSubmissionResult]);

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
    if (submitQuizMutation.isPending || isSubmittingRef.current || effectiveSubmissionResult) {
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
            localStorage.removeItem(legacyReviewCacheKey);
            if (reviewCacheKey && Array.isArray(data.answers) && data.answers.length > 0) {
              localStorage.setItem(
                reviewCacheKey,
                JSON.stringify({
                  correctAnswers: data.answers,
                  selectedAnswers: answers,
                })
              );
            }
          } catch {
            // Ignore storage errors
          }

          setSubmissionResult(data);
          queryClient.invalidateQueries({ queryKey: STUDENT_QUIZ_HISTORY_QUERY_KEY });

          const percentage = Math.round((data.score / (data.totalQuestions || 1)) * 100);
          if (data.isPassed) {
            hasNotifiedPassedRef.current = true;
            onPassed?.();
            toast.success(`أحسنت يا بطل! تم اجتياز الاختبار بنجاح بنسبة ${percentage}% 🏆✨`);
          } else {
            toast.warning(
              `تم تسليم الاختبار. حصلت على ${data.score} من ${data.totalQuestions}. يمكنك مراجعة أخطائك بالأسفل.`
            );
          }
        },
        onError: (err: unknown) => {
          isSubmittingRef.current = false;
          const status = axios.isAxiosError(err) ? err.response?.status : undefined;
          const backendMessage = axios.isAxiosError(err)
            ? String(err.response?.data?.message || '')
            : '';

          if (status === 409 || backendMessage.toLowerCase().includes('already submitted')) {
            try {
              localStorage.removeItem(draftAnswersKey);
            } catch {
              // Ignore storage errors
            }
            void refetchHistory();
            toast.info('لقد قمت بتسليم هذا الاختبار مسبقاً. جاري عرض نتيجتك المسجلة.');
          } else {
            toast.error(toArabicErrorMessage(err, 'حدث خطأ أثناء تسليم الاختبار، حاول مرة أخرى.'));
          }
        },
      }
    );
  };

  const handleBackClick = () => {
    if (effectiveSubmissionResult) {
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
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition cursor-pointer"
        >
          العودة
        </button>
      </div>
    );
  }

  if (effectiveSubmissionResult) {
    return (
      <QuizResultCard
        submissionResult={effectiveSubmissionResult}
        questions={questions}
        answers={answers}
        existingSubmissionFromHistory={existingSubmissionFromHistory}
        reviewCacheKey={reviewCacheKey}
        passingPercentage={quiz?.passingPercentage}
        allowRetry={false}
        onClose={onClose}
      />
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            type="button"
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
                  <Award size={14} className="text-emerald-600" />
                  <span>النجاح: {quiz.passingPercentage}%</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleValidateBeforeSubmit}
          disabled={submitQuizMutation.isPending || questions.length === 0}
          className="px-5 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitQuizMutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>جاري التصحيح...</span>
            </>
          ) : (
            <>
              <Send size={15} />
              <span>تسليم الاختبار</span>
            </>
          )}
        </button>
      </div>

      {validationError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs font-semibold">
          لا توجد أسئلة مضافة في هذا الاختبار حالياً.
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q, qIndex) => {
            const selectedAns = answers[q._id];

            return (
              <div
                key={q._id || qIndex}
                className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4"
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-teal-50 text-[#0D8A82] font-bold text-xs flex items-center justify-center shrink-0 border border-teal-100">
                    {qIndex + 1}
                  </span>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-800 leading-relaxed pt-0.5">
                    {q.question}
                  </h4>
                </div>

                {q.questionImage?.trim() && (
                  <div className="rounded-xl border border-slate-200 bg-white p-2 flex items-center justify-center">
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
                    const isSelected = selectedAns === optionText;

                    return (
                      <label
                        key={optIndex}
                        onClick={() => handleSelectOption(q._id, optionText)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer select-none ${
                          isSelected
                            ? 'bg-teal-50/90 border-[#0D8A82] text-[#0D8A82] ring-1 ring-[#0D8A82] shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-teal-200 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected ? 'border-[#0D8A82] bg-[#0D8A82]' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="leading-relaxed">{optionText}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {questions.length > 0 && (
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs text-slate-500 font-semibold">
            تأكد من مراجعة جميع الإجابات قبل الضغط على التسليم.
          </span>
          <button
            type="button"
            onClick={handleValidateBeforeSubmit}
            disabled={submitQuizMutation.isPending}
            className="px-6 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {submitQuizMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>جاري التسليم...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>تسليم الاختبار والنتيجة</span>
              </>
            )}
          </button>
        </div>
      )}

      <QuizActionModals
        showConfirmModal={showConfirmModal}
        showExitModal={showExitModal}
        isSubmitting={submitQuizMutation.isPending}
        onConfirmSubmit={handleExecuteSubmission}
        onCancelConfirm={() => setShowConfirmModal(false)}
        onCancelExit={() => setShowExitModal(false)}
        onConfirmExit={onClose}
      />
    </div>
  );
};

export default QuizRunner;
