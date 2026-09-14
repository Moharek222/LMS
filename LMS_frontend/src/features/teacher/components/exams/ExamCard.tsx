import React from 'react';
import { Award, Clock, Calendar, CheckCircle2, XCircle, Edit, FileCheck, BarChart3, Globe, Loader2 } from 'lucide-react';
import type { ExamListItem } from '../../../exams/types/exam';

interface ExamCardProps {
  exam: ExamListItem;
  onEdit: (examId: string) => void;
  onDeactivate?: (examId: string, examTitle: string) => void;
  onTogglePublish?: (examId: string, currentStatus: boolean) => void;
  isToggling?: boolean;
  onViewSubmissions?: (examId: string, examTitle: string) => void;
  onViewStats?: (examId: string, examTitle: string) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({
  exam,
  onEdit,
  onDeactivate,
  onTogglePublish,
  isToggling = false,
  onViewSubmissions,
  onViewStats,
}) => {
  const formattedDate = exam.createdAt
    ? new Date(exam.createdAt).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const isPublished = exam.isPublished ?? exam.isActive;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
            <Award size={20} />
          </div>
          {isPublished ? (
            <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>منشور ومتاح للطالب</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              <XCircle size={13} />
              <span>غير منشور (مخفي عن الطلاب)</span>
            </span>
          )}
        </div>

        <div>
          <h4 className="text-base font-extrabold text-slate-800 line-clamp-2 leading-snug">
            {exam.title}
          </h4>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 flex-wrap pt-1">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
            <Clock size={14} className="text-[#0D8A82]" />
            <span>المدة: {exam.duration} دقيقة</span>
          </div>

          {formattedDate && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
              <Calendar size={14} className="text-slate-400" />
              <span>التاريخ: {formattedDate}</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {onViewSubmissions && (
            <button
              type="button"
              onClick={() => onViewSubmissions(exam._id, exam.title)}
              className="py-2.5 rounded-xl bg-[#0D8A82] text-white hover:bg-teal-700 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <FileCheck size={15} />
              <span>تسليمات الطلاب</span>
            </button>
          )}

          {onViewStats && (
            <button
              type="button"
              onClick={() => onViewStats(exam._id, exam.title)}
              className="py-2.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <BarChart3 size={15} />
              <span>الإحصائيات 📊</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(exam._id)}
            className="w-1/2 py-2 rounded-xl bg-teal-50 text-[#0D8A82] hover:bg-teal-100 border border-teal-100 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1"
          >
            <Edit size={14} />
            <span>تعديل</span>
          </button>

          <button
            type="button"
            disabled={isToggling}
            onClick={() => {
              if (onTogglePublish) {
                onTogglePublish(exam._id, isPublished);
              } else if (onDeactivate) {
                onDeactivate(exam._id, exam.title);
              }
            }}
            className={`w-1/2 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 border shadow-2xs ${
              isPublished
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
            } disabled:opacity-50`}
            title={isPublished ? 'انقر لإلغاء نشر الامتحان وحجبه عن الطلاب' : 'انقر ونشر الامتحان وإتاحته للطلاب'}
          >
            {isToggling ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isPublished ? (
              <>
                <Globe size={14} />
                <span>منشور 🟢</span>
              </>
            ) : (
              <>
                <Globe size={14} />
                <span>غير منشور 🔴</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamCard;

