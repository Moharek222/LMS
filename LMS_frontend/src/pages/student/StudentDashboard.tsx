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

  const handleSelectTab = (tabId: string) => {
    const nextParams: Record<string, string> = { tab: tabId };
    if (selectedCourseId) nextParams.courseId = selectedCourseId;
    if (selectedLessonId) nextParams.lessonId = selectedLessonId;
    if (selectedQuizId) nextParams.quizId = selectedQuizId;
    if (selectedExamId) nextParams.examId = selectedExamId;
    setSearchParams(nextParams);
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
    const nextParams: Record<string, string> = { tab: activeTab };
    if (selectedCourseId) nextParams.courseId = selectedCourseId;
    if (selectedLessonId) nextParams.lessonId = selectedLessonId;
    if (selectedQuizId) nextParams.quizId = selectedQuizId;
    setSearchParams(nextParams);
  };

  const handleSelectCourse = (courseId: string) => {
    const nextParams: Record<string, string> = { tab: 'lessons', courseId };
    setSearchParams(nextParams);
    setIsSolvingQuiz(false);
    setCompletedLessonIds([]);
  };

  const handleSelectLesson = (lessonId: string) => {
    const nextParams: Record<string, string> = { tab: activeTab };
    if (selectedCourseId) nextParams.courseId = selectedCourseId;
    if (lessonId) nextParams.lessonId = lessonId;
    setSearchParams(nextParams);
    setIsSolvingQuiz(false);
  };

  const handleSelectQuiz = (quizId: string) => {
    const nextParams: Record<string, string> = { tab: activeTab };
    if (selectedCourseId) nextParams.courseId = selectedCourseId;
    if (selectedLessonId) nextParams.lessonId = selectedLessonId;
    if (quizId) nextParams.quizId = quizId;
    setSearchParams(nextParams);
    setIsSolvingQuiz(false);
  };

  const handleCloseQuiz = () => {
    const nextParams: Record<string, string> = { tab: activeTab };
    if (selectedCourseId) nextParams.courseId = selectedCourseId;
    if (selectedLessonId) nextParams.lessonId = selectedLessonId;
    setSearchParams(nextParams);
    setIsSolvingQuiz(false);
  };

  const handleCloseExam = () => {
    const nextParams: Record<string, string> = { tab: activeTab };
    if (selectedCourseId) nextParams.courseId = selectedCourseId;
    if (selectedLessonId) nextParams.lessonId = selectedLessonId;
    if (selectedQuizId) nextParams.quizId = selectedQuizId;
    setSearchParams(nextParams);
    setIsSolvingExam(false);
  };

  const [isSolvingQuiz, setIsSolvingQuiz] = useState<boolean>(false);
  const [isSolvingExam, setIsSolvingExam] = useState<boolean>(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

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

  const effectiveCourses: Array<{ _id: string; title: string }> = coursesData || [];

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
    return user?.id ? sessionStorage.getItem(`lms_code_verified_${user.id}`) === 'true' : false;
  });

  const selectedLesson = effectiveLessons.find((l) => l._id === selectedLessonId);
  const isSubscriptionActive =
    user?.role === 'student'
      ? Boolean(user?.hasActiveSubscription && (verifiedState || (user?.id && sessionStorage.getItem(`lms_code_verified_${user.id}`) === 'true')))
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
          <div className="space-y-8">
            <ExamList
              courseId={selectedCourseId}
              onSelectExam={(exam) => handleSelectExam(exam._id)}
            />
            <StudentQuizHistory />
            <StudentExamHistory />
          </div>
        )
      )}
    </DashboardLayout>
    </>
  );
};

export default StudentDashboard;
