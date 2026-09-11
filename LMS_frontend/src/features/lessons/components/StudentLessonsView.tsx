import React from 'react';
import { CheckCircle2, AlertTriangle, Video, BookOpen, Lock } from 'lucide-react';
import type { Lesson } from '../types/lesson';
import { LessonVideoPlayer } from './LessonVideoPlayer';
import { QuizList } from '../../quizzes/components/QuizList';
import { StudentQuizPreview } from '../../quizzes/components/StudentQuizPreview';
import { QuizRunner } from '../../quizzes/components/QuizRunner';
import { useStudentQuizHistory } from '../../student/hooks/useStudentQuizHistory';
import { useToast } from '../../../context/ToastContext';

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

  const passedQuizSubmissions = React.useMemo(() => {
    if (!quizHistoryData?.data) return [];
    return quizHistoryData.data.filter((sub) => sub.isPassed);
  }, [quizHistoryData]);

  const isLessonUnlocked = (index: number): boolean => {
    if (index === 0) return true;

    for (let i = 0; i < index; i++) {
      const prevLesson = sortedLessons[i];
      const isPrevCompleted = completedLessonIds.includes(prevLesson._id);

      const hasPassedQuiz = passedQuizSubmissions.some((sub) => {
        if (!sub.isPassed) return false;
        return true;
      });

      if (prevLesson.requiresPassing) {
        if (!isPrevCompleted && !hasPassedQuiz && passedQuizSubmissions.length === 0) {
          return false;
        }
      } else {
        if (!isPrevCompleted && passedQuizSubmissions.length === 0 && index > 1) {
          return false;
        }
      }
    }

    return true;
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
        <LessonVideoPlayer
          lessonId={selectedLessonId}
          lessonTitle={selectedLesson?.title}
          lessonDescription={selectedLesson?.description}
          lessonOrder={selectedLesson?.order}
          requiresPassing={selectedLesson?.requiresPassing}
          onPreviousLesson={onPreviousLesson}
          onNextLesson={onNextLesson}
          hasPrevious={hasPreviousLesson}
          hasNext={hasNextLesson}
          onVideoEnded={onVideoEnded}
          isCompletedSession={completedLessonIds.includes(selectedLessonId)}
        />
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

            const handleLessonClick = () => {
              if (!isUnlocked) {
                toast.error('هذه المحاضرة مغلقة 🔒. يجب مشاهدة المحاضرة السابقة واجتياز كويز التقييم بنجاح بنسبة النجاح المطلوبة لفتح هذه المحاضرة.');
                return;
              }
              onSelectLesson(lesson._id);
            };

            return (
              <div
                key={lesson._id}
                onClick={handleLessonClick}
                className={`rounded-2xl p-4 border shadow-xs flex items-center justify-between gap-4 transition ${
                  !isUnlocked
                    ? 'bg-slate-50/80 border-slate-200 opacity-75 cursor-not-allowed'
                    : isSelected
                    ? 'bg-teal-50/60 border-[#0D8A82] ring-1 ring-[#0D8A82] cursor-pointer'
                    : 'bg-white border-slate-200/90 hover:border-teal-200 hover:bg-slate-50/50 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border ${
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
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-800">{lesson.title}</h4>
                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          تمت المشاهدة
                        </span>
                      )}
                      {!isUnlocked && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                          مغلق 🔒 يتطلب اجتياز كويز الدرس السابق
                        </span>
                      )}
                      {lesson.requiresPassing && isUnlocked && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                          يتطلب اجتياز اختبار
                        </span>
                      )}
                    </div>
                    {lesson.description && (
                      <p className="text-xs text-slate-500 font-medium line-clamp-1">{lesson.description}</p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      !isUnlocked
                        ? 'bg-slate-100 text-slate-400 border-slate-200'
                        : isSelected
                        ? 'bg-[#0D8A82] text-white border-[#0D8A82]'
                        : 'bg-teal-50 text-[#0D8A82] border-teal-100'
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
