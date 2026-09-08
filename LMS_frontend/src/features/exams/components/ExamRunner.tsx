import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Send,
  Award,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { useStudentExam } from '../hooks/useStudentExam';
import { useSubmitExam } from '../hooks/useSubmitExam';
import type { ExamSubmissionResult } from '../types/examSubmission';
import { toArabicErrorMessage } from '../../../utils/errorMessage';

interface ExamRunnerProps {
  courseId: string;
  examId: string;
  onClose: () => void;
}

export const ExamRunner: React.FC<ExamRunnerProps> = ({
  courseId,
  examId,
  onClose,
}) => {
  const { data: exam, isLoading, isError, error, refetch } = useStudentExam(courseId, examId);
  const submitExamMutation = useSubmitExam();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<ExamSubmissionResult | null>(null);

  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);
  const [timeExpiredNoAnswers, setTimeExpiredNoAnswers] = useState<boolean>(false);

  const isSubmittingRef = useRef<boolean>(false);
  const isAutoSubmittedRef = useRef<boolean>(false);
  const userAnswersRef = useRef<Record<string, string>>(userAnswers);

  useEffect(() => {
    userAnswersRef.current = userAnswers;
  }, [userAnswers]);

  const handleDoSubmit = () => {
    const answersPayload = (exam?.questions || [])
      .map((q) => {
        const ans = userAnswersRef.current[q._id];
        if (!ans || !ans.trim()) return null;
        return {
          questionID: q._id,
          type: q.type || 'MCQ',
          studentAnswer: ans.trim(),
        };
      })
      .filter((item): item is { questionID: string; type: 'MCQ' | 'ESSAY'; studentAnswer: string } => item !== null);

    if (answersPayload.length === 0) {
      setShowConfirmModal(false);
      setSubmitErrorMessage('يجب الإجابة على سؤال واحد على الأقل قبل تسليم الامتحان.');
      return;
    }

    setSubmitErrorMessage(null);
    isSubmittingRef.current = true;
    setShowConfirmModal(false);

    submitExamMutation.mutate(
      {
        courseId,
        examId,
        payload: { answers: answersPayload },
      },
      {
        onSuccess: (result) => {
          setSubmissionResult(result);
        },
        onError: () => {
          isSubmittingRef.current = false;
        },
      }
    );
  };

  const handleDoSubmitRef = useRef(handleDoSubmit);
  useEffect(() => {
    handleDoSubmitRef.current = handleDoSubmit;
  });

  
  if (exam && typeof exam.duration === 'number' && exam.duration > 0 && timeLeft === null && !submissionResult && !timeExpiredNoAnswers) {
    setTimeLeft(exam.duration * 60);
  }

  
  useEffect(() => {
    if (timeLeft === null || submissionResult || timeExpiredNoAnswers || submitExamMutation.isPending) return;

    if (timeLeft <= 0) {
      if (!isAutoSubmittedRef.current && !isSubmittingRef.current) {
        isAutoSubmittedRef.current = true;
        const validAnswers = Object.entries(userAnswersRef.current).filter(
          ([, answer]) => Boolean(answer && answer.trim())
        );

        if (validAnswers.length === 0) {
          setShowConfirmModal(false);
          setTimeExpiredNoAnswers(true);
          return;
        }

        handleDoSubmitRef.current();
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, submissionResult, timeExpiredNoAnswers, submitExamMutation.isPending]);

  const handleSelectOption = (questionId: string, selectedAnswer: string) => {
    if (submissionResult || timeExpiredNoAnswers || submitExamMutation.isPending) return;
    setSubmitErrorMessage(null);
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: selectedAnswer,
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3 min-h-87.5">
        <Loader2 size={40} className="animate-spin text-[#0D8A82]" />
        <p className="text-sm font-bold text-slate-600">جاري بدء جلسة الامتحان وتجهيز الأسئلة...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl p-8 border border-red-200 bg-red-50/40 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center border border-red-200">
          <AlertTriangle size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-800">حدث خطأ أثناء تحميل الامتحان</h4>
        <p className="text-xs text-slate-600 font-semibold max-w-md">
          {toArabicErrorMessage(error, 'تعذر بدء جلسة الامتحان حالياً.')}
        </p>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} />
            <span>إعادة المحاولة</span>
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
          >
            <ArrowRight size={14} />
            <span>العودة للامتحانات</span>
          </button>
        </div>
      </div>
    );
  }

  if (!exam || !exam.questions || exam.questions.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
          <HelpCircle size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-800">الامتحان فارغ أو غير متوفر</h4>
        <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
          لا توجد أسئلة متاحة في هذا الامتحان حالياً.
        </p>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
        >
          <ArrowRight size={14} />
          <span>العودة للامتحانات</span>
        </button>
      </div>
    );
  }

  if (exam.isActive === false) {
    return (
      <div className="rounded-3xl p-8 border border-amber-200 bg-amber-50/30 shadow-xs text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-800">هذا الامتحان غير متاح حالياً</h4>
        <p className="text-xs text-slate-600 font-semibold max-w-sm mx-auto">
          تم إيقاف تفعيل هذا الامتحان من قبل المدرس.
        </p>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition cursor-pointer shadow-xs"
        >
          <ArrowRight size={14} />
          <span>العودة للامتحانات</span>
        </button>
      </div>
    );
  }

 
  if (submissionResult) {
    const isPendingGrade = submissionResult.status === 'PENDING';
    const score = submissionResult.score ?? 0;
    const totalQ = submissionResult.totalQuestions || 1;
    const percentage = Math.round((score / Math.max(1, totalQ)) * 100);

    return (
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs text-center space-y-6 max-w-2xl mx-auto">
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto border shadow-sm ${
            isPendingGrade
              ? 'bg-amber-50 text-amber-600 border-amber-200'
              : submissionResult.isPassed
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : 'bg-rose-50 text-rose-600 border-rose-200'
          }`}
        >
          {isPendingGrade ? <Clock size={44} /> : submissionResult.isPassed ? <CheckCircle2 size={44} /> : <XCircle size={44} />}
        </div>

        <div className="space-y-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold border ${
              isPendingGrade
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : submissionResult.isPassed
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-rose-100 text-rose-800 border-rose-300'
            }`}
          >
            <Award size={16} />
            <span>
              {isPendingGrade
                ? 'تم التسليم وبانتظار تصحيح الأسئلة المقالية'
                : submissionResult.isPassed
                ? 'تم اجتياز الامتحان بنجاح'
                : 'لم يتم اجتياز الامتحان'}
            </span>
          </span>
          <h2 className="text-2xl font-black text-slate-800 pt-1">{exam.title}</h2>
          <p className="text-xs text-slate-500 font-semibold">
            {isPendingGrade
              ? 'تم تسليم إجاباتك بنجاح وفي انتظار تقييم المعلم للأسئلة المقالية.'
              : 'تم تسجيل نتيجتك وحفظها في النظام'}
          </p>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <span className="text-[11px] text-slate-400 font-bold block">درجة الطالب الحالية</span>
            <span className="text-xl font-black text-slate-800">{submissionResult.score} درجة</span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <span className="text-[11px] text-slate-400 font-bold block">إجمالي الأسئلة</span>
            <span className="text-xl font-black text-slate-800">{submissionResult.totalQuestions} أسئلة</span>
          </div>

          <div className="bg-teal-50/60 rounded-2xl p-4 border border-teal-100">
            <span className="text-[11px] text-[#0D8A82] font-bold block">النسبة الحالية</span>
            <span className="text-xl font-black text-[#0D8A82]">{percentage}%</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs"
          >
            <span>العودة للامتحانات</span>
            <ArrowLeft size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (timeExpiredNoAnswers) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs text-center space-y-6 max-w-2xl mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
          <Clock size={44} />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle size={16} />
            <span>انتهى الوقت المحدد للامتحان</span>
          </span>
          <h2 className="text-2xl font-black text-slate-800 pt-1">{exam.title}</h2>
          <p className="text-xs text-slate-600 font-semibold max-w-md mx-auto leading-relaxed">
            انتهت المدة الزمنية المحددة للامتحان دون اختيار أي إجابات، ولذلك لم يتم تسليم أية محاولة للنظام.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs"
          >
            <span>العودة للامتحانات</span>
            <ArrowLeft size={16} />
          </button>
        </div>
      </div>
    );
  }

  
  const questions = exam.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const currentAnswer = userAnswers[currentQuestion._id] || '';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center shrink-0 border border-teal-100">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 line-clamp-1">{exam.title}</h3>
            <span className="text-xs text-slate-400 font-semibold">
              السؤال {currentQuestionIndex + 1} من {totalQuestions}
            </span>
          </div>
        </div>

       
        {timeLeft !== null && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xs shrink-0 self-end sm:self-auto">
            <Clock size={18} className={timeLeft <= 300 ? 'text-rose-400 animate-pulse' : 'text-teal-400'} />
            <span className="text-xs font-bold text-slate-300">الوقت المتبقي:</span>
            <span className={`font-mono text-sm font-black ${timeLeft <= 300 ? 'text-rose-400' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        {submitErrorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="shrink-0 text-rose-600" />
              <span>{submitErrorMessage}</span>
            </div>
            <button
              onClick={() => setSubmitErrorMessage(null)}
              className="text-rose-600 hover:text-rose-800 text-xs font-black cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
          <span className="w-9 h-9 rounded-xl bg-[#0D8A82] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
            {currentQuestionIndex + 1}
          </span>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-teal-50 text-[#0D8A82] border border-teal-200">
                {currentQuestion.type === 'ESSAY' ? 'سؤال مقالي' : 'اختيار من متعدد'}
              </span>
              {typeof currentQuestion.points === 'number' && (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                  {currentQuestion.points} {currentQuestion.points === 1 ? 'درجة' : 'درجات'}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>
        </div>

        {/* Question Image if present */}
        {currentQuestion.questionImage?.trim() && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 flex items-center justify-center overflow-hidden">
            <img
              src={currentQuestion.questionImage.trim()}
              alt="صورة السؤال"
              className="max-h-72 object-contain rounded-xl"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Question Input Section */}
        {currentQuestion.type === 'ESSAY' ? (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              اكتب إجابتك المقالية بالتفصيل:
            </label>
            <textarea
              rows={5}
              value={currentAnswer}
              onChange={(e) => handleSelectOption(currentQuestion._id, e.target.value)}
              placeholder="اكتب الإجابة المقالية هنا..."
              disabled={Boolean(submissionResult || timeExpiredNoAnswers || submitExamMutation.isPending)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D8A82] transition"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {(currentQuestion.options || []).map((optionText, optIdx) => {
              const isSelected = currentAnswer === optionText;
              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQuestion._id, optionText)}
                  className={`rounded-2xl p-4 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-teal-50/80 border-[#0D8A82] ring-2 ring-[#0D8A82]/20 shadow-2xs'
                      : 'bg-slate-50/50 border-slate-200/90 hover:bg-slate-50 hover:border-teal-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-lg font-extrabold text-xs flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-[#0D8A82] text-white border-[#0D8A82]'
                          : 'bg-white text-slate-500 border-slate-200'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-[#0D8A82]' : 'text-slate-700'}`}>
                      {optionText}
                    </span>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-[#0D8A82] bg-[#0D8A82]' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        
        <div className="flex items-center justify-between gap-3 pt-6 border-t border-slate-100 flex-wrap">
          <button
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition enabled:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowRight size={16} />
            <span>السابق</span>
          </button>

          <div className="flex items-center gap-2">
            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition cursor-pointer shadow-xs"
              >
                <span>التالي</span>
                <ArrowLeft size={16} />
              </button>
            ) : null}

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={submitExamMutation.isPending}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              {submitExamMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              <span>تسليم الامتحان</span>
            </button>
          </div>
        </div>
      </div>

      
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
              <Send size={28} />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-black text-slate-800">تأكيد تسليم الامتحان</h4>
              <p className="text-xs text-slate-500 font-semibold">
                تمت الإجابة على {answeredCount} من أصل {totalQuestions} سؤالاً.
              </p>
            </div>

            {answeredCount === 0 ? (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                تنبيه: يجب الإجابة على سؤال واحد على الأقل قبل تسليم الامتحان.
              </div>
            ) : answeredCount < totalQuestions ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                تنبيه: هناك {totalQuestions - answeredCount} أسئلة لم تقم بالإجابة عليها بعد!
              </div>
            ) : null}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={submitExamMutation.isPending}
                className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleDoSubmit}
                disabled={submitExamMutation.isPending || answeredCount === 0}
                className="w-1/2 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitExamMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                <span>تأكيد التسليم</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamRunner;
