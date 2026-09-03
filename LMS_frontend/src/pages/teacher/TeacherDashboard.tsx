import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ChemistryBanner } from '../../components/dashboard/ChemistryBanner';
import { KpiStatCard } from '../../components/dashboard/KpiStatCard';
import { RecentStudentsWidget } from '../../components/dashboard/RecentStudentsWidget';
import { CourseProgressWidget } from '../../components/dashboard/CourseProgressWidget';
import { UpcomingTasksWidget } from '../../components/dashboard/UpcomingTasksWidget';
import { PerformanceAnalytics } from '../../components/dashboard/PerformanceAnalytics';
import { CourseManager } from '../../features/teacher/components/CourseManager';
import { LessonManager } from '../../features/teacher/components/LessonManager';
import { QuizBuilder } from '../../features/teacher/components/QuizBuilder';
import { useTeacherCourses } from '../../features/teacher/hooks/useTeacherCourses';
import {
  BookOpen,
  Video,
  Users,
  FileText,
  FlaskConical,
} from 'lucide-react';

const validTeacherTabs = [
  'home',
  'courses',
  'lessons',
  'quizzes',
  'students',
  'assignments',
  'analytics',
  'groups',
  'profile',
  'settings',
];

export const TeacherDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = tabParam && validTeacherTabs.includes(tabParam) ? tabParam : 'home';

  const handleSelectTab = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const { data: teacherCourses } = useTeacherCourses();

  const totalCourses = teacherCourses?.length || 0;

  return (
    <DashboardLayout
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      subtitle="لوحة تحكم المدرس وإدارة المنصة"
    >
      {activeTab === 'home' && (
        <div className="space-y-6">
          <ChemistryBanner quote="الكيمياء ليست مجرد معادلات، بل هي لغة الطبيعة" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiStatCard
              title="المقررات"
              value={totalCourses}
              subtitle="مقرر نشط"
              icon={<BookOpen size={24} />}
              color="teal"
            />
            <KpiStatCard
              title="الدروس"
              value="المحتوى"
              subtitle="دروس ريلتايم"
              icon={<Video size={24} />}
              color="blue"
            />
            <KpiStatCard
              title="الطلاب"
              value="الدفعة"
              subtitle="طلاب المنصة"
              icon={<Users size={24} />}
              color="green"
            />
            <KpiStatCard
              title="الاختبارات"
              value="تقييمات"
              subtitle="اختبارات نشطة"
              icon={<FileText size={24} />}
              color="amber"
            />
            <KpiStatCard
              title="متوسط أداء الطلاب"
              value="100%"
              subtitle="جاهزية المنصة"
              icon={<FlaskConical size={24} />}
              color="purple"
            />
          </div>

          {/* Middle 3-Column Widgets Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <RecentStudentsWidget onViewAll={() => handleSelectTab('students')} />
            <CourseProgressWidget
              onAddCourse={() => handleSelectTab('courses')}
              onViewAll={() => handleSelectTab('courses')}
            />
            <UpcomingTasksWidget onViewAll={() => handleSelectTab('quizzes')} />
          </div>

         
          <PerformanceAnalytics />
        </div>
      )}

     
      {activeTab === 'courses' && <CourseManager />}
      {activeTab === 'lessons' && <LessonManager />}
      {activeTab === 'quizzes' && <QuizBuilder />}

     
      {activeTab !== 'home' &&
        activeTab !== 'courses' &&
        activeTab !== 'lessons' &&
        activeTab !== 'quizzes' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
              <FlaskConical size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800">
              قسم {activeTab === 'students' ? 'الطلاب' : 'إدارة الكيمياء'}
            </h3>
            <p className="text-sm text-slate-500 font-semibold max-w-md mx-auto">
              أهلاً بك في قسم الإدارة. يتم ربط البيانات التفاعلية وجاهزية الجداول.
            </p>
            <button
              onClick={() => handleSelectTab('home')}
              className="px-5 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-sm"
            >
              العودة للرئيسية
            </button>
          </div>
        )}
    </DashboardLayout>
  );
};

export default TeacherDashboard;
