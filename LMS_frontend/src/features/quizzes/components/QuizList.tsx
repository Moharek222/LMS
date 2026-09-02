import React from 'react';
import { FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { useLessonQuizzes } from '../hooks/useLessonQuizzes';
import { QuizCard } from './QuizCard';
import type { QuizListItem } from '../types/quiz';

interface QuizListProps {
  lessonId: string;
  selectedQuizId?: string;
  onSelectQuiz?: (quizId: string) => void;
}

const mockFallbackQuizzes: Record<string, QuizListItem[]> = {
  'mock-lesson-2': [
    {
      _id: 'mock-quiz-1',
      lessonID: 'mock-lesson-2',
      title: 'اختبار تقييمي: الهيدروكربونات الأروماتية',
      duration: 15,
      passingPercentage: 60,
      isActive: true,
    },
  ],
  'mock-lesson-5': [
    {
      _id: 'mock-quiz-2',
      lessonID: 'mock-lesson-5',
      title: 'اختبار شامل: استخلاص الحديد وتفاعلات الأكاسيد',
      duration: 20,
      passingPercentage: 70,
      isActive: true,
    },
  ],
};

export const QuizList: React.FC<QuizListProps> = ({
  lessonId,
  selectedQuizId,
  onSelectQuiz,
}) => {
  const { data: quizzesData, isLoading, isError, refetch } = useLessonQuizzes(lessonId);

  if (!lessonId) {
    return null;
  }

  const quizzes: QuizListItem[] = (quizzesData && quizzesData.length > 0)
    ? quizzesData
    : (mockFallbackQuizzes[lessonId] || []);

  const isQuizzesLoadingState = isLoading && quizzes.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <FileText size={20} className="text-amber-500" />
        <h4 className="text-sm font-extrabold text-slate-800">الاختبارات والتقييمات الخاصة بالدرس</h4>
      </div>

      {isQuizzesLoadingState ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col items-center justify-center min-h-[160px] text-center">
          <Loader2 size={32} className="animate-spin text-amber-500 mb-2" />
          <p className="text-xs text-slate-500 font-semibold">جاري تحميل اختبارات الدرس...</p>
        </div>
      ) : isError && quizzes.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 border border-red-200 bg-red-50/50 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
          <AlertTriangle size={28} className="text-red-500" />
          <h4 className="text-sm font-bold text-slate-800">حدث خطأ أثناء تحميل اختبارات الدرس</h4>
          <p className="text-xs text-slate-500 font-semibold">يرجى المحاولة مرة أخرى لاحقاً</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col items-center justify-center text-center space-y-1.5">
          <FileText size={32} className="text-slate-300" />
          <h5 className="text-xs font-bold text-slate-600">لا توجد اختبارات مضافة لهذا الدرس حتى الآن</h5>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz._id}
              quiz={quiz}
              isSelected={selectedQuizId === quiz._id}
              onSelect={onSelectQuiz}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;
