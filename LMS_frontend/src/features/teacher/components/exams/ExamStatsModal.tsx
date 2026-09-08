import React from 'react';
import {
  X,
  BarChart3,
  Users,
  Award,
  Clock,
  TrendingUp,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useExamStatistics } from '../../../exams/hooks/useExamStatistics';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';

interface ExamStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  examId: string;
  examTitle?: string;
}

export const ExamStatsModal: React.FC<ExamStatsModalProps> = ({
  isOpen,
  onClose,
  courseId,
  examId,
  examTitle,
}) => {
  const { data: stats, isLoading, isError, error, refetch } = useExamStatistics(
    isOpen ? courseId : undefined,
    isOpen ? examId : undefined
  );

  if (!isOpen) return null;

  const total = stats?.totalSubmissions || 0;
  const graded = stats?.gradedSubmissions || 0;
  const pending = stats?.pendingSubmissions || 0;
  const avg = stats?.averageScore || 0;
  const highest = stats?.highestScore || 0;

  const gradedPercent = total > 0 ? Math.round((graded / total) * 100) : 0;
  const pendingPercent = total > 0 ? Math.round((pending / total) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative my-8 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100">
              <BarChart3 size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">
                إحصائيات الامتحان - {examTitle || 'امتحان شامل'}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                مؤشرات الأداء ومتوسط درجات الطلاب ومعدل التصحيح
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 size={36} className="animate-spin text-[#0D8A82]" />
            <p className="text-xs font-bold text-slate-600">جاري تحليل وحساب إحصائيات الامتحان...</p>
          </div>
        ) : isError ? (
          <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50/50 text-center space-y-3">
            <AlertTriangle size={32} className="text-rose-500 mx-auto" />
            <p className="text-xs font-bold text-slate-800">
              {toArabicErrorMessage(error, 'تعذر استخراج إحصائيات الامتحان')}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs"
            >
              <RefreshCw size={14} />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Total Submissions */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold">إجمالي المحاولات</span>
                  <Users size={16} className="text-[#0D8A82]" />
                </div>
                <div className="text-2xl font-black text-slate-800">{total}</div>
                <span className="text-[10px] font-semibold text-slate-400 block">طالب قام بالتسليم</span>
              </div>

              {/* Average Score */}
              <div className="bg-teal-50/60 rounded-2xl p-4 border border-teal-100 space-y-1">
                <div className="flex items-center justify-between text-[#0D8A82]">
                  <span className="text-[11px] font-bold">متوسط الدرجات</span>
                  <TrendingUp size={16} />
                </div>
                <div className="text-2xl font-black text-[#0D8A82]">{avg}</div>
                <span className="text-[10px] font-semibold text-teal-700/70 block">درجة للمحاولات المصححة</span>
              </div>

              {/* Highest Score */}
              <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-100 space-y-1">
                <div className="flex items-center justify-between text-amber-700">
                  <span className="text-[11px] font-bold">أعلى درجة</span>
                  <Award size={16} />
                </div>
                <div className="text-2xl font-black text-amber-800">{highest}</div>
                <span className="text-[10px] font-semibold text-amber-700/70 block">أعلى نتيجة تم تسجيلها</span>
              </div>

              {/* Pending Grading */}
              <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100 space-y-1">
                <div className="flex items-center justify-between text-rose-600">
                  <span className="text-[11px] font-bold">قيد التصحيح</span>
                  <Clock size={16} />
                </div>
                <div className="text-2xl font-black text-rose-700">{pending}</div>
                <span className="text-[10px] font-semibold text-rose-600/80 block">محاولة بانتظار التقييم</span>
              </div>
            </div>

            {/* Visual Breakdown Bar */}
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                <span>توزيع حالة تصحيح المحاولات:</span>
                <span className="text-[11px] text-slate-400 font-bold">{graded} مصحح من أصل {total}</span>
              </h4>

              {/* Progress Bar Container */}
              <div className="h-4 rounded-full bg-slate-200 overflow-hidden flex dir-ltr">
                <div
                  style={{ width: `${gradedPercent}%` }}
                  className="bg-[#0D8A82] h-full transition-all duration-500"
                  title={`مصحح: ${gradedPercent}%`}
                />
                <div
                  style={{ width: `${pendingPercent}%` }}
                  className="bg-amber-500 h-full transition-all duration-500"
                  title={`قيد التصحيح: ${pendingPercent}%`}
                />
              </div>

              {/* Legend */}
              <div className="flex items-center justify-around text-xs font-bold pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#0D8A82]" />
                  <span className="text-slate-700">مكتمل ومصحح ({gradedPercent}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-slate-700">قيد تصحيح المقالي ({pendingPercent}%)</span>
                </div>
              </div>
            </div>

            {total === 0 && (
              <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-center text-xs font-bold text-slate-500">
                لا توجد تسليمات في هذا الامتحان حتى الآن لاستخراج الإحصائيات.
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
          >
            إغلاق الإحصائيات
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamStatsModal;
