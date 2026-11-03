import React from 'react';
import { CheckCircle2, XCircle, RotateCcw, Send, AlertTriangle } from 'lucide-react';
import type { QuizSubmissionData } from '../api/quizSubmissionApi';

interface QuizResultCardProps {
  submissionResult: QuizSubmissionData;
  questionsCount: number;
  passingPercentage?: number;
  onRetry: () => void;
  onClose: () => void;
}

export const QuizResultCard: React.FC<QuizResultCardProps> = ({
  submissionResult,
  questionsCount,
  passingPercentage,
  onRetry,
  onClose,
}) => {
  const score =
    submissionResult.score ??
    (submissionResult as unknown as { totalScore?: number }).totalScore ??
    0;
  const total =
    submissionResult.totalQuestions ||
    (submissionResult as unknown as { totalExamPoints?: number }).totalExamPoints ||
    questionsCount ||
    1;
  const percentage = Math.round((score / total) * 100);
  const isPassed =
    submissionResult.isPassed !== undefined ? submissionResult.isPassed : percentage >= 50;

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

      {passingPercentage !== undefined && (
        <p className="text-xs text-slate-400 font-semibold">
          درجة النجاح المطلوبة لاجتياز الاختبار: {passingPercentage}%
        </p>
      )}

      <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
        {!isPassed && (
          <button
            onClick={onRetry}
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
                onClick={onConfirmSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'جاري التسليم...' : 'تسليم الاختبار'}
              </button>
              <button
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
                onClick={onCancelExit}
                className="flex-1 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs"
              >
                متابعة الحل
              </button>
              <button
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

