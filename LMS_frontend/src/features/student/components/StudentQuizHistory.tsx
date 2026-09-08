import React, { useState } from 'react';
import {
  History,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Award,
} from 'lucide-react';
import { useStudentQuizHistory } from '../hooks/useStudentQuizHistory';
import { toArabicErrorMessage } from '../../../utils/errorMessage';

const formatArabicDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export const StudentQuizHistory: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const { data, isLoading, isError, error, refetch } = useStudentQuizHistory({
    page,
    limit,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3 min-h-65">
        <Loader2 size={36} className="animate-spin text-[#0D8A82]" />
        <p className="text-xs font-bold text-slate-600">جاري تحميل سجل الاختبارات...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl p-8 border border-red-200 bg-red-50/40 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center border border-red-200">
          <AlertTriangle size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-800">حدث خطأ أثناء تحميل سجل الاختبارات</h4>
        <p className="text-xs text-slate-600 font-semibold max-w-md">
          {toArabicErrorMessage(error, 'تعذر تحميل سجل الاختبارات حالياً.')}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs mt-2"
        >
          <RefreshCw size={14} />
          <span>إعادة المحاولة</span>
        </button>
      </div>
    );
  }

  const historyItems = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;

  if (historyItems.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xs text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
          <History size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-800">سجل الاختبارات القصيرة</h4>
        <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
          لم تقم بتقديم أي اختبارات حتى الآن
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
            <History size={20} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">سجل الاختبارات القصيرة</h3>
            <p className="text-xs text-slate-500 font-medium">عرض نتائج وتقييمات الاختبارات السابقة</p>
          </div>
        </div>
        <span className="text-xs font-bold text-[#0D8A82] bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100">
          إجمالي المحاولات: {totalItems}
        </span>
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {historyItems.map((item) => {
          const quizTitle = item.quizID?.title || 'اختبار قصير';
          return (
            <div
              key={item._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Title & Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-[#0D8A82] shrink-0" />
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{quizTitle}</h4>
                  </div>
                  {item.isPassed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shrink-0">
                      <CheckCircle2 size={13} />
                      <span>نجح</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold shrink-0">
                      <XCircle size={13} />
                      <span>لم ينجح</span>
                    </span>
                  )}
                </div>

                {/* Score section (Raw score ONLY, no percentage/totalQuestions invented) */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Award size={15} className="text-amber-500" />
                    <span>الدرجة</span>
                  </span>
                  <span className="text-sm font-extrabold text-slate-800">{item.score}</span>
                </div>
              </div>

              {/* Submission Date */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  <span>تم التقديم:</span>
                </span>
                <span>{formatArabicDate(item.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Server Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronRight size={16} />
            <span>السابق</span>
          </button>

          <span className="text-xs font-bold text-slate-600">
            صفحة {page} من {totalPages}
          </span>

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <span>التالي</span>
            <ChevronLeft size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentQuizHistory;
