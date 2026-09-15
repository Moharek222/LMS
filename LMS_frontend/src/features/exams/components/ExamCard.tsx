import React from 'react';
import { FileCheck, Clock, Calendar, ArrowLeft, Award, Lock, CheckCircle2 } from 'lucide-react';
import type { ExamListItem } from '../types/exam';

interface ExamCardProps {
  exam: ExamListItem;
  isSubmitted?: boolean;
  onStart?: (exam: ExamListItem) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam, isSubmitted, onStart }) => {
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

  const isUnpublished = exam.isPublished === false || exam.isActive === false;

  return (
    <div className={`bg-white rounded-3xl p-6 border shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-5 ${
      isUnpublished ? 'border-amber-200/80 bg-slate-50/50' : isSubmitted ? 'border-teal-200/80 bg-teal-50/20' : 'border-slate-200'
    }`}>
      <div className="space-y-3">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${
            isSubmitted ? 'bg-teal-100 text-[#0D8A82] border-teal-200' : 'bg-teal-50 text-[#0D8A82] border-teal-100'
          }`}>
            <FileCheck size={22} />
          </div>
          <div className="flex items-center gap-1.5">
            {isSubmitted ? (
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-teal-50 text-[#0D8A82] border border-teal-200 flex items-center gap-1">
                <CheckCircle2 size={14} />
                <span>تم التسليم ✓</span>
              </span>
            ) : isUnpublished ? (
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                <Lock size={14} />
                <span>غير منشور 🔒</span>
              </span>
            ) : isScheduledInFuture ? (
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

        {/* Exam Title */}
        <div>
          <h3 className="text-base font-extrabold text-slate-800 line-clamp-2 leading-snug">
            {exam.title}
          </h3>
        </div>

        {/* Metadata */}
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

      {/* Action */}
      <div className="pt-2 border-t border-slate-100">
        <button
          onClick={() => onStart?.(exam)}
          disabled={isUnpublished || isScheduledInFuture || isSubmitted}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-80 disabled:cursor-not-allowed ${
            isSubmitted
              ? 'bg-teal-50 text-[#0D8A82] border border-teal-200 disabled:opacity-100'
              : 'bg-[#0D8A82] text-white hover:bg-teal-700 active:scale-[0.99] disabled:bg-slate-400'
          }`}
        >
          <span>
            {isSubmitted
              ? 'تم تسليم هذا الامتحان سابقاً ✓'
              : isUnpublished
              ? 'غير منشور (غير متاح حالياً) 🔒'
              : isScheduledInFuture
              ? `مجدول (يبدأ ${formattedStartTime})`
              : 'ابدأ الامتحان'}
          </span>
          {!isSubmitted && <ArrowLeft size={16} />}
        </button>
      </div>
    </div>
  );
};

export default ExamCard;
