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

import type { Lesson } from '../../features/lessons/types/lesson';
import { LessonVideoPlayer } from '../../features/lessons/components/LessonVideoPlayer';

const studentNavItems = [
  { id: 'home', label: 'الرئيسية', icon: <Home size={20} /> },
  { id: 'lessons', label: 'المحاضرات والدروس', icon: <Video size={20} /> },
  { id: 'quizzes', label: 'الاختبارات والتقييم', icon: <FileText size={20} /> },
  { id: 'attendance', label: 'سجل الحضور', icon: <CalendarCheck size={20} /> },
  { id: 'profile', label: 'الملف الشخصي', icon: <User size={20} /> },
  { id: 'settings', label: 'الإعدادات', icon: <Settings size={20} /> },
];

interface MockCourse {
  _id: string;
  title: string;
  description: string;
}

const mockFallbackCourses: MockCourse[] = [
  {
    _id: 'mock-course-1',
    title: 'الكيمياء العضوية',
    description: 'شرح تفاعلي شامل لباب الكيمياء العضوية والهيدروكربونات',
  },
  {
    _id: 'mock-course-2',
    title: 'الكيمياء غير العضوية',
    description: 'شرح العناصر الانتقالية والخواص الكيميائية',
  },
  {
    _id: 'mock-course-3',
    title: 'الكيمياء التحليلية',
    description: 'شرح التحليل الكيفي والكمي والمسائل',
  },
];

