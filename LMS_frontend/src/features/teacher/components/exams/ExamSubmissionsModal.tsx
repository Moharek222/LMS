import React, { useState } from 'react';
import {
  X,
  Users,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Eye,
  FileCheck,
  Search,
} from 'lucide-react';
import { useTeacherExamSubmissions } from '../../../exams/hooks/useTeacherExamSubmissions';
import { GradeSubmissionModal } from './GradeSubmissionModal';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import type { TeacherExamSubmissionItem } from '../../../exams/types/examSubmission';

interface ExamSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  examId: string;
  examTitle?: string;
}

export const ExamSubmissionsModal: React.FC<ExamSubmissionsModalProps> = ({
  isOpen,
  onClose,
  courseId,
  examId,
  examTitle,
}) => {
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useTeacherExamSubmissions(
    courseId,
    examId,
    page,
    10,
    statusFilter || undefined
  );

  if (!isOpen || !examId) return null;

  const rawSubmissions = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const totalSubmissions = data?.total || 0;

  const submissions = rawSubmissions.filter((sub) => {
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
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[88vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100">
                <FileCheck size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">
                  كشف تسليمات الطلاب - {examTitle || 'الامتحان'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  استعراض إجابات ودرجات الطلاب وتصحيح الأسئلة المقالية
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
                  className="w-full pl-3 pr-9 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0D8A82]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-[#0D8A82]"
              >
                <option value="">جميع التسليمات</option>
                <option value="NEEDS_GRADING">بحاجة للتصحيح (PENDING)</option>
                <option value="GRADED">تم التصحيح (GRADED)</option>
              </select>
            </div>

            <span className="text-xs font-bold text-[#0D8A82] bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100 shrink-0 self-end sm:self-auto">
              إجمالي التسليمات: {totalSubmissions}
            </span>
          </div>

          {/* Content Body */}
          <div className="overflow-y-auto flex-1 space-y-3 pr-1">
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 size={36} className="animate-spin text-[#0D8A82]" />
                <p className="text-xs font-bold text-slate-600">جاري تحميل تسليمات الطلاب...</p>
              </div>
            ) : isError ? (
              <div className="p-6 rounded-2xl border border-red-200 bg-red-50/50 text-center space-y-2">
                <AlertTriangle size={32} className="text-red-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800">
                  {toArabicErrorMessage(error, 'تعذر تحميل تسليمات الطلاب')}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer"
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
                <h5 className="text-xs font-bold text-slate-700">لا توجد تسليمات لهذا الامتحان حتى الآن</h5>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub: TeacherExamSubmissionItem) => {
                  const studentName = sub.studentID?.name || 'طالب في المنصة';

                  return (
                    <div
                      key={sub._id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-teal-50/30 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-800">{studentName}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${
                              sub.status === 'GRADED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {sub.status === 'GRADED' ? 'تم التصحيح' : 'بحاجة لتصحيح المقالي'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold flex-wrap">
                          <span>درجة الاختيارات (MCQ): {sub.mcqScore}</span>
                          <span>•</span>
                          <span>درجة المقالي: {sub.essayScore}</span>
                          <span>•</span>
                          <span>المجموع الكلي: <strong className="text-slate-800">{sub.totalScore} / {sub.totalExamPoints}</strong></span>
                        </div>

                        <div className="text-[11px] text-slate-400 font-medium">
                          تاريخ التسليم: {formatDate(sub.createdAt)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedSubmissionId(sub._id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-2xs shrink-0"
                      >
                        <Eye size={14} />
                        <span>عرض الإجابات / تصحيح</span>
                      </button>
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

      {/* Grade Submission Modal */}
      {selectedSubmissionId && (
        <GradeSubmissionModal
          isOpen={Boolean(selectedSubmissionId)}
          onClose={() => setSelectedSubmissionId(null)}
          courseId={courseId}
          examId={examId}
          submissionId={selectedSubmissionId}
        />
      )}
    </>
  );
};

export default ExamSubmissionsModal;
