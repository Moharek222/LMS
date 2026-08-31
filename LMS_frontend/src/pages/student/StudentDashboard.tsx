import React, { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ChemistryBanner } from '../../components/dashboard/ChemistryBanner';
import { KpiStatCard } from '../../components/dashboard/KpiStatCard';
import { CourseProgressWidget } from '../../components/dashboard/CourseProgressWidget';
import { UpcomingTasksWidget } from '../../components/dashboard/UpcomingTasksWidget';
import { PerformanceAnalytics } from '../../components/dashboard/PerformanceAnalytics';
import { useAuth } from '../../context/useAuth';
import {
  BookOpen,
  Video,
  FileText,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Home,
  User,
  Settings,
} from 'lucide-react';

const studentNavItems = [
  { id: 'home', label: 'الرئيسية', icon: <Home size={20} /> },
  { id: 'courses', label: 'المقررات', icon: <BookOpen size={20} /> },
  { id: 'lessons', label: 'المحاضرات والدروس', icon: <Video size={20} /> },
  { id: 'quizzes', label: 'الاختبارات والتقييم', icon: <FileText size={20} /> },
  { id: 'attendance', label: 'سجل الحضور', icon: <CalendarCheck size={20} /> },
  { id: 'profile', label: 'الملف الشخصي', icon: <User size={20} /> },
  { id: 'settings', label: 'الإعدادات', icon: <Settings size={20} /> },
];

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');

  return (
    <DashboardLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      navItems={studentNavItems}
      subtitle="بوابة الطالب التعليمية"
    >
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* Banner */}
          <ChemistryBanner quote="تعلم الكيمياء بفهم وتطبيق وثقة مع منصة الصادق" />

          {/* Subscription Status Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  user?.hasActiveSubscription
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                }`}
              >
                {user?.hasActiveSubscription ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">حالة الاشتراك في المنصة</h4>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  {user?.hasActiveSubscription
                    ? 'اشتراكك نشط ومفعل لمتابعة جميع المحاضرات والامتحانات'
                    : 'تنبيه: يلزم تفعيل كارت الاشتراك للوصول الكامل للمحاضرات والدروس المحمية'}
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              {user?.hasActiveSubscription ? (
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

          {/* 4 KPI Summary Stat Cards for Students */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiStatCard
              title="المواد الدراسية"
              value={4}
              subtitle="مقررات مضافة"
              icon={<BookOpen size={24} />}
              color="teal"
            />
            <KpiStatCard
              title="المحاضرات والدروس"
              value={24}
              subtitle="درس مكتمل"
              icon={<Video size={24} />}
              color="blue"
            />
            <KpiStatCard
              title="الاختبارات المكتملة"
              value={8}
              subtitle="اختبار مجتاز"
              icon={<FileText size={24} />}
              color="amber"
            />
            <KpiStatCard
              title="معدل الحضور"
              value="96%"
              subtitle="نسبة الحضور التراكمية"
              icon={<CalendarCheck size={24} />}
              color="green"
            />
          </div>

          {/* 2-Column Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CourseProgressWidget onViewAll={() => setActiveTab('courses')} />
            <UpcomingTasksWidget onViewAll={() => setActiveTab('quizzes')} />
          </div>

          {/* Performance Analytics */}
          <PerformanceAnalytics />
        </div>
      )}

      {/* Subpage Placeholder */}
      {activeTab !== 'home' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
            <FlaskConical size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-800">
            قسم {activeTab === 'courses' ? 'المقررات' : activeTab === 'lessons' ? 'الدروس' : activeTab === 'quizzes' ? 'الاختبارات' : 'بوابة الطالب'}
          </h3>
          <p className="text-sm text-slate-500 font-semibold max-w-md mx-auto">
            أهلاً بك في بوابة الطالب. يتم الآن ربط الشرح التفاعلي والملاحظات.
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

export default StudentDashboard;
