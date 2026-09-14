import React from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Award,
  HelpCircle,
  Calendar,
} from 'lucide-react';
import { useExamRunnerState } from '../hooks/useExamRunnerState';
import { ExamTimerHeader } from './ExamTimerHeader';
import { ExamQuestionCard } from './ExamQuestionCard';
import { ExamSubmitModal } from './ExamSubmitModal';

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
  const {
    exam,
    isLoading,
    isError,
    error,
    refetch,
    submitExamMutation,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    userAnswers,
    timeLeft,
    untilStartLeft,
    showConfirmModal,
    setShowConfirmModal,
    submissionResult,
    submitErrorMessage,
    setSubmitErrorMessage,
    timeExpiredNoAnswers,
    isAutoSubmitted,
    saveIndicator,
    handleSelectOption,
    handleDoSubmit,
    formatTime,
  } = useExamRunnerState(courseId, examId);

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
          {error ? error.message || 'تعذر بدء جلسة الامتحان حالياً.' : 'تعذر بدء جلسة الامتحان حالياً.'}
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

  if (exam.isActive === false || exam.isPublished === false) {
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

  // Scheduled / CountDown View
  if (untilStartLeft !== null && untilStartLeft > 0) {
    const formattedStartDate = exam.startAt
      ? new Date(exam.startAt).toLocaleString('ar-EG', {
          dateStyle: 'full',
          timeStyle: 'short',
        })
      : '';

    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs text-center space-y-6 max-w-xl mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
          <Calendar size={42} />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock size={16} />
            <span>امتحان مجدول</span>
          </span>
          <h2 className="text-2xl font-black text-slate-800 pt-1">{exam.title}</h2>
          <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
            لم يحل موعد بدء الامتحان بعد. سينفتح الامتحان تلقائياً عند حلول موعده.
          </p>
        </div>

        {formattedStartDate && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-700">
            موعد البداية المحدد: {formattedStartDate}
          </div>
        )}

        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2">
          <span className="text-xs font-bold text-slate-400 block">الوقت المتبقي لفتح الامتحان:</span>
          <span className="font-mono text-2xl font-black text-amber-400">
            {formatTime(untilStartLeft)}
          </span>
        </div>

        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
        >
          <ArrowRight size={16} />
          <span>العودة للامتحانات</span>
        </button>
      </div>
    );
  }

  // Submission Result View
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
            {isAutoSubmitted
              ? 'انتهى الوقت المحدد للامتحان وتم حفظ وتأكيد إجاباتك المسجلة تلقائياً في النظام.'
              : isPendingGrade
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

  // Expired No Answers View
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
            انتهت المدة الزمنية المحددة للامتحان دون اختيار أية إجابات، ولذلك لم يتم تسجيل إجابات بالنظام.
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
  const answeredCount = Object.keys(userAnswers).filter((k) => Boolean(userAnswers[k] && userAnswers[k].trim())).length;
  const progressPercent = Math.round((answeredCount / Math.max(1, totalQuestions)) * 100);
  const currentAnswer = userAnswers[currentQuestion._id] || '';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <ExamTimerHeader
        title={exam.title}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        saveIndicator={saveIndicator}
        timeLeft={timeLeft}
        formatTime={formatTime}
        answeredCount={answeredCount}
        progressPercent={progressPercent}
      />

      
      <ExamQuestionCard
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        currentAnswer={currentAnswer}
        submitErrorMessage={submitErrorMessage}
        setSubmitErrorMessage={setSubmitErrorMessage}
        isDisabled={Boolean(submissionResult || timeExpiredNoAnswers || submitExamMutation.isPending)}
        isSubmitting={submitExamMutation.isPending}
        onSelectOption={handleSelectOption}
        onPrevQuestion={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
        onNextQuestion={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
        onOpenConfirmModal={() => setShowConfirmModal(true)}
      />

     
      <ExamSubmitModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirmSubmit={() => handleDoSubmit(false)}
        isSubmitting={submitExamMutation.isPending}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
      />
    </div>
  );
};

export default ExamRunner;
