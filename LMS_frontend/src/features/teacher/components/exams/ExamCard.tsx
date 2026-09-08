import React from 'react';
import { Award, Clock, Calendar, CheckCircle2, XCircle, Edit } from 'lucide-react';
import type { ExamListItem } from '../../../exams/types/exam';

interface ExamCardProps {
  exam: ExamListItem;
  onEdit: (examId: string) => void;
  onDeactivate: (examId: string, examTitle: string) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam, onEdit, onDeactivate }) => {
  const formattedDate = exam.createdAt
    ? new Date(exam.createdAt).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
            <Award size={20} />
          </div>
          {exam.isActive ? (
            <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>نشط ومتاح</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              <XCircle size={13} />
              <span>غير نشط</span>
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

      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={() => onEdit(exam._id)}
          className="w-1/2 py-2 rounded-xl bg-teal-50 text-[#0D8A82] hover:bg-teal-100 border border-teal-100 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1"
        >
          <Edit size={14} />
          <span>تعديل</span>
        </button>
        {exam.isActive ? (
          <button
            onClick={() => onDeactivate(exam._id, exam.title)}
            className="w-1/2 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1"
          >
            <XCircle size={14} />
            <span>إيقاف الامتحان</span>
          </button>
        ) : (
          <button
            disabled
            className="w-1/2 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed opacity-75"
          >
            الامتحان متوقف
          </button>
        )}
      </div>
    </div>
  );
};

export default ExamCard;
