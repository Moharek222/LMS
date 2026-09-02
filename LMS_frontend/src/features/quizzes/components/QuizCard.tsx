import React from 'react';
import { Clock, Award, FileText, ChevronLeft } from 'lucide-react';
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
      className={`rounded-2xl p-4 border shadow-xs transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isSelected
          ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-400'
          : 'bg-white border-slate-200/90 hover:border-amber-300 hover:bg-slate-50/50'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
            isSelected
              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
              : 'bg-amber-50 text-amber-600 border-amber-100'
          }`}
        >
          <FileText size={22} />
        </div>

        <div className="space-y-1 text-right">
          <h4 className="text-sm font-extrabold text-slate-800">{quiz.title}</h4>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold flex-wrap">
            <span className="flex items-center gap-1">
              <Clock size={14} className="text-slate-400" />
              <span>المدة: {quiz.duration} دقيقة</span>
            </span>
            <span className="flex items-center gap-1">
              <Award size={14} className="text-amber-500" />
              <span>الدرجة الدنيا للاجتياز: {quiz.passingPercentage}%</span>
            </span>
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2 self-end sm:self-auto">
        <button
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
            isSelected
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          <span>{isSelected ? 'جاري استعراض الأسئلة' : 'بدء الاختبار'}</span>
          <ChevronLeft size={14} />
        </button>
      </div>
    </div>
  );
};

export default QuizCard;
