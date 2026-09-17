import React from 'react';
import { Clock, Award, FileText, ChevronLeft, HelpCircle } from 'lucide-react';
import type { QuizListItem } from '../types/quiz';

interface QuizCardProps {
  quiz: QuizListItem;
  isSelected?: boolean;
  onSelect?: (quizId: string) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  isSelected = false,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect?.(quiz._id)}
      className={`rounded-2xl p-4.5 border shadow-2xs transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isSelected
          ? 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-400/80 shadow-xs'
          : 'bg-white border-slate-200/90 hover:border-amber-300 hover:bg-amber-50/20'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
            isSelected
              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
              : 'bg-amber-50 text-amber-600 border-amber-200/70'
          }`}
        >
          <FileText size={22} />
        </div>

        <div className="space-y-1.5 text-right">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-extrabold text-slate-800">{quiz.title}</h4>
            <span className="px-2 py-0.5 rounded-md bg-amber-100/70 text-amber-800 text-[10px] font-bold border border-amber-200">
              اختبار تقييمي
            </span>
          </div>
          <div className="flex items-center gap-3.5 text-xs text-slate-500 font-semibold flex-wrap">
            <span className="flex items-center gap-1">
              <Clock size={14} className="text-amber-600" />
              <span>المدة: {quiz.duration} دقيقة</span>
            </span>
            <span className="flex items-center gap-1">
              <Award size={14} className="text-amber-600" />
              <span>درجة النجاح: {quiz.passingPercentage}%</span>
            </span>
            {quiz.questions && quiz.questions.length > 0 && (
              <span className="flex items-center gap-1">
                <HelpCircle size={14} className="text-slate-400" />
                <span>{quiz.questions.length} أسئلة</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2 self-end sm:self-auto">
        <button
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-2xs ${
            isSelected
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          <span>{isSelected ? 'استعراض الأسئلة' : 'بدء الاختبار'}</span>
          <ChevronLeft size={14} />
        </button>
      </div>
    </div>
  );
};

export default QuizCard;
