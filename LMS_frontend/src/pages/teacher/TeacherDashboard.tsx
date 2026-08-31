import React, { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ChemistryBanner } from '../../components/dashboard/ChemistryBanner';
import { KpiStatCard } from '../../components/dashboard/KpiStatCard';
import { RecentStudentsWidget } from '../../components/dashboard/RecentStudentsWidget';
import { CourseProgressWidget } from '../../components/dashboard/CourseProgressWidget';
import { UpcomingTasksWidget } from '../../components/dashboard/UpcomingTasksWidget';
import { PerformanceAnalytics } from '../../components/dashboard/PerformanceAnalytics';
import {
  BookOpen,
  Video,
  Users,
  FileText,
  FlaskConical,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');

  return (
    <DashboardLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      subtitle="المرحلة الثانوية"
    >
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* Chemistry Banner */}
          <ChemistryBanner quote="الكيمياء ليست مجرد معادلات، بل هي لغة الطبيعة" />

          {/* 5 KPI Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiStatCard
              title="المقررات"
              value={8}
              subtitle="مقرر نشط"
              icon={<BookOpen size={24} />}
              color="teal"
            />
            <KpiStatCard
              title="الدروس"
              value={42}
              subtitle="درس منشور"
              icon={<Video size={24} />}
              color="blue"
            />
            <KpiStatCard
              title="الطلاب"
              value={156}
              subtitle="طالب نشط"
              icon={<Users size={24} />}
              color="green"
            />
            <KpiStatCard
              title="الاختبارات"
              value={12}
              subtitle="اختبار منشور"
              icon={<FileText size={24} />}
              color="amber"
            />
            <KpiStatCard
              title="متوسط أداء الطلاب"
              value="78%"
              subtitle="هذا الشهر"
              icon={<FlaskConical size={24} />}
              color="purple"
            />
          </div>

          {/* Middle 3-Column Widgets Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <RecentStudentsWidget onViewAll={() => setActiveTab('students')} />
            <CourseProgressWidget
              onAddCourse={() => setActiveTab('courses')}
              onViewAll={() => setActiveTab('courses')}
            />
            <UpcomingTasksWidget onViewAll={() => setActiveTab('quizzes')} />
          </div>

          {/* Bottom Analytics Section: Donut Chart + Atom Quote Card */}
          <PerformanceAnalytics />
        </div>
      )}

      {/* Subpage Views */}
      {activeTab !== 'home' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
            <FlaskConical size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-800">
            قسم {activeTab === 'courses' ? 'المقررات' : activeTab === 'students' ? 'الطلاب' : activeTab === 'quizzes' ? 'الاختبارات' : 'إدارة الكيمياء'}
          </h3>
          <p className="text-sm text-slate-500 font-semibold max-w-md mx-auto">
            أهلاً بك في قسم الإدارة. يتم الآن ربط البيانات التفاعلية وجاهزية الجداول التفاعلية.
          </p>
          <button
            onClick={() => setActiveTab('home')}
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
