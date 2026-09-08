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
import { TeacherExamManager } from '../../features/teacher/components/TeacherExamManager';
import TeacherGroupManager from '../../features/teacher/components/TeacherGroupManager';
import { useTeacherCourses } from '../../features/teacher/hooks/useTeacherCourses';
import {
  Home,
  BookOpen,
  Video,
  FileText,
  Award,
  FolderKanban,
  CalendarCheck,
  KeyRound,
  Users,
  FlaskConical,
} from 'lucide-react';
import type { NavItem } from '../../components/dashboard/Sidebar';

const validTeacherTabs = [
  'home',
  'courses',
  'lessons',
  'quizzes',
  'exams',
  'groups',
  'attendance',
  'access-codes',
  'students',
  'profile',
];

const teacherNavItems: NavItem[] = [
  { id: 'home', label: 'الرئيسية', icon: <Home size={20} /> },
  { id: 'courses', label: 'إدارة المقررات', icon: <BookOpen size={20} /> },
  { id: 'lessons', label: 'إدارة الدروس', icon: <Video size={20} /> },
  { id: 'quizzes', label: 'كويزات الدروس', icon: <FileText size={20} /> },
  { id: 'exams', label: 'الامتحانات الشاملة', icon: <Award size={20} /> },
  { id: 'groups', label: 'إدارة المجموعات', icon: <FolderKanban size={20} /> },
  { id: 'attendance', label: 'المرور والغياب (QR)', icon: <CalendarCheck size={20} /> },
  { id: 'access-codes', label: 'أكواد التفعيل', icon: <KeyRound size={20} /> },
  { id: 'students', label: 'إدارة الطلاب', icon: <Users size={20} /> },
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
      navItems={teacherNavItems}
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
              value="—"
              subtitle="دروس "
              icon={<Video size={24} />}
              color="blue"
            />
            <KpiStatCard
              title="الطلاب"
              value="—"
              subtitle="طلاب المنصة"
              icon={<Users size={24} />}
              color="green"
            />
            <KpiStatCard
              title="الاختبارات"
              value="—"
              subtitle="اختبارات نشطة"
              icon={<FileText size={24} />}
              color="amber"
            />
            <KpiStatCard
              title="متوسط أداء الطلاب"
              value="—"
              subtitle="جاهزية المنصة"
              icon={<FlaskConical size={24} />}
              color="purple"
            />
          </div>

         
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
      {activeTab === 'exams' && <TeacherExamManager />}
      {activeTab === 'groups' && <TeacherGroupManager />}

     
      {activeTab !== 'home' &&
        activeTab !== 'courses' &&
        activeTab !== 'lessons' &&
        activeTab !== 'quizzes' &&
        activeTab !== 'exams' &&
        activeTab !== 'groups' && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100 shadow-2xs">
              {activeTab === 'exams' && <Award size={32} />}
              {activeTab === 'groups' && <FolderKanban size={32} />}
              {activeTab === 'attendance' && <CalendarCheck size={32} />}
              {activeTab === 'access-codes' && <KeyRound size={32} />}
              {activeTab === 'students' && <Users size={32} />}
              {activeTab !== 'exams' &&
                activeTab !== 'groups' &&
                activeTab !== 'attendance' &&
                activeTab !== 'access-codes' &&
                activeTab !== 'students' && <FlaskConical size={32} />}
            </div>

            <h3 className="text-xl font-black text-slate-800">
              {activeTab === 'exams' && 'إدارة الامتحانات الشاملة (/api/courses/:courseID/exams)'}
              {activeTab === 'groups' && 'إدارة مجموعات الطلاب (/api/groups)'}
              {activeTab === 'attendance' && 'نظام الحضور والغياب بالـ QR (/api/groups/:groupID/attendance)'}
              {activeTab === 'access-codes' && 'نظام أكواد التفعيل والشحن (/api/access-codes)'}
              {activeTab === 'students' && 'إدارة ملفات الطلاب والمستخدمين (/api/students)'}
              {activeTab !== 'exams' &&
                activeTab !== 'groups' &&
                activeTab !== 'attendance' &&
                activeTab !== 'access-codes' &&
                activeTab !== 'students' && 'قسم الإدارة'}
            </h3>

            <p className="text-sm text-slate-500 font-semibold max-w-md mx-auto leading-relaxed">
              {activeTab === 'exams' && 'وحدة مخصصة لإنشاء الامتحانات الشاملة على مستوى الكورس وتحديد مدة الامتحان ونسبة النجاح والأسئلة.'}
              {activeTab === 'groups' && 'وحدة مخصصة لإنشاء المجموعات وتحديد المواعيد ونقل الطلاب واستخراج قوائم الطلاب بالسنتر والأونلاين.'}
              {activeTab === 'attendance' && 'وحدة تسطير حضور وغياب الطلاب عبر مسح الباركود/QR وتتبع نسب التزام الطلاب بالحضور.'}
              {activeTab === 'access-codes' && 'وحدة توليد واستعراض كروت الشحن وأكواد التفعيل وتتبع الأكواد المستخدمة والمنسوبة للطلاب.'}
              {activeTab === 'students' && 'وحدة استعراض وتعديل بيانات ملفات الطلاب وحسابات المعلمين والأدمن وصلاحيات النظام.'}
              {activeTab !== 'exams' &&
                activeTab !== 'groups' &&
                activeTab !== 'attendance' &&
                activeTab !== 'access-codes' &&
                activeTab !== 'students' && 'أهلاً بك في قسم الإدارة. تم ربط الهيكل بالكامل بالباك إيند.'}
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
