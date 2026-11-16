import React, { useState } from 'react';
import { Plus, Loader2, AlertTriangle, BookOpen, Video, RefreshCw, GraduationCap } from 'lucide-react';
import { useTeacherCourses } from '../hooks/useTeacherCourses';
import { useCourseLessons } from '../../lessons/hooks/useCourseLessons';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { Grade, GRADE_OPTIONS } from '../../../types/grade';
import { AcademicTrack } from '../../../types/academicTrack';
import { getCourseGradeTrackLabel } from '../../courses/utils/courseTrackUtils';
import type { Lesson } from '../../lessons/types/lesson';
import { LessonCard } from './lessons/LessonCard';
import { CreateLessonModal } from './lessons/CreateLessonModal';
import { EditLessonModal } from './lessons/EditLessonModal';
import { DeleteLessonModal } from './lessons/DeleteLessonModal';

export const LessonManager: React.FC = () => {
  const { data: courses, isLoading: isLoadingCourses } = useTeacherCourses();
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'ALL' | Grade>('ALL');
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<'ALL' | AcademicTrack>('ALL');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);

  const handleGradeFilterChange = (grade: 'ALL' | Grade) => {
    setSelectedGradeFilter(grade);
    if (grade !== Grade.SecondSecondary) {
      setSelectedTrackFilter('ALL');
    }
  };

  const secondSecCourses = React.useMemo(() => {
    return courses ? courses.filter((c) => c.grade === Grade.SecondSecondary) : [];
  }, [courses]);

  const secondSecGeneralCount = React.useMemo(() => {
    return secondSecCourses.filter((c) => c.academicTrack === AcademicTrack.General).length;
  }, [secondSecCourses]);

  const secondSecBacCount = React.useMemo(() => {
    return secondSecCourses.filter((c) => c.academicTrack === AcademicTrack.Baccalaureate).length;
  }, [secondSecCourses]);

  const filteredCourses = React.useMemo(() => {
    if (!courses) return [];
    let list = courses;
    if (selectedGradeFilter !== 'ALL') {
      list = list.filter((c) => c.grade === selectedGradeFilter);
      if (selectedGradeFilter === Grade.SecondSecondary && selectedTrackFilter !== 'ALL') {
        list = list.filter((c) => c.academicTrack === selectedTrackFilter);
      }
    }
    return list;
  }, [courses, selectedGradeFilter, selectedTrackFilter]);

  const selectedCourse = React.useMemo(() => {
    return courses?.find((c) => c._id === selectedCourseId);
  }, [courses, selectedCourseId]);

  const {
    data: lessons,
    isLoading: isLoadingLessons,
    isError: isLessonsError,
    error: lessonsError,
    refetch: refetchLessons,
  } = useCourseLessons(selectedCourseId);

  const sortedLessons = React.useMemo(() => {
    return lessons ? [...lessons].sort((a, b) => a.order - b.order) : [];
  }, [lessons]);

  return (
    <div className="space-y-6">
     
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-3xl mx-auto space-y-6">
        {/* Grade Filter Tabs */}
        {courses && courses.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <span className="text-xs font-bold text-slate-500 shrink-0 ml-1">تصفية بالمرحلة:</span>
            <button
              type="button"
              onClick={() => handleGradeFilterChange('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border ${
                selectedGradeFilter === 'ALL'
                  ? 'bg-[#0D8A82] text-white border-[#0D8A82] shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              الكل ({courses.length})
            </button>
            {GRADE_OPTIONS.map((opt) => {
              const count = courses.filter((c) => c.grade === opt.value).length;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleGradeFilterChange(opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border ${
                    selectedGradeFilter === opt.value
                      ? 'bg-[#0D8A82] text-white border-[#0D8A82] shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.shortLabel} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* 2nd Secondary Track Filter Tabs */}
        {selectedGradeFilter === Grade.SecondSecondary && secondSecCourses.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex-wrap animate-in fade-in duration-150">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5 ml-1">
              <GraduationCap size={15} className="text-indigo-600" />
              <span>مسار تانية ثانوي:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedTrackFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedTrackFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              الكل ({secondSecCourses.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTrackFilter(AcademicTrack.General)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedTrackFilter === AcademicTrack.General
                  ? 'bg-indigo-700 text-white shadow-2xs'
                  : 'bg-white text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              المسار العام ({secondSecGeneralCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTrackFilter(AcademicTrack.Baccalaureate)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedTrackFilter === AcademicTrack.Baccalaureate
                  ? 'bg-indigo-800 text-white shadow-2xs'
                  : 'bg-white text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              مسار البكالوريا ({secondSecBacCount})
            </button>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            اختر الكورس / المقرر *
          </label>
          {isLoadingCourses ? (
            <div className="p-3 bg-slate-50 rounded-xl text-xs font-semibold text-slate-400 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              <span>جاري تحميل قائمة المقررات...</span>
            </div>
          ) : !courses || courses.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold flex items-center gap-2">
              <BookOpen size={16} />
              <span>لا توجد كورسات مضافة. يرجى إضافة كورس أولاً من قسم الكورسات.</span>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold">
              لا توجد كورسات مضافة لهذه المرحلة أو المسار الدراسي المحدد.
            </div>
          ) : (
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] bg-white transition"
            >
              <option value="">-- اختر كورس لتنفيذ إضافة الدرس --</option>
              {filteredCourses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title} — ({getCourseGradeTrackLabel(c)})
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedCourse && (
          <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-2xl flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-[#0D8A82]" />
              <span className="text-xs font-extrabold text-slate-800">{selectedCourse.title}</span>
              {selectedCourse.grade && (
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-white text-slate-700 border border-slate-200">
                  {getCourseGradeTrackLabel(selectedCourse)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-teal-800 font-semibold">
              جاهز لإضافة وإدارة دروس هذا المقرر
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-3">
          <div className="text-xs text-slate-500 font-medium">
            {!selectedCourseId ? (
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <AlertTriangle size={14} />
                يرجى اختيار كورس أولاً لتأكيد إمكانية إضافة درس جديد
              </span>
            ) : (
              <span className="text-slate-600 font-semibold">
                تم تحديد المقرر. يمكنك الآن إضافة درس جديد.
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={!selectedCourseId}
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Plus size={16} />
            <span> إضافة درس جديد</span>
          </button>
        </div>
      </div>

     
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Video size={18} className="text-[#0D8A82]" />
            <span>دروس المقرر المحدد</span>
          </h4>
          {selectedCourseId && lessons && lessons.length > 0 && (
            <span className="text-xs font-bold text-slate-500">
              إجمالي الدروس: {lessons.length}
            </span>
          )}
        </div>

        {!selectedCourseId ? (
          <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center space-y-1">
            <BookOpen size={32} className="text-slate-300 mx-auto mb-1" />
            <p className="text-xs font-bold text-slate-600">
              اختر كورس من القائمة أعلاه لعرض دروسه الحالية
            </p>
          </div>
        ) : isLoadingLessons ? (
          <div className="flex flex-col items-center justify-center min-h-[140px] text-center space-y-2">
            <Loader2 size={32} className="animate-spin text-[#0D8A82]" />
            <p className="text-xs font-semibold text-slate-500">جاري تحميل دروس المقرر...</p>
          </div>
        ) : isLessonsError ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2">
            <AlertTriangle size={32} className="text-red-500 mx-auto" />
            <p className="text-xs font-bold text-slate-800">
              {toArabicErrorMessage(lessonsError, 'حدث خطأ أثناء تحميل دروس المقرر')}
            </p>
            <button
              onClick={() => refetchLessons()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        ) : sortedLessons.length === 0 ? (
          <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center space-y-1">
            <Video size={32} className="text-slate-300 mx-auto mb-1" />
            <p className="text-xs font-bold text-slate-600">
              لا توجد دروس مضافة لهذا المقرر حتى الآن
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedLessons.map((lesson) => (
              <LessonCard
                key={lesson._id}
                lesson={lesson}
                onEdit={(l) => setEditingLesson(l)}
                onDelete={(l) => setDeletingLesson(l)}
              />
            ))}
          </div>
        )}
      </div>

      
      <CreateLessonModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        selectedCourseId={selectedCourseId}
        courseTitle={selectedCourse?.title}
        courseLabel={getCourseGradeTrackLabel(selectedCourse)}
      />

      
      <EditLessonModal
        isOpen={Boolean(editingLesson)}
        onClose={() => setEditingLesson(null)}
        lesson={editingLesson}
        courseId={selectedCourseId}
      />

      
      <DeleteLessonModal
        isOpen={Boolean(deletingLesson)}
        onClose={() => setDeletingLesson(null)}
        lesson={deletingLesson}
        courseId={selectedCourseId}
      />
    </div>
  );
};

export default LessonManager;