const mockFallbackLessons: Record<string, Lesson[]> = {
  'mock-course-1': [
    {
      _id: 'mock-lesson-1',
      courseID: 'mock-course-1',
      title: 'المقدمة والهيدروكربونات الأليفاتية',
      description: 'شرح مفاهيم الكيمياء العضوية الأليفاتية والألكانات والألكينات',
      order: 1,
      requiresPassing: false,
      isActive: true,
    },
    {
      _id: 'mock-lesson-2',
      courseID: 'mock-course-1',
      title: 'الهيدروكربونات الأروماتية والعديد من المركبات',
      description: 'شرح البنزين العطري وتفاعلات الإحلال والأكسدة',
      order: 2,
      requiresPassing: true,
      isActive: true,
    },
    {
      _id: 'mock-lesson-3',
      courseID: 'mock-course-1',
      title: 'الكحولات والفينولات والإيثرات',
      description: 'خواص الكحولات وتحضيرها والتفاعلات الكيميائية',
      order: 3,
      requiresPassing: false,
      isActive: true,
    },
  ],
  'mock-course-2': [
    {
      _id: 'mock-lesson-4',
      courseID: 'mock-course-2',
      title: 'العناصر الانتقالية والتركيب الإلكتروني',
      description: 'خواص السلسلة الانتقالية الأولى وحالات التأكسد',
      order: 1,
      requiresPassing: false,
      isActive: true,
    },
    {
      _id: 'mock-lesson-5',
      courseID: 'mock-course-2',
      title: 'استخلاص الحديد وتفاعلات الأكاسيد',
      description: 'تجهيز الخامات واختزال الحديد في الفرن العالي وفرن مدركس',
      order: 2,
      requiresPassing: true,
      isActive: true,
    },
  ],
  'mock-course-3': [
    {
      _id: 'mock-lesson-6',
      courseID: 'mock-course-3',
      title: 'التحليل الكيفي والكشف عن الأنيونات',
      description: 'الكشف عن مجموعة حمض الهيدروكلوريك ومجموعة كبريتيد الهيدروجين',
      order: 1,
      requiresPassing: false,
      isActive: true,
    },
    {
      _id: 'mock-lesson-7',
      courseID: 'mock-course-3',
      title: 'التحليل الحجمي والمعايرة والحسابات',
      description: 'مسائل التعديل والترسيب والتطاير في التحليل الكمي',
      order: 2,
      requiresPassing: false,
      isActive: true,
    },
  ],
};

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
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

  const effectiveCourses: Array<{ _id: string; title: string }> = (coursesData && coursesData.length > 0) ? coursesData : mockFallbackCourses;

  const effectiveLessons: Lesson[] = (lessonsData && lessonsData.length > 0)
    ? lessonsData
    : (selectedCourseId && mockFallbackLessons[selectedCourseId] ? mockFallbackLessons[selectedCourseId] : []);

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
      setSelectedLessonId(sortedLessons[currentLessonIndex - 1]._id);
    }
  };

  const handleNextLesson = () => {
    if (hasNextLesson) {
      setSelectedLessonId(sortedLessons[currentLessonIndex + 1]._id);
    }
  };

  const handleVideoEnded = () => {
    if (selectedLessonId) {
      setCompletedLessonIds((prev) =>
        prev.includes(selectedLessonId) ? prev : [...prev, selectedLessonId]
      );
    }
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedLessonId('');
    setCompletedLessonIds([]);
    setActiveTab('lessons');
  };

  const selectedCourse = effectiveCourses.find((c) => c._id === selectedCourseId);
  const selectedLesson = effectiveLessons.find((l) => l._id === selectedLessonId);

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
            ) : (
              <CourseProgressWidget
                courses={effectiveCourses.map((course) => ({
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

         
          {effectiveCourses.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {effectiveCourses.map((course) => (
                <button
                  key={course._id}
                  onClick={() => {
                    setSelectedCourseId(course._id);
                    setSelectedLessonId('');
                  }}
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

          {/* Course Lesson Progress Indicator */}
          {selectedCourseId && totalLessonsCount > 0 && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-[#0D8A82]" />
                  <span>نسبة الإنجاز في هذا المقرر</span>
                </span>
                <span className="text-[#0D8A82]">
                  {completedLessonsCount} من {totalLessonsCount} دروس ({courseProgressPercentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                <div
                  className="h-full bg-[#0D8A82] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${courseProgressPercentage}%` }}
                />
              </div>
            </div>
          )}

          
          {selectedLessonId && (
            <LessonVideoPlayer
              lessonId={selectedLessonId}
              lessonTitle={selectedLesson?.title}
              lessonDescription={selectedLesson?.description}
              lessonOrder={selectedLesson?.order}
              requiresPassing={selectedLesson?.requiresPassing}
              onPreviousLesson={handlePreviousLesson}
              onNextLesson={handleNextLesson}
              hasPrevious={hasPreviousLesson}
              hasNext={hasNextLesson}
              onVideoEnded={handleVideoEnded}
              isCompletedSession={completedLessonIds.includes(selectedLessonId)}
            />
          )}

         
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
          ) : isLessonsLoadingState ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs flex flex-col items-center justify-center min-h-[220px] text-center">
              <div className="w-8 h-8 border-3 border-[#0D8A82] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs text-slate-500 font-semibold">جاري تحميل دروس المقرر...</p>
            </div>
          ) : isLessonsError && effectiveLessons.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-red-200 bg-red-50/50 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
              <AlertTriangle size={28} className="text-red-500" />
              <h4 className="text-sm font-bold text-slate-800">حدث خطأ أثناء تحميل دروس المقرر</h4>
              <p className="text-xs text-slate-500 font-semibold">يرجى المحاولة مرة أخرى لاحقاً</p>
              <button
                onClick={() => refetchLessons()}
                className="mt-2 px-4 py-2 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : effectiveLessons.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs flex flex-col items-center justify-center text-center space-y-2">
              <Video size={32} className="text-slate-400" />
              <h4 className="text-sm font-bold text-slate-700">لا توجد دروس مضافة لهذا المقرر حتى الآن</h4>
              <p className="text-xs text-slate-400 font-semibold">سيتم إضافة المحاضرات والدروس قريباً</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedLessons.map((lesson) => {
                const isSelected = selectedLessonId === lesson._id;
                const isCompleted = completedLessonIds.includes(lesson._id);
                return (
                  <div
                    key={lesson._id}
                    onClick={() => setSelectedLessonId(lesson._id)}
                    className={`rounded-2xl p-4 border shadow-xs flex items-center justify-between gap-4 transition cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/60 border-[#0D8A82] ring-1 ring-[#0D8A82]'
                        : 'bg-white border-slate-200/90 hover:border-teal-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-[#0D8A82] text-white border-[#0D8A82]'
                            : isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {lesson.order}
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-800">{lesson.title}</h4>
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              تمت المشاهدة
                            </span>
                          )}
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
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                          isSelected
                            ? 'bg-[#0D8A82] text-white border-[#0D8A82]'
                            : 'bg-teal-50 text-[#0D8A82] border-teal-100'
                        }`}
                      >
                        <Video size={14} />
                        <span>{isSelected ? 'جاري العرض' : 'تشغيل المحاضرة'}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
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
