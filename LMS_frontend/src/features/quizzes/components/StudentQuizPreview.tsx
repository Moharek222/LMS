import React from 'react';
import { Clock, Award, FileText, Loader2, AlertTriangle, X, Play, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useStudentQuiz } from '../hooks/useStudentQuiz';
import type { StudentQuiz } from '../types/quiz';

interface StudentQuizPreviewProps {
  lessonId: string;
  quizId: string;
  onClose?: () => void;
  onStartQuiz?: () => void;
}

export const StudentQuizPreview: React.FC<StudentQuizPreviewProps> = ({
  lessonId,
  quizId,
  onClose,
  onStartQuiz,
}) => {
  const { data: quizData, isLoading, isError, refetch } = useStudentQuiz(lessonId, quizId);

  if (!quizId) {
    return null;
  }

  const quiz: StudentQuiz | undefined = quizData;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200/90 shadow-xs space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 font-black text-sm flex items-center justify-center shrink-0 border border-amber-200/70 shadow-2xs">
            <FileText size={22} />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-800">
              {quiz?.title || 'جاري تحميل الاختبار...'}
            </h4>
            {quiz && (
              <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-amber-600" />
                  <span>المدة: {quiz.duration} دقيقة</span>
                </span>
                <span className="flex items-center gap-1">
                  <Award size={13} className="text-amber-600" />
                  <span>درجة النجاح: {quiz.passingPercentage}%</span>
                </span>
                <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                  <HelpCircle size={12} />
                  <span>عدد الأسئلة: {quiz.questions?.length || 0}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {onStartQuiz && quiz && (
            <button
              onClick={onStartQuiz}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition cursor-pointer shadow-xs"
            >
              <Play size={14} />
              <span>بدء حل الاختبار الآن</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="إغلاق معاينة الاختبار"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      
      {isLoading && !quiz ? (
        <div className="flex flex-col items-center justify-center min-h-40 text-center space-y-2">
          <Loader2 size={32} className="animate-spin text-amber-500" />
          <p className="text-xs font-semibold text-slate-500">جاري تحميل تعليمات وبنود الاختبار...</p>
        </div>
      ) : isError && !quiz ? (
        <div className="flex flex-col items-center justify-center min-h-40 text-center space-y-2">
          <AlertTriangle size={32} className="text-red-500" />
          <p className="text-xs font-bold text-slate-800">تعذر تحميل بيانات الاختبار</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : !quiz || !quiz.questions || quiz.questions.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs font-semibold">
          لا توجد أسئلة مضافة لهذا الاختبار بعد
        </div>
      ) : (
        <div className="space-y-5 py-1">
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4.5 sm:p-5 text-right space-y-2.5">
            <h5 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <Award size={18} className="text-amber-600" />
              <span>تعليمات وإرشادات الاختبار</span>
            </h5>
            <ul className="text-xs font-semibold text-amber-950/80 space-y-2 leading-relaxed">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
                <span>ستظهر لك الأسئلة والخيارات المتعددة فور الضغط على زر "بدء حل الاختبار الآن".</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
                <span>المدة المخصصة لهذا الاختبار هي <strong className="font-extrabold text-amber-900">{quiz.duration} دقيقة</strong>.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
                <span>نسبة النجاح المطلوبة لاجتياز الكويز هي <strong className="font-extrabold text-amber-900">{quiz.passingPercentage}%</strong>.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-amber-600 shrink-0" />
                <span>يمكنك التأكد وتعديل إجاباتك قبل الضغط على زر "تسليم الاختبار".</span>
              </li>
            </ul>
          </div>

          {onStartQuiz && (
            <div className="pt-2 text-center">
              <button
                onClick={onStartQuiz}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-amber-500 text-white text-sm font-extrabold hover:bg-amber-600 transition cursor-pointer shadow-md hover:shadow-lg active:scale-98"
              >
                <Play size={18} />
                <span>بدء حل الاختبار الآن</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentQuizPreview;
