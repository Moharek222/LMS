import React, { useState } from 'react';
import { Plus, Loader2, AlertTriangle, BookOpen, Video, RefreshCw } from 'lucide-react';
import { useTeacherCourses } from '../hooks/useTeacherCourses';
import { useCourseLessons } from '../../lessons/hooks/useCourseLessons';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import type { Lesson } from '../../lessons/types/lesson';
import { LessonCard } from './lessons/LessonCard';
import { CreateLessonModal } from './lessons/CreateLessonModal';
import { EditLessonModal } from './lessons/EditLessonModal';
import { DeleteLessonModal } from './lessons/DeleteLessonModal';

export const LessonManager: React.FC = () => {
  const { data: courses, isLoading: isLoadingCourses } = useTeacherCourses();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);

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
      {/* Course Selection Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-3xl mx-auto space-y-6">
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
          ) : (
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
            >
              <option value="">-- اختر كورس لتنفيذ إضافة الدرس --</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          )}
        </div>

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
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Plus size={16} />
            <span> إضافة درس جديد</span>
          </button>
        </div>
      </div>

      {/* Lesson List Container */}
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

      {/* Extracted Create Lesson Modal */}
      <CreateLessonModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        selectedCourseId={selectedCourseId}
      />

      {/* Edit Lesson Modal */}
      <EditLessonModal
        isOpen={Boolean(editingLesson)}
        onClose={() => setEditingLesson(null)}
        lesson={editingLesson}
        courseId={selectedCourseId}
      />

      {/* Delete Lesson Modal */}
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


