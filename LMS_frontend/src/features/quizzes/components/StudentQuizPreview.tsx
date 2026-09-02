import React from 'react';
import { Clock, Award, FileText, Loader2, AlertTriangle, X, Play } from 'lucide-react';
import { useStudentQuiz } from '../hooks/useStudentQuiz';
import type { StudentQuiz } from '../types/quiz';

interface StudentQuizPreviewProps {
  quizId: string;
  onClose?: () => void;
  onStartQuiz?: () => void;
}

const mockFallbackStudentQuizzes: Record<string, StudentQuiz> = {
  'mock-quiz-1': {
    _id: 'mock-quiz-1',
    lessonID: 'mock-lesson-2',
    title: 'اختبار تقييمي: الهيدروكربونات الأروماتية',
    duration: 15,
    passingPercentage: 60,
    isActive: true,
    questions: [
      {
        _id: 'q1',
        question: 'ما هي الصيغة الجزئية للبنزين العطري؟',
        options: ['C6H6', 'C6H12', 'C6H14', 'C2H2'],
      },
      {
        _id: 'q2',
        question: 'عند تفاعل البنزين العطري مع الكلور في وجود عامل حفاز، يتكون:',
        options: ['كلوروبنزين', 'سداسي كلورو هكسان', 'بنزين كبريتونيك', 'نيتروبنزين'],
      },
    ],
  },
  'mock-quiz-2': {
    _id: 'mock-quiz-2',
    lessonID: 'mock-lesson-5',
    title: 'اختبار شامل: استخلاص الحديد وتفاعلات الأكاسيد',
    duration: 20,
    passingPercentage: 70,
    isActive: true,
    questions: [
      {
        _id: 'q3',
        question: 'أي من الأكاسيد التالية يُختزل في الفرن العالي بواسطة الغاز المائي؟',
        options: [
          'أكسيد الحديد الثلاثي Fe2O3',
          'أكسيد الحديد الثنائي FeO',
          'أكسيد الحديد المغناطيسي Fe3O4',
          'هيدروكسيد الحديد',
        ],
      },
    ],
  },
};

export const StudentQuizPreview: React.FC<StudentQuizPreviewProps> = ({
  quizId,
  onClose,
  onStartQuiz,
}) => {
  const { data: quizData, isLoading, isError, refetch } = useStudentQuiz(quizId);

  if (!quizId) {
    return null;
  }

  const quiz: StudentQuiz | undefined = quizData || mockFallbackStudentQuizzes[quizId];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200 shadow-xs space-y-5">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 font-black text-sm flex items-center justify-center shrink-0 border border-amber-100 shadow-xs">
            <FileText size={20} />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-800">
              {quiz?.title || 'جاري تحميل الاختبار...'}
            </h4>
            {quiz && (
              <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-slate-400" />
                  <span>المدة: {quiz.duration} دقيقة</span>
                </span>
                <span className="flex items-center gap-1">
                  <Award size={13} className="text-amber-500" />
                  <span>درجة النجاح: {quiz.passingPercentage}%</span>
                </span>
                <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200 text-[10px] font-bold">
                  عدد الأسئلة: {quiz.questions?.length || 0}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {onStartQuiz && quiz && (
            <button
              onClick={onStartQuiz}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition cursor-pointer shadow-xs"
            >
              <Play size={14} />
              <span>بدء حل الاختبار الآن</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="إغلاق معاينة الاختبار"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      
      {isLoading && !quiz ? (
        <div className="flex flex-col items-center justify-center min-h-[160px] text-center space-y-2">
          <Loader2 size={32} className="animate-spin text-amber-500" />
          <p className="text-xs font-semibold text-slate-500">جاري تحميل أسئلة الاختبار بدون إجابات...</p>
        </div>
      ) : isError && !quiz ? (
        <div className="flex flex-col items-center justify-center min-h-[160px] text-center space-y-2">
          <AlertTriangle size={32} className="text-red-500" />
          <p className="text-xs font-bold text-slate-800">تعذر تحميل بيانات الاختبار</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : !quiz || !quiz.questions || quiz.questions.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs font-semibold">
          لا توجد أسئلة مضافة لهذا الاختبار بعد
        </div>
      ) : (
        <div className="space-y-6">
          {quiz.questions.map((q, qIndex) => (
            <div
              key={q._id || qIndex}
              className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200">
                  {qIndex + 1}
                </span>
                <h5 className="text-sm font-bold text-slate-800 leading-relaxed">{q.question}</h5>
              </div>

              <div className="space-y-2 pr-8">
                {q.options.map((opt, optIndex) => (
                  <div
                    key={optIndex}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200"
                  >
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {onStartQuiz && (
            <div className="pt-2 text-center">
              <button
                onClick={onStartQuiz}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition cursor-pointer shadow-sm"
              >
                <Play size={15} />
                <span>بدء حل الاختبار الآن</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentQuizPreview;
