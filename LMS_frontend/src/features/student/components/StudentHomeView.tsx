import React from 'react';
import {
  BookOpen,
  Video,
  FileText,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ChemistryBanner } from '../../../components/dashboard/ChemistryBanner';
import { KpiStatCard } from '../../../components/dashboard/KpiStatCard';
import { CourseProgressWidget } from '../../../components/dashboard/CourseProgressWidget';
import { NextActionWidget } from '../../../components/dashboard/NextActionWidget';

export interface CourseItem {
  _id: string;
  title: string;
}

export interface StudentHomeUser {
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
  totalLessonsCount,
}) => {
  const coursesCount = isLoadingCourses ? '—' : effectiveCourses.length;
  const firstCourseTitle = effectiveCourses.length > 0 ? effectiveCourses[0].title : undefined;

  return (
    <div className="space-y-6">
     
      <ChemistryBanner quote="تعلم الكيمياء بفهم وتطبيق وثقة مع منصة الصادق" />

      
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

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStatCard
          title="المواد الدراسية"
          value={coursesCount}
          subtitle={isLoadingCourses ? 'جاري التحميل...' : 'مقررات مضافة'}
          icon={<BookOpen size={24} />}
          color="teal"
        />
        <KpiStatCard
          title="المحاضرات والدروس"
          value={totalLessonsCount && totalLessonsCount > 0 ? totalLessonsCount : '—'}
          subtitle={totalLessonsCount && totalLessonsCount > 0 ? 'دروس المقرر المحدد' : 'محاضرات دراسية'}
          icon={<Video size={24} />}
          color="blue"
        />
        <KpiStatCard
          title="الاختبارات والتقييم"
          value="—"
          subtitle="تقييمات دراسية"
          icon={<FileText size={24} />}
          color="amber"
        />
        <KpiStatCard
          title="سجل الحضور"
          value="—"
          subtitle="سجل الانضباط والغياب"
          icon={<CalendarCheck size={24} />}
          color="green"
        />
      </div>

      
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
            title="موادك الدراسية"
            showAddButton={false}
            showStudentCount={false}
            showProgress={false}
            courses={effectiveCourses.map((course) => ({
              id: course._id,
              title: course.title,
              level: 'مقرر دراسي',
              studentCount: 0,
              progress: 0,
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
