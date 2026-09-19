import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';

const validStudentTabs = [
  'home',
  'courses',
  'lessons',
  'quizzes',
  'attendance',
  'profile',
];
import StudentHomeView from '../../features/student/components/StudentHomeView';
import { useAuth } from '../../context/useAuth';
import { useStudentCourses } from '../../features/courses/hooks/useStudentCourses';
import { useCourseLessons } from '../../features/lessons/hooks/useCourseLessons';
import type { Lesson } from '../../features/lessons/types/lesson';
import StudentProfileCard from '../../features/student/components/StudentProfileCard';
import StudentAttendanceCard from '../../features/attendance/components/StudentAttendanceCard';
import ExamList from '../../features/exams/components/ExamList';
import ExamPreview from '../../features/exams/components/ExamPreview';
import ExamRunner from '../../features/exams/components/ExamRunner';
import StudentQuizHistory from '../../features/student/components/StudentQuizHistory';
import StudentExamHistory from '../../features/student/components/StudentExamHistory';
import {
  Video,
  FileText,
  CalendarCheck,
  Home,
  User,
  History,
  Award,
  AlertTriangle,
} from 'lucide-react';

import StudentLessonsView from '../../features/lessons/components/StudentLessonsView';
import RedeemAccessCodeModal from '../../features/student/components/RedeemAccessCodeModal';

const studentNavItems = [
  { id: 'home', label: 'الرئيسية', icon: <Home size={20} /> },
  { id: 'lessons', label: 'المحاضرات والدروس', icon: <Video size={20} /> },
  { id: 'quizzes', label: 'الاختبارات والتقييم', icon: <FileText size={20} /> },
  { id: 'attendance', label: 'سجل الحضور', icon: <CalendarCheck size={20} /> },
  { id: 'profile', label: 'الملف الشخصي', icon: <User size={20} /> },
];

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = tabParam && validStudentTabs.includes(tabParam) ? tabParam : 'home';

  const selectedCourseId = searchParams.get('courseId') || '';
  const selectedLessonId = searchParams.get('lessonId') || '';
  const selectedQuizId = searchParams.get('quizId') || '';
  const selectedExamId = searchParams.get('examId') || '';

  const [isSolvingQuiz, setIsSolvingQuiz] = useState<boolean>(false);
  const [isSolvingExam, setIsSolvingExam] = useState<boolean>(false);
  const [pendingNavAction, setPendingNavAction] = useState<(() => void) | null>(null);

  const hasUnsentQuizAnswers = React.useCallback((): boolean => {
    if (!isSolvingQuiz || !selectedQuizId) return false;
    try {
      const draft = localStorage.getItem(`lms_quiz_draft_answers_${selectedQuizId}`);
      if (!draft) return false;
      const parsed = JSON.parse(draft);
      return Boolean(parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0);
    } catch {
      return false;
    }
  }, [isSolvingQuiz, selectedQuizId]);

  const executeOrConfirmNav = (action: () => void) => {
    if (hasUnsentQuizAnswers()) {
      setPendingNavAction(() => action);
    } else {
      action();
    }
  };

  const handleSelectTab = (tabId: string) => {
    executeOrConfirmNav(() => {
      const nextParams: Record<string, string> = { tab: tabId };
      if (selectedCourseId) nextParams.courseId = selectedCourseId;
      if (selectedLessonId) nextParams.lessonId = selectedLessonId;
      if (selectedQuizId) nextParams.quizId = selectedQuizId;
      if (selectedExamId) nextParams.examId = selectedExamId;
      setSearchParams(nextParams);
    });
  };

  const handleSelectExam = (examId: string) => {
    const nextParams: Record<string, string> = { tab: activeTab };
    if (selectedCourseId) nextParams.courseId = selectedCourseId;
    if (selectedLessonId) nextParams.lessonId = selectedLessonId;
    if (selectedQuizId) nextParams.quizId = selectedQuizId;
    if (examId) nextParams.examId = examId;
    setSearchParams(nextParams);
  };

  const handleBackToExams = () => {
    const nextParams: Record<string, string> = { tab: 'lessons' };
    if (selectedCourseId) nextParams.courseId = selectedCourseId;
    setSearchParams(nextParams);
  };

  const handleSelectCourse = (courseId: string) => {
    executeOrConfirmNav(() => {
      const targetTab = (activeTab === 'home' || activeTab === 'courses') ? 'lessons' : activeTab;
      const nextParams: Record<string, string> = { tab: targetTab, courseId };
      setSearchParams(nextParams);
      setIsSolvingQuiz(false);
      setCompletedLessonIds([]);
    });
  };

  const handleSelectLesson = (lessonId: string) => {
    executeOrConfirmNav(() => {
      const nextParams: Record<string, string> = { tab: activeTab };
      if (selectedCourseId) nextParams.courseId = selectedCourseId;
      if (lessonId && lessonId !== selectedLessonId) {
        nextParams.lessonId = lessonId;
      }
      setSearchParams(nextParams);
      setIsSolvingQuiz(false);
    });
  };

  const handleSelectQuiz = (quizId: string) => {
    const nextParams: Record<string, string> = { tab: activeTab };
    if (selectedCourseId) nextParams.courseId = selectedCourseId;
    if (selectedLessonId) nextParams.lessonId = selectedLessonId;
    if (quizId && quizId !== selectedQuizId) {
      nextParams.quizId = quizId;
    }
    setSearchParams(nextParams, { preventScrollReset: true });
    setIsSolvingQuiz(false);
  };

  const handleCloseQuiz = () => {
    const nextParams: Record<string, string> = { tab: activeTab };
    if (selectedCourseId) nextParams.courseId = selectedCourseId;
    if (selectedLessonId) nextParams.lessonId = selectedLessonId;
    setSearchParams(nextParams, { preventScrollReset: true });
    setIsSolvingQuiz(false);
  };

  const handleCloseExam = () => {
    const nextParams: Record<string, string> = { tab: 'lessons' };
    if (selectedCourseId) nextParams.courseId = selectedCourseId;
    setSearchParams(nextParams);
    setIsSolvingExam(false);
  };

  const storageKey = user?.id ? `lms_completed_lessons_${user.id}` : 'lms_completed_lessons_guest';

  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(completedLessonIds));
    } catch {
      // Ignore storage errors
    }
  }, [completedLessonIds, storageKey]);

  const [assessmentSubTab, setAssessmentSubTab] = useState<'exams' | 'quizzes-history' | 'exams-history'>('exams');

  const {
    data: coursesData,
    isLoading: isLoadingCourses,
    isError: isCoursesError,
  } = useStudentCourses();

  const {
    data: lessonsData,
    isLoading: isLoadingLessons,
    isError: isLessonsError,
    refetch: refetchLessons,
  } = useCourseLessons(selectedCourseId);

  const effectiveCourses: Array<{ _id: string; title: string; isPublished?: boolean }> = React.useMemo(() => {
    if (!coursesData) return [];
    return coursesData.filter((c) => c.isPublished !== false);
  }, [coursesData]);

  React.useEffect(() => {
    if (effectiveCourses.length > 0 && !selectedCourseId && (activeTab === 'lessons' || activeTab === 'courses' || activeTab === 'quizzes')) {
      const defaultCourseId = effectiveCourses[0]._id;
      const nextParams: Record<string, string> = { tab: activeTab, courseId: defaultCourseId };
      if (selectedLessonId) nextParams.lessonId = selectedLessonId;
      if (selectedQuizId) nextParams.quizId = selectedQuizId;
      if (selectedExamId) nextParams.examId = selectedExamId;
      setSearchParams(nextParams);
    }
  }, [effectiveCourses, selectedCourseId, activeTab, setSearchParams, selectedLessonId, selectedQuizId, selectedExamId]);

  const effectiveLessons = React.useMemo<Lesson[]>(() => {
  return lessonsData || [];
}, [lessonsData]);

