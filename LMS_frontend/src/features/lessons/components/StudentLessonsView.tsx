import React from 'react';
import { CheckCircle2, AlertTriangle, Video, BookOpen, Lock } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';
import type { Lesson } from '../types/lesson';
import { LessonVideoPlayer } from './LessonVideoPlayer';
import { QuizList } from '../../quizzes/components/QuizList';
import { StudentQuizPreview } from '../../quizzes/components/StudentQuizPreview';
import { QuizRunner } from '../../quizzes/components/QuizRunner';
import { useStudentQuizHistory } from '../../student/hooks/useStudentQuizHistory';
import { useToast } from '../../../context/ToastContext';
import { getLessonQuizzes } from '../../quizzes/api/quizzesApi';

export interface CoursePillItem {
  _id: string;
  title: string;
}

export interface StudentLessonsViewProps {
  courses: CoursePillItem[];
  selectedCourseId: string;
  onSelectCourse: (courseId: string) => void;

  totalLessonsCount: number;
  completedLessonsCount: number;
  courseProgressPercentage: number;

  selectedLessonId: string;
  selectedLesson?: Lesson;
  onPreviousLesson: () => void;
  onNextLesson: () => void;
  hasPreviousLesson: boolean;
  hasNextLesson: boolean;
  onVideoEnded: () => void;
  completedLessonIds: string[];

  selectedQuizId: string;
  onSelectQuiz: (quizId: string) => void;
  isSolvingQuiz: boolean;
  setIsSolvingQuiz: (isSolving: boolean) => void;
  onCloseQuiz: () => void;

  isLessonsLoading: boolean;
  isLessonsError: boolean;
  effectiveLessons: Lesson[];
  sortedLessons: Lesson[];
  refetchLessons: () => void;
  onSelectLesson: (lessonId: string) => void;
}

