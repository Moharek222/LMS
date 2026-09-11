import React from 'react';
import { FileCheck, Clock, Calendar, ArrowLeft, Award } from 'lucide-react';
import type { ExamListItem } from '../types/exam';

interface ExamCardProps {
  exam: ExamListItem;
  onStart?: (exam: ExamListItem) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam, onStart }) => {
  const formattedDate = exam.createdAt
    ? new Date(exam.createdAt).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const isScheduledInFuture = Boolean(
    exam.startAt && new Date(exam.startAt).getTime() > Date.now()
  );

  const formattedStartTime = exam.startAt
    ? new Date(exam.startAt).toLocaleString('ar-EG', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      })
    : '';

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-5">
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
            <FileCheck size={22} />
          </div>
          <div className="flex items-center gap-1.5">
            {isScheduledInFuture ? (
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                <Clock size={14} />
                <span>مجدول</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Award size={14} />
                <span>امتحان شامل</span>
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base font-extrabold text-slate-800 line-clamp-2 leading-snug">
            {exam.title}
          </h3>
        </div>

        {/* Details */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 flex-wrap pt-1">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
            <Clock size={15} className="text-[#0D8A82]" />
            <span>المدة: {exam.duration} دقيقة</span>
          </div>

          {isScheduledInFuture && formattedStartTime ? (
            <div className="flex items-center gap-1.5 bg-amber-50/80 text-amber-900 px-2.5 py-1.5 rounded-xl border border-amber-200">
              <Calendar size={15} className="text-amber-700" />
              <span>يبدأ: {formattedStartTime}</span>
            </div>
          ) : formattedDate ? (
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
              <Calendar size={15} className="text-slate-400" />
              <span>تاريخ الإضافة: {formattedDate}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-2 border-t border-slate-100">
        <button
          onClick={() => onStart?.(exam)}
          disabled={isScheduledInFuture}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 active:scale-[0.99] transition cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <span>{isScheduledInFuture ? `مجدول (يبدأ ${formattedStartTime})` : 'ابدأ الامتحان'}</span>
          <ArrowLeft size={16} />
        </button>
      </div>
    </div>
  );
};

export default ExamCard;
