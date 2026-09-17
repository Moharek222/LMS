import React from 'react';
import {
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  PlayCircle,
} from 'lucide-react';
import { ChemistryBanner } from '../../../components/dashboard/ChemistryBanner';
import { KpiStatCard } from '../../../components/dashboard/KpiStatCard';
import { CourseProgressWidget } from '../../../components/dashboard/CourseProgressWidget';
import { NextActionWidget } from '../../../components/dashboard/NextActionWidget';
import { useStudentQuizHistory } from '../hooks/useStudentQuizHistory';
import { useStudentWatchHistory } from '../../lessons/hooks/useProgress';
import { useMyAttendanceStats } from '../../attendance/hooks/useStudentAttendance';

export interface CourseItem {
  _id: string;
  title: string;
}

export interface StudentHomeUser {
  id?: string;
  _id?: string;
  name?: string;
  hasActiveSubscription?: boolean;
}

export interface StudentHomeViewProps {
  user: StudentHomeUser | null;
  isLoadingCourses: boolean;
  isCoursesError: boolean;
  effectiveCourses: CourseItem[];
  onSelectTab: (tabId: string) => void;
  onSelectCourse: (courseId: string) => void;
  totalLessonsCount?: number;
}

export const StudentHomeView: React.FC<StudentHomeViewProps> = ({
  user,
  isLoadingCourses,
  isCoursesError,
  effectiveCourses,
  onSelectTab,
  onSelectCourse,
}) => {
  const studentId = user?.id || user?._id || '';

  // Fetch real student stats
  const { data: quizHistory } = useStudentQuizHistory({ page: 1, limit: 100 });
  const { data: watchHistory } = useStudentWatchHistory(studentId);
  const { data: attendanceStats } = useMyAttendanceStats(effectiveCourses[0]?._id);

  // 1. Total Passed Quizzes
  const passedQuizzesCount = React.useMemo(() => {
    if (!quizHistory?.data) return 0;
    return quizHistory.data.filter((q) => q.isPassed).length;
  }, [quizHistory]);

  // 2. Total Watched Lessons
  const watchedLessonsCount = React.useMemo(() => {
    if (!watchHistory) return 0;
    return watchHistory.reduce((acc, curr) => acc + (curr.watchedLessons?.length || 0), 0);
  }, [watchHistory]);

  // 3. Attendance Percentage
  const attendancePercentage = attendanceStats?.attendancePercentage ?? 100;

  const isSubscriptionActive = React.useMemo(() => {
    const userId = user?.id || user?._id;
    if (user?.hasActiveSubscription) return true;
    if (userId) {
      return (
        sessionStorage.getItem(`lms_code_verified_${userId}`) === 'true' ||
        localStorage.getItem(`lms_code_verified_${userId}`) === 'true'
      );
    }
    return false;
  }, [user]);

  const coursesCount = isLoadingCourses ? '—' : effectiveCourses.length;
  const firstCourseTitle = effectiveCourses.length > 0 ? effectiveCourses[0].title : undefined;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <ChemistryBanner quote="تعلم الكيمياء بفهم وتطبيق وثقة مع منصة الصادق" />

      {/* Subscription Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isSubscriptionActive
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}
          >
            {isSubscriptionActive ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">حالة الاشتراك في المنصة</h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {isSubscriptionActive
                ? 'اشتراكك نشط ومفعل لمتابعة جميع المحاضرات والامتحانات'
                : 'تنبيه: يلزم تفعيل كارت الاشتراك للوصول الكامل للمحاضرات والدروس المحمية'}
            </p>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          {isSubscriptionActive ? (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100/80 text-emerald-800 text-xs font-bold border border-emerald-300">
              <CheckCircle2 size={16} />
              <span>اشتراك نشط</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-100/80 text-amber-900 text-xs font-bold border border-amber-300">
              <AlertTriangle size={16} />
              <span>اشتراك غير مفعل</span>
            </span>
          )}
        </div>
      </div>

      {/* Quick Stats Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStatCard
          title="المواد الدراسية"
          value={coursesCount}
          subtitle={isLoadingCourses ? 'جاري التحميل...' : 'مقررات دراسية متوفرة'}
          icon={<BookOpen size={24} />}
          color="teal"
        />
        <KpiStatCard
          title="الدروس المشاهدة"
          value={watchedLessonsCount}
          subtitle="محاضرة مكتملة"
          icon={<PlayCircle size={24} />}
          color="blue"
        />
        <KpiStatCard
          title="الكويزات المجتازة"
          value={passedQuizzesCount}
          subtitle="اختبار بنسبة نجاح 100%"
          icon={<Award size={24} />}
          color="amber"
        />
        <KpiStatCard
          title="معدل انضباط الحضور"
          value={`${attendancePercentage}%`}
          subtitle="نسبة الحضور بالجروب"
          icon={<CalendarCheck size={24} />}
          color="green"
        />
      </div>

      {/* Main Grid Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <NextActionWidget
          onStartLearning={() => onSelectTab('lessons')}
          hasCourses={effectiveCourses.length > 0}
          firstCourseTitle={firstCourseTitle}
        />

        {isLoadingCourses ? (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col items-center justify-center min-h-55 text-center">
            <div className="w-8 h-8 border-3 border-[#0D8A82] border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-xs text-slate-500 font-semibold">جاري تحميل المقررات...</p>
          </div>
        ) : isCoursesError ? (
          <div className="rounded-2xl p-5 border border-red-200 bg-red-50/50 shadow-xs flex flex-col items-center justify-center min-h-55 text-center">
            <AlertTriangle size={24} className="text-red-500 mb-2" />
            <p className="text-xs font-bold text-slate-800">حدث خطأ أثناء تحميل المقررات</p>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">يرجى المحاولة مرة أخرى لاحقاً</p>
          </div>
        ) : (
          <CourseProgressWidget
            title="موادك الدراسية والمستويات"
            showAddButton={false}
            showStudentCount={false}
            showProgress={true}
            courses={effectiveCourses.map((course) => ({
              id: course._id,
              title: course.title,
              level: 'مقرر تفاعلي شامل',
              studentCount: 0,
              progress: Math.min(100, (watchedLessonsCount > 0 ? 50 : 0) + (passedQuizzesCount > 0 ? 50 : 0)),
              imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=200',
            }))}
            onViewAll={() => onSelectTab('courses')}
            onSelectCourse={onSelectCourse}
          />
        )}
      </div>
    </div>
  );
};

export default StudentHomeView;
