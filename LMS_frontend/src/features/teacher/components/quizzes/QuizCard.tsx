import React from 'react';
import { FileText, Clock, Award, CheckCircle2, Edit, AlertTriangle } from 'lucide-react';
import type { QuizListItem } from '../../../quizzes/types/quiz';

interface QuizCardProps {
  quiz: QuizListItem;
  onEdit?: (quiz: QuizListItem) => void;
  onDeactivate?: (quiz: QuizListItem) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onEdit, onDeactivate }) => {
  const isQuizActive = quiz.isActive !== false;

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-200">
          <FileText size={18} />
        </div>
        <div className="space-y-1 text-right">
          <h5 className="text-xs font-extrabold text-slate-800">{quiz.title}</h5>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold flex-wrap">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-slate-400" />
              <span>المدة: {quiz.duration} دقيقة</span>
            </span>
            <span className="flex items-center gap-1">
              <Award size={12} className="text-slate-400" />
              <span>نسبة النجاح: {quiz.passingPercentage}%</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isQuizActive ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
            <CheckCircle2 size={12} />
            <span>مفعل للطلاب</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
            <span>الاختبار متوقف</span>
          </span>
        )}

        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(quiz)}
            className="p-2 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer border border-slate-200/60"
            title="تعديل الاختبار"
          >
            <Edit size={16} />
          </button>
        )}

        {isQuizActive && onDeactivate && (
          <button
            type="button"
            onClick={() => onDeactivate(quiz)}
            className="p-2 rounded-xl text-slate-500 hover:text-amber-700 hover:bg-amber-100/60 transition cursor-pointer border border-slate-200/60"
            title="إيقاف الاختبار"
          >
            <AlertTriangle size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizCard;


