import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ChemistryBanner } from '../../components/dashboard/ChemistryBanner';
import { KpiStatCard } from '../../components/dashboard/KpiStatCard';
import { RecentStudentsWidget, type JoinedStudent } from '../../components/dashboard/RecentStudentsWidget';
import { CourseProgressWidget, type CourseItem } from '../../components/dashboard/CourseProgressWidget';
// import { PerformanceAnalytics } from '../../components/dashboard/PerformanceAnalytics';
import { CourseManager } from '../../features/teacher/components/CourseManager';
import { LessonManager } from '../../features/teacher/components/LessonManager';
import { QuizBuilder } from '../../features/teacher/components/QuizBuilder';
import { TeacherExamManager } from '../../features/teacher/components/TeacherExamManager';
import TeacherGroupManager from '../../features/teacher/components/TeacherGroupManager';
import TeacherAccessCodeManager from '../../features/teacher/components/TeacherAccessCodeManager';
import TeacherAttendanceManager from '../../features/teacher/components/TeacherAttendanceManager';
import AdminUserManagement from '../../features/admin/components/AdminUserManagement';
import { useTeacherCourses } from '../../features/teacher/hooks/useTeacherCourses';
import { getGroupsApi } from '../../services/groupService';
import apiClient from '../../services/apiClient';
import {
  Home,
  BookOpen,
  Video,
  FileText,
  Award,
  FolderKanban,
  CalendarCheck,
  KeyRound,
  UserCheck,
  Users,
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
  { id: 'students', label: 'إدارة المدراء والمنصة', icon: <UserCheck size={20} /> },
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

  const [groupsCount, setGroupsCount] = React.useState<number>(0);
  const [totalStudentsCount, setTotalStudentsCount] = React.useState<number>(0);
  const [recentStudents, setRecentStudents] = React.useState<JoinedStudent[]>([]);

  React.useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const groups = await getGroupsApi();
        if (isMounted) {
          setGroupsCount(groups.length);
        }
      } catch {
        if (isMounted) setGroupsCount(0);
      }

      try {
        const res = await apiClient.get('/api/students', {
          params: { page: 1, limit: 5 },
          headers: { 'X-Skip-Auth-Redirect': 'true' },
        });

        if (isMounted && res.data) {
          setTotalStudentsCount(res.data.total || 0);
          if (Array.isArray(res.data.data)) {
            const mappedStudents: JoinedStudent[] = res.data.data.map((s: any) => ({
              id: s._id,
              name: s.name,
              groupName: s.groupID?.name || s.phone || 'طالب مسجل',
              timeAgo: 'انضم حديثاً',
            }));
            setRecentStudents(mappedStudents);
          }
        }
      } catch {
        if (isMounted) {
          setRecentStudents([]);
          setTotalStudentsCount(0);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const formattedCourses: CourseItem[] = React.useMemo(() => {
    if (!teacherCourses || teacherCourses.length === 0) return [];
    return teacherCourses.map((c) => ({
      id: c._id,
      title: c.title,
      level: c.isPublished ? 'منشور للمجموعات' : 'مسودة غير منشورة',
      studentCount: totalStudentsCount,
      progress: c.isPublished ? 100 : 40,
      imageUrl: '',
    }));
  }, [teacherCourses, totalStudentsCount]);

  // const performanceBreakdown = React.useMemo(() => [
  //   { label: 'ممتاز (A)', percentage: 45, color: 'bg-[#0D8A82]' },
  //   { label: 'جيد جداً (B)', percentage: 30, color: 'bg-[#0D8A82]' },
  //   { label: 'جيد (C)', percentage: 15, color: 'bg-amber-400' },
  //   { label: 'مقبول (D)', percentage: 7, color: 'bg-orange-400' },
  //   { label: 'يحتاج تحسين', percentage: 3, color: 'bg-rose-500' },
  // ], []);

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

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiStatCard
              title="إجمالي الطلاب"
              value={totalStudentsCount}
              subtitle="طالب مسجل بالمنصة"
              icon={<Users size={24} />}
              color="teal"
            />
            <KpiStatCard
              title="المقررات المتاحة"
              value={totalCourses}
              subtitle="مقرر تعليمي نشط"
              icon={<BookOpen size={24} />}
              color="purple"
            />
            <KpiStatCard
              title="المجموعات الدراسية"
              value={groupsCount}
              subtitle="مجموعة مسجلة"
              icon={<FolderKanban size={24} />}
              color="amber"
            />
            <KpiStatCard
              title="أكواد التفعيل والنتائج"
              value="مفعلة"
              subtitle="مولد الكروت والمتابعة"
              icon={<Award size={24} />}
              color="green"
            />
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentStudentsWidget
              students={recentStudents}
              onViewAll={() => handleSelectTab('students')}
            />
            <CourseProgressWidget
              courses={formattedCourses}
              title="المقررات المتاحة بالمنصة"
              onAddCourse={() => handleSelectTab('courses')}
              onViewAll={() => handleSelectTab('courses')}
              onSelectCourse={() => handleSelectTab('courses')}
            />
          </div>

          {/* Performance Analytics */}
          {/* <PerformanceAnalytics
            averagePerformance={50}
            breakdown={performanceBreakdown}
          /> */}
        </div>
      )}

      {activeTab === 'courses' && <CourseManager />}
      {activeTab === 'lessons' && <LessonManager />}
      {activeTab === 'quizzes' && <QuizBuilder />}
      {activeTab === 'exams' && <TeacherExamManager />}
      {activeTab === 'groups' && <TeacherGroupManager />}
      {activeTab === 'access-codes' && <TeacherAccessCodeManager />}
      {activeTab === 'attendance' && <TeacherAttendanceManager />}
      {activeTab === 'students' && <AdminUserManagement />}
    </DashboardLayout>
  );
};

export default TeacherDashboard;