export const StudentLessonsView: React.FC<StudentLessonsViewProps> = ({
  courses,
  selectedCourseId,
  onSelectCourse,
  totalLessonsCount,
  completedLessonsCount,
  courseProgressPercentage,
  selectedLessonId,
  selectedLesson,
  onPreviousLesson,
  onNextLesson,
  hasPreviousLesson,
  hasNextLesson,
  onVideoEnded,
  completedLessonIds,
  selectedQuizId,
  onSelectQuiz,
  isSolvingQuiz,
  setIsSolvingQuiz,
  onCloseQuiz,
  isLessonsLoading,
  isLessonsError,
  effectiveLessons,
  sortedLessons,
  refetchLessons,
  onSelectLesson,
}) => {
  const toast = useToast();
  const { data: quizHistoryData } = useStudentQuizHistory({ page: 1, limit: 100 });

  const [passedQuizIdsSession, setPassedQuizIdsSession] = React.useState<Set<string>>(() => new Set());

  const handleQuizPassed = (quizId: string) => {
    setPassedQuizIdsSession((prev) => {
      const next = new Set(prev);
      next.add(String(quizId).trim());
      return next;
    });
  };

  const lessonQuizzesQueries = useQueries({
    queries: sortedLessons.map((lesson) => ({
      queryKey: ['lesson-quizzes', lesson._id],
      queryFn: () => getLessonQuizzes(lesson._id),
      enabled: Boolean(lesson._id),
    })),
  });

  const isLessonUnlocked = React.useCallback(
    (index: number): boolean => {
      if (index === 0) return true;

      for (let i = 0; i < index; i++) {
        const prevLesson = sortedLessons[i];
        if (!prevLesson) continue;

        const prevQuizzes = lessonQuizzesQueries[i]?.data || [];
        const hasQuizzes = prevQuizzes.length > 0;
        const isPrevCompleted = completedLessonIds.includes(prevLesson._id);

        if (hasQuizzes) {
          const hasPassedQuiz = prevQuizzes.some((quiz) => {
            const qIdStr = String(quiz._id).trim();
            if (passedQuizIdsSession.has(qIdStr)) return true;

            if (!quizHistoryData?.data) return false;
            return quizHistoryData.data.some((sub) => {
              if (!sub.isPassed) return false;
              const subQuizId = typeof sub.quizID === 'string' ? sub.quizID : sub.quizID?._id;
              if (!subQuizId) return false;
              return String(subQuizId).trim() === qIdStr;
            });
          });

          if (!hasPassedQuiz) {
            return false;
          }
        } else {
          if (!isPrevCompleted) {
            return false;
          }
        }
      }

      return true;
    },
    [sortedLessons, lessonQuizzesQueries, completedLessonIds, quizHistoryData, passedQuizIdsSession]
  );

  const selectedLessonIndex = React.useMemo(() => {
    if (!selectedLessonId) return -1;
    return sortedLessons.findIndex((l) => l._id === selectedLessonId);
  }, [sortedLessons, selectedLessonId]);

  const isCurrentSelectedUnlocked = selectedLessonIndex !== -1 ? isLessonUnlocked(selectedLessonIndex) : true;

  const handleNextLessonWithLockCheck = () => {
    if (selectedLessonIndex !== -1 && selectedLessonIndex + 1 < sortedLessons.length) {
      const nextIndex = selectedLessonIndex + 1;
      if (isLessonUnlocked(nextIndex)) {
        onNextLesson();
      } else {
        toast.error('المحاضرة التالية مغلقة 🔒. يجب مشاهدة المحاضرة السابقة واجتياز كويز التقييم الخاص بها بنجاح بنسبة النجاح المطلوبة.');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {courses.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {courses.map((course) => (
            <button
              key={course._id}
              onClick={() => onSelectCourse(course._id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                selectedCourseId === course._id
                  ? 'bg-[#0D8A82] text-white border-[#0D8A82] shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {course.title}
            </button>
          ))}
        </div>
      )}

      
      {selectedCourseId && totalLessonsCount > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-[#0D8A82]" />
              <span>نسبة الإنجاز في هذا المقرر</span>
            </span>
            <span className="text-[#0D8A82]">
              {completedLessonsCount} من {totalLessonsCount} دروس ({courseProgressPercentage}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
            <div
              className="h-full bg-[#0D8A82] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${courseProgressPercentage}%` }}
            />
          </div>
        </div>
      )}

      
      {selectedLessonId && (
        !isCurrentSelectedUnlocked ? (
          <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl text-center space-y-4 my-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
              <Lock size={32} />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg font-black text-white">هذه المحاضرة مغلقة 🔒</h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                لا يمكنك مشاهدة هذه المحاضرة إلا بعد اجتياز كويز المحاضرة السابقة بنجاح وتحقيق نسبة النجاح المطلوبة.
              </p>
            </div>
            <button
              onClick={() => {
                const firstUnlocked = sortedLessons.find((_, idx) => isLessonUnlocked(idx));
                if (firstUnlocked) onSelectLesson(firstUnlocked._id);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-600 transition shadow-sm cursor-pointer"
            >
              الانتقال إلى أول درس متاح
            </button>
          </div>
        ) : (
          <LessonVideoPlayer
            lessonId={selectedLessonId}
            lessonTitle={selectedLesson?.title}
            lessonDescription={selectedLesson?.description}
            lessonOrder={selectedLesson?.order}
            requiresPassing={selectedLesson?.requiresPassing}
            onPreviousLesson={onPreviousLesson}
            onNextLesson={handleNextLessonWithLockCheck}
            hasPrevious={hasPreviousLesson}
            hasNext={hasNextLesson}
            onVideoEnded={onVideoEnded}
            isCompletedSession={completedLessonIds.includes(selectedLessonId)}
          />
        )
      )}

      
      {selectedLessonId && (
        <div className="space-y-5">
          <QuizList
            lessonId={selectedLessonId}
            selectedQuizId={selectedQuizId}
            onSelectQuiz={(qId) => onSelectQuiz(qId)}
          />

          {selectedQuizId && (
            isSolvingQuiz ? (
              <QuizRunner
                lessonId={selectedLessonId}
                quizId={selectedQuizId}
                onClose={() => setIsSolvingQuiz(false)}
                onPassed={() => handleQuizPassed(selectedQuizId)}
              />
            ) : (
              <StudentQuizPreview
                lessonId={selectedLessonId}
                quizId={selectedQuizId}
                onClose={onCloseQuiz}
                onStartQuiz={() => setIsSolvingQuiz(true)}
              />
            )
          )}
        </div>
      )}

      
      {!selectedCourseId ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
            <BookOpen size={28} />
          </div>
          <h4 className="text-base font-bold text-slate-800">اختر كورس لعرض الدروس</h4>
          <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
            اضغط على إحدى الكورسات أعلاه أو من الرئيسية لعرض المحاضرات الخاصة بها.
          </p>
        </div>
      ) : isLessonsLoading ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs flex flex-col items-center justify-center min-h-55 text-center">
          <div className="w-8 h-8 border-3 border-[#0D8A82] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs text-slate-500 font-semibold">جاري تحميل دروس المقرر...</p>
        </div>
      ) : isLessonsError && effectiveLessons.length === 0 ? (
        <div className="rounded-2xl p-8 border border-red-200 bg-red-50/50 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
          <AlertTriangle size={28} className="text-red-500" />
          <h4 className="text-sm font-bold text-slate-800">حدث خطأ أثناء تحميل دروس المقرر</h4>
          <p className="text-xs text-slate-500 font-semibold">يرجى المحاولة مرة أخرى لاحقاً</p>
          <button
            onClick={() => refetchLessons()}
            className="mt-2 px-4 py-2 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : effectiveLessons.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
          <Video size={32} className="text-slate-400" />
          <h4 className="text-sm font-bold text-slate-700">لا توجد دروس مضافة لهذا المقرر حتى الآن</h4>
          <p className="text-xs text-slate-400 font-semibold">سيتم إضافة المحاضرات والدروس قريباً</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedLessons.map((lesson, index) => {
            const isUnlocked = isLessonUnlocked(index);
            const isSelected = selectedLessonId === lesson._id;
            const isCompleted = completedLessonIds.includes(lesson._id);

            const lessonQuizzes = lessonQuizzesQueries[index]?.data || [];
            const hasLessonQuiz = lessonQuizzes.length > 0;
            const hasPassedCurrentQuiz = lessonQuizzes.some((quiz) => {
              const qIdStr = String(quiz._id).trim();
              if (passedQuizIdsSession.has(qIdStr)) return true;
              if (!quizHistoryData?.data) return false;
              return quizHistoryData.data.some((sub) => {
                if (!sub.isPassed) return false;
                const subQuizId = typeof sub.quizID === 'string' ? sub.quizID : sub.quizID?._id;
                return subQuizId && String(subQuizId).trim() === qIdStr;
              });
            });

            const handleLessonClick = () => {
              if (!isUnlocked) {
                toast.error('هذه المحاضرة مغلقة 🔒. يجب مشاهدة المحاضرة السابقة واجتياز كويز التقييم بنجاح بنسبة النجاح المطلوبة لفتح هذه المحاضرة.');
                return;
              }
              onSelectLesson(lesson._id);
            };

            const handleStartQuizClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (!isUnlocked) {
                toast.error('هذه المحاضرة مغلقة 🔒.');
                return;
              }
              onSelectLesson(lesson._id);
              if (lessonQuizzes.length > 0) {
                onSelectQuiz(lessonQuizzes[0]._id);
              }
            };

            return (
              <div
                key={lesson._id}
                onClick={handleLessonClick}
                className={`rounded-2xl p-4 sm:p-5 border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                  !isUnlocked
                    ? 'bg-slate-50/80 border-slate-200 opacity-75 cursor-not-allowed'
                    : isSelected
                    ? 'bg-teal-50/60 border-[#0D8A82] ring-1 ring-[#0D8A82] cursor-pointer'
                    : 'bg-white border-slate-200/90 hover:border-teal-200 hover:bg-slate-50/50 cursor-pointer'
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
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          <span>تمت المشاهدة</span>
                        </span>
                      )}
                      {!isUnlocked && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200 inline-flex items-center gap-1">
                          <Lock size={11} />
                          <span>مغلق 🔒 يتطلب كويز الدرس السابق</span>
                        </span>
                      )}
                      {hasLessonQuiz && isUnlocked && (
                        hasPassedCurrentQuiz ? (
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                            🏆 <span>تم اجتياز الكويز (100%)</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200 inline-flex items-center gap-1">
                            📝 <span>يتطلب اجتياز كويز</span>
                          </span>
                        )
                      )}
                    </div>
                    {lesson.description && (
                      <p className="text-xs text-slate-500 font-medium line-clamp-1">{lesson.description}</p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2.5 self-end sm:self-auto">
                  {hasLessonQuiz && isUnlocked && !hasPassedCurrentQuiz && (
                    <button
                      onClick={handleStartQuizClick}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition shadow-2xs cursor-pointer"
                    >
                      <span>حل الكويز 📝</span>
                    </button>
                  )}

                  <span
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border ${
                      !isUnlocked
                        ? 'bg-slate-100 text-slate-400 border-slate-200'
                        : isSelected
                        ? 'bg-[#0D8A82] text-white border-[#0D8A82]'
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
          })}
        </div>
      )}
    </div>
  );
};

export default StudentLessonsView;
