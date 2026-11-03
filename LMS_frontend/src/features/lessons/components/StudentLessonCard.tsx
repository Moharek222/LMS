import React from 'react';
import {
  CheckCircle2,
  Video,
  Lock,
  Sparkles,
  Award,
  Play,
  FileText,
  Loader2,
} from 'lucide-react';
import type { Lesson } from '../types/lesson';

interface StudentLessonCardProps {
  lesson: Lesson;
  isUnlocked: boolean;
  isSelected: boolean;
  isCompleted: boolean;
  hasLessonQuiz: boolean;
  hasPassedCurrentQuiz: boolean;
  isLoadingPdf: boolean;
  onLessonClick: () => void;
  onDownloadPdf: () => void;
  onStartQuizClick: (e: React.MouseEvent) => void;
}

export const StudentLessonCard: React.FC<StudentLessonCardProps> = ({
  lesson,
  isUnlocked,
  isSelected,
  isCompleted,
  hasLessonQuiz,
  hasPassedCurrentQuiz,
  isLoadingPdf,
  onLessonClick,
  onDownloadPdf,
  onStartQuizClick,
}) => {
  return (
    <div
      onClick={onLessonClick}
      className={`rounded-2xl p-4 sm:p-5 border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 ${
        !isUnlocked
          ? 'bg-slate-50/80 border-slate-200 opacity-75 cursor-not-allowed'
          : isSelected
          ? 'bg-teal-50/70 border-[#0D8A82] ring-1 ring-[#0D8A82] cursor-pointer shadow-xs'
          : 'bg-white border-slate-200/90 hover:border-teal-200 hover:bg-slate-50/60 cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`w-11 h-11 rounded-2xl font-black text-xs flex items-center justify-center shrink-0 border shadow-2xs ${
            !isUnlocked
              ? 'bg-slate-200 text-slate-400 border-slate-300'
              : isSelected
              ? 'bg-[#0D8A82] text-white border-[#0D8A82]'
              : isCompleted
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          {!isUnlocked ? <Lock size={18} /> : lesson.order}
        </div>
        <div className="text-right space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-extrabold text-slate-800">{lesson.title}</h4>
            {isCompleted && (
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1 shadow-2xs">
                <CheckCircle2 size={12} />
                <span>تمت المشاهدة</span>
              </span>
            )}
            {!isUnlocked && (
              <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200 inline-flex items-center gap-1 shadow-2xs">
                <Lock size={11} />
                <span>مغلق 🔒 يتطلب كويز الدرس السابق</span>
              </span>
            )}
            {hasLessonQuiz && isUnlocked && (
              hasPassedCurrentQuiz ? (
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1 shadow-2xs">
                  <Award size={12} className="text-emerald-600" />
                  <span>تم اجتياز الكويز (100%)</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200 inline-flex items-center gap-1 shadow-2xs">
                  <Sparkles size={12} className="text-amber-600" />
                  <span>يتطلب اجتياز كويز</span>
                </span>
              )
            )}
            {!hasLessonQuiz && isUnlocked && !isCompleted && (
              <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-200 inline-flex items-center gap-1 shadow-2xs">
                <span>متاح للمشاهدة المباشرة</span>
              </span>
            )}
            {lesson.hasPdf && (
              <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-[#0D8A82] text-[10px] font-bold border border-teal-200 inline-flex items-center gap-1 shadow-2xs">
                <FileText size={11} />
                <span>مذكرة PDF 📄</span>
              </span>
            )}
          </div>
          {lesson.description && (
            <p className="text-xs text-slate-500 font-medium line-clamp-1">{lesson.description}</p>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
        {lesson.hasPdf && isUnlocked && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDownloadPdf();
            }}
            disabled={isLoadingPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 text-[#0D8A82] hover:bg-teal-100 border border-teal-200 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="تحميل مذكرة الدرس PDF"
          >
            {isLoadingPdf ? (
              <Loader2 size={13} className="animate-spin text-[#0D8A82]" />
            ) : (
              <FileText size={13} />
            )}
            <span>المذكرة PDF</span>
          </button>
        )}

        {hasLessonQuiz && isUnlocked && !hasPassedCurrentQuiz && (
          <button
            onClick={onStartQuizClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-white text-xs font-extrabold hover:bg-amber-600 transition shadow-2xs cursor-pointer"
          >
            <Play size={13} />
            <span>حل الكويز 📝</span>
          </button>
        )}

        <span
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition ${
            !isUnlocked
              ? 'bg-slate-100 text-slate-400 border-slate-200'
              : isSelected
              ? 'bg-[#0D8A82] text-white border-[#0D8A82] shadow-xs'
              : 'bg-teal-50 text-[#0D8A82] border-teal-100 hover:bg-teal-100'
          }`}
        >
          {!isUnlocked ? (
            <>
              <Lock size={14} />
              <span>مغلق</span>
            </>
          ) : (
            <>
              <Video size={14} />
              <span>{isSelected ? 'جاري العرض' : 'تشغيل المحاضرة'}</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
};

