import React from 'react';
import {
  FileCheck,
  Clock,
  HelpCircle,
  ArrowRight,
  Play,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Award,
} from 'lucide-react';
import { useStudentExam } from '../hooks/useStudentExam';
import { toArabicErrorMessage } from '../../../utils/errorMessage';

interface ExamPreviewProps {
  courseId?: string;
  examId?: string;
  onBack?: () => void;
  onStartSolving?: () => void;
}

export const ExamPreview: React.FC<ExamPreviewProps> = ({
  courseId,
  examId,
  onBack,
  onStartSolving,
}) => {
  const { data: exam, isLoading, isError, error, refetch } = useStudentExam(courseId, examId);

  if (!courseId || !examId) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-800">بيانات الامتحان غير مكتملة</h4>
        <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
          يرجى العودة لقائمة الامتحانات واختيار الامتحان مرة أخرى.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
          >
            <ArrowRight size={14} />
            <span>رجوع للامتحانات</span>
          </button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3 min-h-75">
        <Loader2 size={36} className="animate-spin text-[#0D8A82]" />
        <p className="text-xs font-bold text-slate-600">جاري تحميل تفاصيل وأسئلة الامتحان...</p>
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
          {toArabicErrorMessage(error, 'تعذر تحميل تفاصيل الامتحان حالياً.')}
        </p>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} />
            <span>إعادة المحاولة</span>
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
            >
              <ArrowRight size={14} />
              <span>رجوع للامتحانات</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
          <FileCheck size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-800">الامتحان غير موجود</h4>
        <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
          لم يتم العثور على بيانات الامتحان المطلوب في النظام.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
          >
            <ArrowRight size={14} />
            <span>رجوع للامتحانات</span>
          </button>
        )}
      </div>
    );
  }

  const questionsCount = exam.questions?.length ?? 0;

  const isScheduledInFuture = Boolean(
    exam?.startAt && new Date(exam.startAt).getTime() > Date.now()
  );

  const formattedStartTime = exam?.startAt
    ? new Date(exam.startAt).toLocaleString('ar-EG', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      })
    : '';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            {onBack && (
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 transition cursor-pointer border border-slate-200/80"
                title="رجوع للامتحانات"
              >
                <ArrowRight size={20} />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0D8A82] text-[11px] font-bold border border-teal-100">
                  امتحان شامل
                </span>
                {isScheduledInFuture ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-300">
                    مجدول (يبدأ {formattedStartTime})
                  </span>
                ) : exam.isActive ? (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                    نشط ومتاح
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
                    غير نشط
                  </span>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-slate-800 mt-1">{exam.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                رجوع للامتحانات
              </button>
            )}
            <button
              onClick={onStartSolving}
              disabled={!exam.isActive || isScheduledInFuture}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition enabled:cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={16} />
              <span>{isScheduledInFuture ? `يبدأ في ${formattedStartTime}` : 'ابدأ الحل'}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white text-[#0D8A82] flex items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs">
              <Clock size={22} />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">المدة الزمنية المحددة</span>
              <span className="text-base font-extrabold text-slate-800">{exam.duration} دقيقة</span>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white text-teal-600 flex items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs">
              <HelpCircle size={22} />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">إجمالي الأسئلة</span>
              <span className="text-base font-extrabold text-slate-800">{questionsCount} أسئلة</span>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white text-amber-600 flex items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs">
              <Award size={22} />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">الدرجة الإجمالية</span>
              <span className="text-base font-extrabold text-slate-800">
                {exam.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0} درجة
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines & Rules Card (Replaces Questions Leak) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <Award size={20} className="text-[#0D8A82]" />
          <h3 className="text-base font-extrabold text-slate-800">
            تعليمات وضوابط الامتحان الشامل
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-[#0D8A82]">
              <Clock size={16} />
              <span>بدء وحساب الوقت</span>
            </div>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              يبدأ العداد التنازلي للامتحان فور الضغط على زر "ابدأ الحل"، ولا يمكن إيقاف العداد بعد البدء.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-amber-800">
              <AlertTriangle size={16} />
              <span>الحفظ والتسليم التلقائي</span>
            </div>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              تُحفظ إجاباتك تلقائياً أثناء الحل. عند انتهاء الوقت المحدد، سيقوم النظام بتسليم الإجابات تلقائياً.
            </p>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onStartSolving}
            disabled={!exam.isActive || isScheduledInFuture}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#0D8A82] text-white text-sm font-extrabold hover:bg-teal-700 active:scale-[0.99] transition cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={18} />
            <span>{isScheduledInFuture ? `يبدأ في ${formattedStartTime}` : 'ابدأ حل الامتحان الآن'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamPreview;