const sortedLessons = React.useMemo(() => {
  return [...effectiveLessons].sort((a, b) => a.order - b.order);
}, [effectiveLessons]);

  const totalLessonsCount = sortedLessons.length;
  const completedLessonsCount = sortedLessons.filter((l) => completedLessonIds.includes(l._id)).length;
  const courseProgressPercentage = totalLessonsCount > 0
    ? Math.round((completedLessonsCount / totalLessonsCount) * 100)
    : 0;

  const isLessonsLoadingState = isLoadingLessons && effectiveLessons.length === 0;

  const currentLessonIndex = sortedLessons.findIndex((l) => l._id === selectedLessonId);
  const hasPreviousLesson = currentLessonIndex > 0;
  const hasNextLesson = currentLessonIndex >= 0 && currentLessonIndex < sortedLessons.length - 1;

  const handlePreviousLesson = () => {
    if (hasPreviousLesson) {
      handleSelectLesson(sortedLessons[currentLessonIndex - 1]._id);
    }
  };

  const handleNextLesson = () => {
    if (hasNextLesson) {
      handleSelectLesson(sortedLessons[currentLessonIndex + 1]._id);
    }
  };

  const handleVideoEnded = () => {
    if (selectedLessonId) {
      setCompletedLessonIds((prev) =>
        prev.includes(selectedLessonId) ? prev : [...prev, selectedLessonId]
      );
    }
  };

  const [verifiedState, setVerifiedState] = useState<boolean>(() => {
    if (!user?.id) return false;
    return (
      sessionStorage.getItem(`lms_code_verified_${user.id}`) === 'true' ||
      localStorage.getItem(`lms_code_verified_${user.id}`) === 'true'
    );
  });

  const selectedLesson = effectiveLessons.find((l) => l._id === selectedLessonId);
  const isSubscriptionActive =
    user?.role === 'student'
      ? Boolean(user?.hasActiveSubscription || verifiedState)
      : true;

  return (
    <>
      <RedeemAccessCodeModal
        isOpen={!isSubscriptionActive}
        isMandatory={true}
        onSuccessVerified={() => setVerifiedState(true)}
        onClose={() => {}}
      />
      <DashboardLayout
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        navItems={studentNavItems}
        subtitle="بوابة الطالب التعليمية"
      >
      {activeTab === 'home' && (
        <StudentHomeView
          user={user}
          isLoadingCourses={isLoadingCourses}
          isCoursesError={isCoursesError}
          effectiveCourses={effectiveCourses}
          onSelectTab={handleSelectTab}
          onSelectCourse={handleSelectCourse}
          totalLessonsCount={totalLessonsCount}
        />
      )}

      {(activeTab === 'courses' || activeTab === 'lessons') && (
        <StudentLessonsView
          courses={effectiveCourses.map((c) => ({ _id: c._id, title: c.title }))}
          selectedCourseId={selectedCourseId}
          onSelectCourse={handleSelectCourse}
          totalLessonsCount={totalLessonsCount}
          completedLessonsCount={completedLessonsCount}
          courseProgressPercentage={courseProgressPercentage}
          selectedLessonId={selectedLessonId}
          selectedLesson={selectedLesson}
          onPreviousLesson={handlePreviousLesson}
          onNextLesson={handleNextLesson}
          hasPreviousLesson={hasPreviousLesson}
          hasNextLesson={hasNextLesson}
          onVideoEnded={handleVideoEnded}
          completedLessonIds={completedLessonIds}
          selectedQuizId={selectedQuizId}
          onSelectQuiz={handleSelectQuiz}
          isSolvingQuiz={isSolvingQuiz}
          setIsSolvingQuiz={setIsSolvingQuiz}
          onCloseQuiz={handleCloseQuiz}
          isLessonsLoading={isLessonsLoadingState}
          isLessonsError={isLessonsError}
          effectiveLessons={effectiveLessons}
          sortedLessons={sortedLessons}
          refetchLessons={refetchLessons}
          onSelectLesson={handleSelectLesson}
        />
      )}

      {activeTab === 'profile' && <StudentProfileCard />}
      {activeTab === 'attendance' && <StudentAttendanceCard />}
      {activeTab === 'quizzes' && (
        selectedExamId ? (
          isSolvingExam ? (
            <ExamRunner
              courseId={selectedCourseId}
              examId={selectedExamId}
              onClose={handleCloseExam}
            />
          ) : (
            <ExamPreview
              courseId={selectedCourseId}
              examId={selectedExamId}
              onBack={handleBackToExams}
              onStartSolving={() => setIsSolvingExam(true)}
            />
          )
        ) : (
          <div className="space-y-6">
           
            <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setAssessmentSubTab('exams')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  assessmentSubTab === 'exams'
                    ? 'bg-[#0D8A82] text-white shadow-xs'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText size={16} />
                <span>الامتحانات الشاملة</span>
              </button>
              <button
                onClick={() => setAssessmentSubTab('quizzes-history')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  assessmentSubTab === 'quizzes-history'
                    ? 'bg-[#0D8A82] text-white shadow-xs'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100'
                }`}
              >
                <History size={16} />
                <span>سجل تقييمات الكويزات</span>
              </button>
              <button
                onClick={() => setAssessmentSubTab('exams-history')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  assessmentSubTab === 'exams-history'
                    ? 'bg-[#0D8A82] text-white shadow-xs'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Award size={16} />
                <span>سجل الامتحانات الشاملة</span>
              </button>
            </div>

            
            {assessmentSubTab === 'exams' && (
              <ExamList
                courseId={selectedCourseId}
                courses={effectiveCourses}
                onSelectCourse={handleSelectCourse}
                onSelectExam={(exam) => handleSelectExam(exam._id)}
              />
            )}
            {assessmentSubTab === 'quizzes-history' && <StudentQuizHistory />}
            {assessmentSubTab === 'exams-history' && <StudentExamHistory />}
          </div>
        )
      )}
      {pendingNavAction !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-xl border border-slate-100 animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
              <AlertTriangle size={26} />
            </div>
            <h4 className="text-base font-extrabold text-slate-800">مغادرة الاختبار</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              لديك إجابات لم يتم تسليمها بعد. هل أنت متأكد أنك تريد الخروج؟
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setPendingNavAction(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs"
              >
                متابعة الحل
              </button>
              <button
                onClick={() => {
                  const action = pendingNavAction;
                  setPendingNavAction(null);
                  action?.();
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                الخروج
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
    </>
  );
};

export default StudentDashboard;
