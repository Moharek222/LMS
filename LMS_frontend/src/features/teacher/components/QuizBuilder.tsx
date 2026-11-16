import React, { useState } from 'react';
import { FileText, Plus, Loader2, AlertTriangle, BookOpen, RefreshCw, GraduationCap } from 'lucide-react';
import { useTeacherCourses } from '../hooks/useTeacherCourses';
import { useCourseLessons } from '../../lessons/hooks/useCourseLessons';
import { useLessonQuizzes } from '../../quizzes/hooks/useLessonQuizzes';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { Grade, GRADE_OPTIONS } from '../../../types/grade';
import { AcademicTrack } from '../../../types/academicTrack';
import { getCourseGradeTrackLabel } from '../../courses/utils/courseTrackUtils';
import type { QuizListItem } from '../../quizzes/types/quiz';
import { QuizCard } from './quizzes/QuizCard';
import { CreateQuizModal } from './quizzes/CreateQuizModal';
import { EditQuizModal } from './quizzes/EditQuizModal';
import { DeactivateQuizModal } from './quizzes/DeactivateQuizModal';
import { QuizSubmissionsModal } from './quizzes/QuizSubmissionsModal';

export const QuizBuilder: React.FC = () => {
  const { data: courses, isLoading: isLoadingCourses } = useTeacherCourses();
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'ALL' | Grade>('ALL');
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<'ALL' | AcademicTrack>('ALL');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const handleGradeFilterChange = (grade: 'ALL' | Grade) => {
    setSelectedGradeFilter(grade);
    if (grade !== Grade.SecondSecondary) {
      setSelectedTrackFilter('ALL');
    }
  };

  const secondSecCourses = React.useMemo(() => {
    return courses ? courses.filter((c) => c.grade === Grade.SecondSecondary) : [];
  }, [courses]);

  const secondSecGeneralCount = React.useMemo(() => {
    return secondSecCourses.filter((c) => c.academicTrack === AcademicTrack.General).length;
  }, [secondSecCourses]);

  const secondSecBacCount = React.useMemo(() => {
    return secondSecCourses.filter((c) => c.academicTrack === AcademicTrack.Baccalaureate).length;
  }, [secondSecCourses]);

  const filteredCourses = React.useMemo(() => {
    if (!courses) return [];
    let list = courses;
    if (selectedGradeFilter !== 'ALL') {
      list = list.filter((c) => c.grade === selectedGradeFilter);
      if (selectedGradeFilter === Grade.SecondSecondary && selectedTrackFilter !== 'ALL') {
        list = list.filter((c) => c.academicTrack === selectedTrackFilter);
      }
    }
    return list;
  }, [courses, selectedGradeFilter, selectedTrackFilter]);

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
      
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-6">
        {/* Grade Filter Tabs */}
        {courses && courses.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <span className="text-xs font-bold text-slate-500 shrink-0 ml-1">تصفية بالمرحلة:</span>
            <button
              type="button"
              onClick={() => handleGradeFilterChange('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border ${
                selectedGradeFilter === 'ALL'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              الكل ({courses.length})
            </button>
            {GRADE_OPTIONS.map((opt) => {
              const count = courses.filter((c) => c.grade === opt.value).length;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleGradeFilterChange(opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border ${
                    selectedGradeFilter === opt.value
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.shortLabel} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* 2nd Secondary Track Filter Tabs */}
        {selectedGradeFilter === Grade.SecondSecondary && secondSecCourses.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex-wrap animate-in fade-in duration-150">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 ml-1">
              <GraduationCap size={15} className="text-indigo-600" />
              <span>مسار تانية ثانوي:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedTrackFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedTrackFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              الكل ({secondSecCourses.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTrackFilter(AcademicTrack.General)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedTrackFilter === AcademicTrack.General
                  ? 'bg-indigo-700 text-white shadow-2xs'
                  : 'bg-white text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              المسار العام ({secondSecGeneralCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTrackFilter(AcademicTrack.Baccalaureate)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedTrackFilter === AcademicTrack.Baccalaureate
                  ? 'bg-indigo-800 text-white shadow-2xs'
                  : 'bg-white text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              مسار البكالوريا ({secondSecBacCount})
            </button>
          </div>
        )}

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
            ) : filteredCourses.length === 0 ? (
              <div className="p-2.5 bg-white rounded-xl text-xs font-semibold text-slate-400 border border-slate-200">
                لا توجد كورسات لهذه المرحلة أو المسار المحدد
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
                {filteredCourses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title} — ({getCourseGradeTrackLabel(c)})
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



