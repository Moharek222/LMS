import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Send,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Info,
} from 'lucide-react';
import type { QuizSubmissionData } from '../api/quizSubmissionApi';
import type { StudentQuestion } from '../types/quiz';
import type { QuizHistoryItem } from '../../student/types/studentHistory';

interface CachedQuizReview {
  correctAnswers?: string[];
  selectedAnswers?: Record<string, string>;
}

const readCachedReview = (reviewCacheKey?: string | null): CachedQuizReview | null => {
  if (!reviewCacheKey) return null;
  try {
    const raw = localStorage.getItem(reviewCacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as CachedQuizReview) : null;
  } catch {
    return null;
  }
};

interface QuizResultCardProps {
  submissionResult: QuizSubmissionData;
  questions: StudentQuestion[];
  answers: Record<string, string>;
  existingSubmissionFromHistory?: QuizHistoryItem | null;
  reviewCacheKey?: string | null;
  passingPercentage?: number;
  allowRetry?: boolean;
  onRetry?: () => void;
  onClose: () => void;
}

export const QuizResultCard: React.FC<QuizResultCardProps> = ({
  submissionResult,
  questions,
  answers,
  existingSubmissionFromHistory,
  reviewCacheKey,
  passingPercentage,
  allowRetry = false,
  onRetry,
  onClose,
}) => {
  const [showReview, setShowReview] = useState<boolean>(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'wrong'>('all');

  const score = submissionResult.score ?? 0;
  const total = submissionResult.totalQuestions || questions.length || 1;
  const percentage = Math.round((score / total) * 100);
  const isPassed =
    submissionResult.isPassed !== undefined
      ? submissionResult.isPassed
      : percentage >= (passingPercentage ?? 50);

  const correctAnswersList: string[] = Array.isArray(submissionResult.answers)
    ? submissionResult.answers
    : [];

  const studentSelectedMap = new Map<string, string>();
  Object.entries(answers).forEach(([qId, ans]) => {
    if (qId && ans) studentSelectedMap.set(String(qId).trim(), String(ans).trim());
  });

  const cachedReview = readCachedReview(reviewCacheKey);
  if (cachedReview?.selectedAnswers && typeof cachedReview.selectedAnswers === 'object') {
    Object.entries(cachedReview.selectedAnswers).forEach(([qId, ans]) => {
      if (qId && typeof ans === 'string') {
        studentSelectedMap.set(String(qId).trim(), ans.trim());
      }
    });
  }

  if (existingSubmissionFromHistory?.selectedOption) {
    existingSubmissionFromHistory.selectedOption.forEach((item) => {
      if (item?.QuestionId && item?.selectedAnswer) {
        studentSelectedMap.set(String(item.QuestionId).trim(), String(item.selectedAnswer).trim());
      }
    });
  }

  if (submissionResult.submission?.selectedOption) {
    submissionResult.submission.selectedOption.forEach((item) => {
      if (item?.QuestionId && item?.selectedAnswer) {
        studentSelectedMap.set(String(item.QuestionId).trim(), String(item.selectedAnswer).trim());
      }
    });
  }

  const reviewItems = questions.map((q, qIndex) => {
    const studentAnswer = studentSelectedMap.get(String(q._id).trim()) || '';
    const correctAnswer =
      correctAnswersList[qIndex] !== undefined
        ? String(correctAnswersList[qIndex]).trim()
        : '';
    const hasCorrectAnswerKey = Boolean(correctAnswer);
    const isQuestionCorrect = hasCorrectAnswerKey && studentAnswer === correctAnswer;

    return {
      q,
      qIndex,
      studentAnswer,
      correctAnswer,
      hasCorrectAnswerKey,
      isQuestionCorrect,
    };
  });

  const hasAnyCorrectKey = reviewItems.some((item) => item.hasCorrectAnswerKey);
  const correctCount = hasAnyCorrectKey
    ? reviewItems.filter((item) => item.isQuestionCorrect).length
    : score;
  const wrongCount = hasAnyCorrectKey
    ? reviewItems.filter((item) => !item.isQuestionCorrect).length
    : Math.max(0, total - score);

  const filteredReviewItems = reviewItems.filter((item) => {
    if (!hasAnyCorrectKey || reviewFilter === 'all') return true;
    if (reviewFilter === 'correct') return item.isQuestionCorrect;
    return !item.isQuestionCorrect;
  });

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
            ? 'أحسنت الاستيعاب، يمكنك الآن مراجعة إجاباتك بالتفصيل أو متابعة الدروس!'
            : 'اضغط على زر "راجع الأسئلة والإجابات" بالأسفل لمعرفة الإجابات الصحيحة وأخطائك.'}
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

      {passingPercentage !== undefined && (
        <p className="text-xs text-slate-400 font-semibold">
          درجة النجاح المطلوبة لاجتياز الاختبار: {passingPercentage}%
        </p>
      )}

      {!isPassed && !allowRetry && (
        <div className="max-w-md mx-auto p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center gap-2">
          <Info size={15} className="shrink-0" />
          <span>هذا الاختبار متاح لمحاولة واحدة فقط، يمكنك مراجعة إجاباتك بالأسفل.</span>
        </div>
      )}

      <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
        {questions.length > 0 && (
          <button
            type="button"
            onClick={() => setShowReview((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-sm border ${
              showReview
                ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-900'
                : 'bg-teal-50 text-[#0D8A82] border-teal-200 hover:bg-teal-100'
            }`}
          >
            <FileText size={16} />
            <span>
              {showReview
                ? 'إخفاء مراجعة الأسئلة'
                : `راجع الأسئلة والإجابات (${questions.length})`}
            </span>
            {showReview ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        )}

        {!isPassed && allowRetry && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition cursor-pointer shadow-sm"
          >
            <RotateCcw size={15} />
            <span>إعادة محاولة حل الاختبار</span>
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-sm"
        >
          العودة لقائمة الدروس
        </button>
      </div>

      {/* Collapsible Questions & Answers Review Section */}
      {showReview && questions.length > 0 && (
        <div className="pt-6 border-t border-slate-200 text-right space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <HelpCircle size={18} className="text-[#0D8A82] shrink-0" />
              <h4 className="text-sm sm:text-base font-black text-slate-800">
                مراجعة الأسئلة والإجابات النموذجية
              </h4>
            </div>

            {hasAnyCorrectKey && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setReviewFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                    reviewFilter === 'all'
                      ? 'bg-[#0D8A82] text-white border-[#0D8A82] shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  الكل ({questions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('correct')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer border flex items-center gap-1 ${
                    reviewFilter === 'correct'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 size={13} />
                  <span>صحيحة ({correctCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('wrong')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer border flex items-center gap-1 ${
                    reviewFilter === 'wrong'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                      : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  <XCircle size={13} />
                  <span>خاطئة ({wrongCount})</span>
                </button>
              </div>
            )}
          </div>

          {!hasAnyCorrectKey && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 flex items-center gap-2">
              <Info size={16} className="text-slate-400 shrink-0" />
              <span>يتم عرض إجاباتك المسجلة؛ الإجابات النموذجية غير متاحة حالياً في هذا المتصفح.</span>
            </div>
          )}

          {/* Question Number Navigator Bar */}
          {hasAnyCorrectKey && (
            <div className="flex items-center gap-2 flex-wrap bg-white p-3 rounded-2xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 ml-1">انتقال سريع للسؤال:</span>
              {reviewItems.map((item) => (
                <button
                  key={item.q._id || item.qIndex}
                  type="button"
                  onClick={() => {
                    setReviewFilter('all');
                    setTimeout(() => {
                      const el = document.getElementById(`quiz-review-q-${item.qIndex}`);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 50);
                  }}
                  className={`w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center transition cursor-pointer border ${
                    item.isQuestionCorrect
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                  }`}
                  title={
                    item.isQuestionCorrect
                      ? `سؤال ${item.qIndex + 1}: إجابة صحيحة`
                      : `سؤال ${item.qIndex + 1}: إجابة خاطئة`
                  }
                >
                  {item.qIndex + 1}
                </button>
              ))}
            </div>
          )}

          {/* Filtered Questions List */}
          {filteredReviewItems.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs font-bold text-slate-500">
              {reviewFilter === 'wrong'
                ? 'ما شاء الله! لا توجد لديك أي إجابات خاطئة في هذا الاختبار 🎉'
                : 'لا توجد أسئلة مطابقة لهذا الفلتر'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviewItems.map(
                ({ q, qIndex, studentAnswer, correctAnswer, hasCorrectAnswerKey, isQuestionCorrect }) => (
                  <div
                    id={`quiz-review-q-${qIndex}`}
                    key={q._id || qIndex}
                    className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                      hasCorrectAnswerKey
                        ? isQuestionCorrect
                          ? 'bg-emerald-50/25 border-emerald-200'
                          : 'bg-rose-50/25 border-rose-200'
                        : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 border ${
                            hasCorrectAnswerKey
                              ? isQuestionCorrect
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-rose-600 text-white border-rose-600'
                              : 'bg-slate-200 text-slate-700 border-slate-300'
                          }`}
                        >
                          {qIndex + 1}
                        </span>
                        <h5 className="text-xs sm:text-sm font-extrabold text-slate-800 leading-relaxed pt-0.5">
                          {q.question}
                        </h5>
                      </div>

                      {hasCorrectAnswerKey && (
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold shrink-0 inline-flex items-center gap-1 border ${
                            isQuestionCorrect
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {isQuestionCorrect ? (
                            <>
                              <CheckCircle2 size={13} />
                              <span>إجابة صحيحة (+1)</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={13} />
                              <span>إجابة خاطئة (0)</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    {q.questionImage?.trim() && (
                      <div className="mb-3 rounded-xl border border-slate-200 bg-white p-2 flex items-center justify-center">
                        <img
                          src={q.questionImage.trim()}
                          alt="صورة السؤال"
                          className="max-h-52 object-contain rounded-lg"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="space-y-2 pr-1 sm:pr-9">
                      {q.options.map((optionText, optIndex) => {
                        const trimmedOption = String(optionText).trim();
                        const isStudentChoice = studentAnswer === trimmedOption;
                        const isRightOption = hasCorrectAnswerKey && correctAnswer === trimmedOption;

                        let optionStyle = 'bg-white border-slate-200 text-slate-600 opacity-85';
                        if (isRightOption) {
                          optionStyle =
                            'bg-emerald-50 border-emerald-400 text-emerald-900 ring-1 ring-emerald-400 font-bold';
                        } else if (isStudentChoice && hasCorrectAnswerKey && !isRightOption) {
                          optionStyle =
                            'bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-300 font-bold';
                        } else if (isStudentChoice && !hasCorrectAnswerKey) {
                          optionStyle =
                            'bg-teal-50 border-[#0D8A82] text-[#0D8A82] ring-1 ring-[#0D8A82] font-bold';
                        }

                        return (
                          <div
                            key={optIndex}
                            className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-xs transition-all ${optionStyle}`}
                          >
                            <div className="flex items-center gap-2.5">
                              {isRightOption ? (
                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                              ) : isStudentChoice && hasCorrectAnswerKey ? (
                                <XCircle size={16} className="text-rose-600 shrink-0" />
                              ) : (
                                <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0 inline-block" />
                              )}
                              <span className="leading-relaxed">{optionText}</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isRightOption && isStudentChoice && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold">
                                  إجابتك الصحيحة ✓
                                </span>
                              )}
                              {isRightOption && !isStudentChoice && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold">
                                  الإجابة الصحيحة ✓
                                </span>
                              )}
                              {isStudentChoice && hasCorrectAnswerKey && !isRightOption && (
                                <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-extrabold">
                                  إجابتك الخاطئة ✗
                                </span>
                              )}
                              {isStudentChoice && !hasCorrectAnswerKey && (
                                <span className="px-2 py-0.5 rounded-md bg-[#0D8A82] text-white text-[10px] font-extrabold">
                                  إجابتك المختارة
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface QuizActionModalsProps {
  showConfirmModal: boolean;
  showExitModal: boolean;
  isSubmitting: boolean;
  onConfirmSubmit: () => void;
  onCancelConfirm: () => void;
  onCancelExit: () => void;
  onConfirmExit: () => void;
}

export const QuizActionModals: React.FC<QuizActionModalsProps> = ({
  showConfirmModal,
  showExitModal,
  isSubmitting,
  onConfirmSubmit,
  onCancelConfirm,
  onCancelExit,
  onConfirmExit,
}) => {
  return (
    <>
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
                type="button"
                onClick={onConfirmSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'جاري التسليم...' : 'تسليم الاختبار'}
              </button>
              <button
                type="button"
                onClick={onCancelConfirm}
                disabled={isSubmitting}
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
                type="button"
                onClick={onCancelExit}
                className="flex-1 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs"
              >
                متابعة الحل
              </button>
              <button
                type="button"
                onClick={onConfirmExit}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                الخروج
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
