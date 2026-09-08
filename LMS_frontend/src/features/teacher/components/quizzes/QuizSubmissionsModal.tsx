import React, { useState } from 'react';
import {
  X,
  FileText,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Search,
} from 'lucide-react';
import { useTeacherQuizSubmissions } from '../../../quizzes/hooks/useTeacherQuizSubmissions';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import type { TeacherQuizSubmissionItem } from '../../../quizzes/api/teacherQuizSubmissionsApi';

interface QuizSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  quizId: string;
  quizTitle?: string;
}

export const QuizSubmissionsModal: React.FC<QuizSubmissionsModalProps> = ({
  isOpen,
  onClose,
  lessonId,
  quizId,
  quizTitle,
}) => {
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const { data, isLoading, isError, error, refetch } = useTeacherQuizSubmissions(
    lessonId,
    quizId,
    page,
    10
  );

  if (!isOpen || !quizId) return null;

  const rawSubmissions = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const totalSubmissions = data?.total || 0;

  const submissions = rawSubmissions.filter((sub) => {
    if (statusFilter === 'PASSED' && !sub.isPassed) return false;
    if (statusFilter === 'FAILED' && sub.isPassed) return false;
    if (!searchTerm.trim()) return true;
    const sName = sub.studentID?.name || '';
    const sPhone = sub.studentID?.phone || '';
    const q = searchTerm.trim().toLowerCase();
    return sName.toLowerCase().includes(q) || sPhone.toLowerCase().includes(q);
  });

  const formatDate = (dateStr?: string) => {
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">
                تسليمات الطلاب - {quizTitle || 'اختبار قصير'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                عرض نتائج وتقييمات الطلاب المسجلين في هذا الكويز
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث باسم الطالب..."
                className="w-full pl-3 pr-9 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">جميع الطلاب</option>
              <option value="PASSED">الناجحين فقط</option>
              <option value="FAILED">الراسبين فقط</option>
            </select>
          </div>

          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 shrink-0 self-end sm:self-auto">
            إجمالي المحاولات: {totalSubmissions}
          </span>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 space-y-3 pr-1">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 size={36} className="animate-spin text-amber-600" />
              <p className="text-xs font-bold text-slate-600">جاري تحميل تسليمات الاختبار...</p>
            </div>
          ) : isError ? (
            <div className="p-6 rounded-2xl border border-red-200 bg-red-50/50 text-center space-y-2">
              <AlertTriangle size={32} className="text-red-500 mx-auto" />
              <p className="text-xs font-bold text-slate-800">
                {toArabicErrorMessage(error, 'تعذر تحميل تسليمات الاختبار')}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Users size={24} />
              </div>
              <h5 className="text-xs font-bold text-slate-700">لا توجد محاولات لهذا الكويز حتى الآن</h5>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub: TeacherQuizSubmissionItem) => {
                const studentName = sub.studentID?.name || 'طالب في المنصة';

                return (
                  <div
                    key={sub._id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-amber-50/20 transition flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800">{studentName}</span>
                        {sub.isPassed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                            <CheckCircle2 size={12} />
                            <span>نجح</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                            <XCircle size={12} />
                            <span>لم ينجح</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 font-semibold">
                        الدرجة الحاصل عليها: <strong className="text-slate-800">{sub.score}</strong>
                      </div>

                      <div className="text-[11px] text-slate-400 font-medium">
                        تاريخ التقديم: {formatDate(sub.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer & Server Pagination */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronRight size={15} />
            <span>السابق</span>
          </button>

          <span>
            صفحة {page} من {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            <span>التالي</span>
            <ChevronLeft size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizSubmissionsModal;
