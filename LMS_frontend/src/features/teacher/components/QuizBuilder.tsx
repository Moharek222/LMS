import React, { useState } from 'react';
import { FileText, Plus, Loader2, AlertTriangle, BookOpen, RefreshCw } from 'lucide-react';
import { useTeacherCourses } from '../hooks/useTeacherCourses';
import { useCourseLessons } from '../../lessons/hooks/useCourseLessons';
import { useLessonQuizzes } from '../../quizzes/hooks/useLessonQuizzes';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import type { QuizListItem } from '../../quizzes/types/quiz';
import { QuizCard } from './quizzes/QuizCard';
import { CreateQuizModal } from './quizzes/CreateQuizModal';
import { EditQuizModal } from './quizzes/EditQuizModal';
import { DeactivateQuizModal } from './quizzes/DeactivateQuizModal';
import { QuizSubmissionsModal } from './quizzes/QuizSubmissionsModal';

export const QuizBuilder: React.FC = () => {
  const { data: courses, isLoading: isLoadingCourses } = useTeacherCourses();
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const { data: lessons, isLoading: isLoadingLessons } = useCourseLessons(selectedCourseId);
  const [selectedLessonId, setSelectedLessonId] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizListItem | null>(null);
  const [deactivatingQuiz, setDeactivatingQuiz] = useState<QuizListItem | null>(null);
  const [viewingSubmissionsQuiz, setViewingSubmissionsQuiz] = useState<QuizListItem | null>(null);

  const {
    data: quizzes,
    isLoading: isLoadingQuizzes,
    isError: isQuizzesError,
    error: quizzesError,
    refetch: refetchQuizzes,
  } = useLessonQuizzes(selectedLessonId);

  return (
    <div className="space-y-6">
      {/* Course & Lesson Selection Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/90">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              1. اختر الكورس / المقرر *
            </label>
            {isLoadingCourses ? (
              <div className="p-2.5 bg-white rounded-xl text-xs font-semibold text-slate-400 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-amber-500" />
                <span>جاري تحميل الكورسات...</span>
              </div>
            ) : (
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setSelectedLessonId('');
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- اختر كورس --</option>
                {courses?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              2. اختر الدرس التابع له الاختبار *
            </label>
            {!selectedCourseId ? (
              <div className="p-2.5 bg-white rounded-xl text-xs font-semibold text-slate-400">
                اختر الكورس أولاً لعرض دروسه
              </div>
            ) : isLoadingLessons ? (
              <div className="p-2.5 bg-white rounded-xl text-xs font-semibold text-slate-400 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-amber-500" />
                <span>جاري تحميل الدروس...</span>
              </div>
            ) : !lessons || lessons.length === 0 ? (
              <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl text-xs font-bold border border-amber-200">
                لا توجد دروس مضافة لهذا الكورس بعد
              </div>
            ) : (
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- اختر الدرس --</option>
                {lessons.map((l) => (
                  <option key={l._id} value={l._id}>
                    الدرس {l.order}: {l.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-3">
          <div className="text-xs text-slate-500 font-medium">
            {!selectedLessonId ? (
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <AlertTriangle size={14} />
                يرجى اختيار الكورس والدرس أولاً لتمكين إضافة اختبار جديد
              </span>
            ) : (
              <span className="text-slate-600 font-semibold">
                تم تحديد الدرس. يمكنك الآن إضافة اختبارات واستعراض التسليمات.
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={!selectedLessonId}
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Plus size={16} />
            <span> إضافة اختبار جديد</span>
          </button>
        </div>
      </div>

      
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <FileText size={18} className="text-amber-600" />
            <span>اختبارات الدرس المحدد</span>
          </h4>
          {selectedLessonId && quizzes && quizzes.length > 0 && (
            <span className="text-xs font-bold text-slate-500">
              إجمالي الاختبارات: {quizzes.length}
            </span>
          )}
        </div>

        {!selectedLessonId ? (
          <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center space-y-1">
            <BookOpen size={32} className="text-slate-300 mx-auto mb-1" />
            <p className="text-xs font-bold text-slate-600">
              اختر كورس ودرس من القائمة أعلاه لعرض اختباراته الحالية
            </p>
          </div>
        ) : isLoadingQuizzes ? (
          <div className="flex flex-col items-center justify-center min-h-[140px] text-center space-y-2">
            <Loader2 size={32} className="animate-spin text-amber-600" />
            <p className="text-xs font-semibold text-slate-500">جاري تحميل اختبارات الدرس...</p>
          </div>
        ) : isQuizzesError ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2">
            <AlertTriangle size={32} className="text-red-500 mx-auto" />
            <p className="text-xs font-bold text-slate-800">
              {toArabicErrorMessage(quizzesError, 'حدث خطأ أثناء تحميل اختبارات الدرس')}
            </p>
            <button
              type="button"
              onClick={() => refetchQuizzes()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        ) : !quizzes || quizzes.length === 0 ? (
          <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center space-y-1">
            <FileText size={32} className="text-slate-300 mx-auto mb-1" />
            <p className="text-xs font-bold text-slate-600">
              لا توجد اختبارات مضافة لهذا الدرس حتى الآن
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                onEdit={(q) => setEditingQuiz(q)}
                onDeactivate={(q) => setDeactivatingQuiz(q)}
                onViewSubmissions={(q) => setViewingSubmissionsQuiz(q)}
              />
            ))}
          </div>
        )}
      </div>

      
      <CreateQuizModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        selectedLessonId={selectedLessonId}
      />

     
      <EditQuizModal
        isOpen={Boolean(editingQuiz)}
        onClose={() => setEditingQuiz(null)}
        lessonId={selectedLessonId}
        quizId={editingQuiz?._id || null}
      />

     
      <DeactivateQuizModal
        isOpen={Boolean(deactivatingQuiz)}
        onClose={() => setDeactivatingQuiz(null)}
        lessonId={selectedLessonId}
        quiz={deactivatingQuiz}
      />

      {/* Quiz Submissions Modal */}
      {viewingSubmissionsQuiz && (
        <QuizSubmissionsModal
          isOpen={Boolean(viewingSubmissionsQuiz)}
          onClose={() => setViewingSubmissionsQuiz(null)}
          lessonId={selectedLessonId}
          quizId={viewingSubmissionsQuiz._id}
          quizTitle={viewingSubmissionsQuiz.title}
        />
      )}
    </div>
  );
};

export default QuizBuilder;



