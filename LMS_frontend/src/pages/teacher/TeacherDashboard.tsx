import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ChemistryBanner } from '../../components/dashboard/ChemistryBanner';
import { KpiStatCard } from '../../components/dashboard/KpiStatCard';
import { RecentStudentsWidget, type JoinedStudent } from '../../components/dashboard/RecentStudentsWidget';
import { CourseProgressWidget, type CourseItem } from '../../components/dashboard/CourseProgressWidget';
import {
  CourseManager,
  LessonManager,
  QuizBuilder,
  TeacherExamManager,
  TeacherGroupManager,
  TeacherAccessCodeManager,
  TeacherAttendanceManager,
  DeactivatedStudentsManager,
  useTeacherCourses,
  useTeacherGroups,
} from '../../features/teacher';
import { AdminUserManagement } from '../../features/admin';
import apiClient from '../../services/apiClient';
import { GRADE_OPTIONS, getGradeShortLabel, getGradeBadgeStyle } from '../../types/grade';
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
  UserX,
  Users,
  Layers,
} from 'lucide-react';
import type { NavItem } from '../../components/dashboard/Sidebar';

const validTeacherTabs = [
  'home',
  'courses',
  'lessons',
  'quizzes',
  'exams',
  'groups',
  'activate-students',
  'attendance',
  'access-codes',
  'admins',
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
  { id: 'activate-students', label: 'تفعيل الطلاب', icon: <UserX size={20} /> },
  { id: 'attendance', label: 'الغياب (QR)', icon: <CalendarCheck size={20} /> },
  { id: 'access-codes', label: 'أكواد التفعيل', icon: <KeyRound size={20} /> },
  { id: 'admins', label: 'إدارة المدراء والمنصة', icon: <UserCheck size={20} /> },
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

  const { data: groupsData } = useTeacherGroups({ page: 1, limit: 100 });
  const groupsCount = groupsData?.total ?? groupsData?.data?.length ?? 0;

  const { data: studentsSummary } = useQuery<{
    total?: number;
    data?: Array<{
      _id: string;
      name: string;
      phone?: string;
      groupID?: { name?: string };
    }>;
  }>({
    queryKey: ['platform-students-summary'],
    queryFn: async () => {
      const res = await apiClient.get('/api/students', {
        params: { page: 1, limit: 5 },
      });
      return res.data;
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const totalStudentsCount = studentsSummary?.total || 0;

  const recentStudents: JoinedStudent[] = React.useMemo(() => {
    if (!studentsSummary?.data || !Array.isArray(studentsSummary.data)) return [];
    return studentsSummary.data.map((s) => ({
      id: s._id,
      name: s.name,
      groupName: s.groupID?.name || s.phone || 'طالب مسجل',
      timeAgo: 'انضم حديثاً',
    }));
  }, [studentsSummary]);

  const formattedCourses: CourseItem[] = React.useMemo(() => {
    if (!teacherCourses || teacherCourses.length === 0) return [];
    return teacherCourses.map((c) => ({
      id: c._id,
      title: c.title,
      level: c.grade
        ? `${getGradeShortLabel(c.grade)} • ${c.isPublished ? 'منشور' : 'مسودة'}`
        : c.isPublished
        ? 'منشور للمجموعات'
        : 'مسودة غير منشورة',
      studentCount: totalStudentsCount,
      progress: c.isPublished ? 100 : 40,
      imageUrl: '',
    }));
  }, [teacherCourses, totalStudentsCount]);

  const gradeCourseCounts = React.useMemo(() => {
    return GRADE_OPTIONS.map((opt) => ({
      ...opt,
      count: (teacherCourses || []).filter((c) => c.grade === opt.value).length,
    }));
  }, [teacherCourses]);

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
              color="blue"
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

          {/* Grade Distribution Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
                <Layers size={16} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800">توزيع المقررات حسب المراحل الدراسية</h4>
                <p className="text-[11px] text-slate-400 font-semibold">متابعة جاهزية المحتوى للصفوف الثلاثة</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {gradeCourseCounts.map((g) => {
                const style = getGradeBadgeStyle(g.value);
                return (
                  <span
                    key={g.value}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border flex items-center gap-1.5 ${style.pill}`}
                  >
                    <span>{g.shortLabel}:</span>
                    <span className="font-black underline">{g.count}</span>
                    <span className="text-[10px] font-semibold opacity-80">مقرر</span>
                  </span>
                );
              })}
            </div>
          </div>

          
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

        </div>
      )}

      {activeTab === 'courses' && <CourseManager />}
      {activeTab === 'lessons' && <LessonManager />}
      {activeTab === 'quizzes' && <QuizBuilder />}
      {activeTab === 'exams' && <TeacherExamManager />}
      {activeTab === 'groups' && <TeacherGroupManager />}
      {activeTab === 'activate-students' && <DeactivatedStudentsManager />}
      {activeTab === 'access-codes' && <TeacherAccessCodeManager />}
      {activeTab === 'attendance' && <TeacherAttendanceManager />}
      {(activeTab === 'admins' || activeTab === 'students') && <AdminUserManagement />}
    </DashboardLayout>
  );
};

export default TeacherDashboard;
