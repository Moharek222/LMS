import React, { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ChemistryBanner } from '../../components/dashboard/ChemistryBanner';
import { KpiStatCard } from '../../components/dashboard/KpiStatCard';
import { CourseProgressWidget } from '../../components/dashboard/CourseProgressWidget';
import { UpcomingTasksWidget } from '../../components/dashboard/UpcomingTasksWidget';
import { PerformanceAnalytics } from '../../components/dashboard/PerformanceAnalytics';
import { useAuth } from '../../context/useAuth';
import { useStudentCourses } from '../../features/courses/hooks/useStudentCourses';
import { useCourseLessons } from '../../features/lessons/hooks/useCourseLessons';
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
  ChevronRight,
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
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  const {
    data: coursesData,
    isLoading: isLoadingCourses,
    isError: isCoursesError,
  } = useStudentCourses();

  const {
    data: lessonsData,
    isLoading: isLoadingLessons,
    isError: isLessonsError,
  } = useCourseLessons(selectedCourseId);

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveTab('lessons');
  };

  const selectedCourse = coursesData?.find((c) => c._id === selectedCourseId);

  return (
    <DashboardLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      navItems={studentNavItems}
      subtitle="بوابة الطالب التعليمية"
    >
      {activeTab === 'home' && (
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

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {isLoadingCourses ? (
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col items-center justify-center min-h-[220px] text-center">
                <div className="w-8 h-8 border-3 border-[#0D8A82] border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-xs text-slate-500 font-semibold">جاري تحميل المقررات...</p>
              </div>
            ) : isCoursesError ? (
              <div className="bg-white rounded-2xl p-5 border border-red-200 bg-red-50/50 shadow-xs flex flex-col items-center justify-center min-h-[220px] text-center p-4">
                <AlertTriangle size={24} className="text-red-500 mb-2" />
                <p className="text-xs font-bold text-slate-800">حدث خطأ أثناء تحميل المقررات</p>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">يرجى المحاولة مرة أخرى لاحقاً</p>
              </div>
            ) : coursesData && coursesData.length === 0 ? (
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col items-center justify-center min-h-[220px] text-center p-4">
                <BookOpen size={28} className="text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-700">لا توجد مقررات مضافة حالياً</p>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">لم يتم إسناد مقررات دراسية لك حتى الآن</p>
              </div>
            ) : (
              <CourseProgressWidget
                courses={coursesData?.map((course) => ({
                  id: course._id,
                  title: course.title,
                  level: 'مقرر دراسي',
                  studentCount: 0,
                  progress: 0,
                  imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=200',
                }))}
                onViewAll={() => setActiveTab('courses')}
                onSelectCourse={handleSelectCourse}
              />
            )}
            <UpcomingTasksWidget onViewAll={() => setActiveTab('quizzes')} />
          </div>

          
          <PerformanceAnalytics />
        </div>
      )}

      {/* Courses / Lessons Tab Content */}
      {(activeTab === 'courses' || activeTab === 'lessons') && (
        <div className="space-y-6">
         
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D8A82] flex items-center justify-center shrink-0 border border-teal-100">
                <BookOpen size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  {selectedCourse ? selectedCourse.title : 'المقررات والدروس التعليمية'}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  اختر الكورس لمتابعة المحاضرات والدروس المتاحة
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('home')}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#0D8A82] transition cursor-pointer"
            >
              <ChevronRight size={16} />
              <span>العودة للرئيسية</span>
            </button>
          </div>

          {/* Course Selector Buttons */}
          {coursesData && coursesData.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {coursesData.map((course) => (
                <button
                  key={course._id}
                  onClick={() => setSelectedCourseId(course._id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                    selectedCourseId === course._id
                      ? 'bg-[#0D8A82] text-white border-[#0D8A82] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {course.title}
                </button>
              ))}
            </div>
          )}

          {/* Lessons List Section */}
          {!selectedCourseId ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
                <BookOpen size={28} />
              </div>
              <h4 className="text-base font-bold text-slate-800">اختر كورس لعرض الدروس</h4>
              <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
                اضغط على إحدى الكورسات أعلاه أو من الرئيسية لعرض المحاضرات الخاصة بها.
              </p>
            </div>
          ) : isLoadingLessons ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs flex flex-col items-center justify-center min-h-[220px] text-center">
              <div className="w-8 h-8 border-3 border-[#0D8A82] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs text-slate-500 font-semibold">جاري تحميل دروس المقرر...</p>
            </div>
          ) : isLessonsError ? (
            <div className="bg-white rounded-2xl p-8 border border-red-200 bg-red-50/50 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
              <AlertTriangle size={28} className="text-red-500" />
              <h4 className="text-sm font-bold text-slate-800">حدث خطأ أثناء تحميل دروس المقرر</h4>
              <p className="text-xs text-slate-500 font-semibold">يرجى المحاولة مرة أخرى لاحقاً</p>
            </div>
          ) : lessonsData && lessonsData.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
              <Video size={32} className="text-slate-400" />
              <h4 className="text-sm font-bold text-slate-700">لا توجد دروس مضافة لهذا المقرر حتى الآن</h4>
              <p className="text-xs text-slate-400 font-semibold">سيتم إضافة المحاضرات والدروس قريباً</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessonsData?.map((lesson) => (
                <div
                  key={lesson._id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-center justify-between gap-4 hover:border-teal-200 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center shrink-0 border border-slate-200">
                      {lesson.order}
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-800">{lesson.title}</h4>
                        {lesson.requiresPassing && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                            يتطلب اجتياز اختبار
                          </span>
                        )}
                      </div>
                      {lesson.description && (
                        <p className="text-xs text-slate-500 font-medium line-clamp-1">{lesson.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 text-[#0D8A82] text-xs font-bold border border-teal-100">
                      <Video size={14} />
                      <span>محاضرة دراسية</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      
      {activeTab !== 'home' && activeTab !== 'courses' && activeTab !== 'lessons' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
            <FlaskConical size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-800">
            قسم {activeTab === 'quizzes' ? 'الاختبارات' : activeTab === 'attendance' ? 'سجل الحضور' : activeTab === 'profile' ? 'الملف الشخصي' : 'الإعدادات'}
          </h3>
          <p className="text-sm text-slate-500 font-semibold max-w-md mx-auto">
            أهلاً بك في بوابة الطالب. يتم الآن إعداد البيانات الخاصة بهذا القسم.
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
