import React, { useState } from 'react';
import { BookOpen, Plus, Loader2, AlertTriangle } from 'lucide-react';
import { useTeacherCourses } from '../hooks/useTeacherCourses';
import { useUpdateCourse } from '../hooks/useUpdateCourse';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { useToast } from '../../../context/ToastContext';
import { CourseCard } from './courses/CourseCard';
import { CreateCourseModal } from './courses/CreateCourseModal';
import { EditCourseModal } from './courses/EditCourseModal';
import { DeactivateCourseModal } from './courses/DeactivateCourseModal';

export const CourseManager: React.FC = () => {
  const toast = useToast();
  const { data: courses, isLoading, isError, refetch } = useTeacherCourses();
  const updateCourseMutation = useUpdateCourse();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [editingCourseId, setEditingCourseId] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [deactivatingCourseId, setDeactivatingCourseId] = useState<string>('');
  const [deactivatingCourseTitle, setDeactivatingCourseTitle] = useState<string>('');
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  const handleOpenEditModal = (courseId: string) => {
    setEditingCourseId(courseId);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCourseId('');
  };

  const handleOpenDeactivateModal = (courseId: string, courseTitle: string) => {
    setDeactivatingCourseId(courseId);
    setDeactivatingCourseTitle(courseTitle);
    setIsDeactivateModalOpen(true);
  };

  const handleCloseDeactivateModal = () => {
    setIsDeactivateModalOpen(false);
    setDeactivatingCourseId('');
    setDeactivatingCourseTitle('');
  };

  const handleTogglePublish = (courseId: string, currentStatus: boolean) => {
    updateCourseMutation.mutate(
      {
        courseId,
        payload: { isPublished: !currentStatus },
      },
      {
        onSuccess: (updatedCourse) => {
          toast.success(
            updatedCourse.isPublished
              ? 'تم نشر المقرر للطلاب بنجاح 🌐'
              : 'تم تحويل المقرر إلى مسودة مغلقة 🔒'
          );
        },
        onError: (err) => {
          toast.error(toArabicErrorMessage(err, 'تعذر تغيير حالة نشر المقرر، يرجى المحاولة مرة أخرى.'));
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <BookOpen size={20} className="text-[#0D8A82]" />
              <span>قائمة المقررات المتاحة</span>
            </h4>
            <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              إجمالي الكورسات: {courses?.length || 0}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-sm flex items-center gap-2"
          >
            <Plus size={16} />
            <span> إضافة كورس جديد</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[180px] text-center space-y-2">
            <Loader2 size={32} className="animate-spin text-[#0D8A82]" />
            <p className="text-xs font-semibold text-slate-500">جاري تحميل المقررات...</p>
          </div>
        ) : isError ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2">
            <AlertTriangle size={32} className="text-red-500 mx-auto" />
            <p className="text-xs font-bold text-slate-800">حدث خطأ أثناء تحميل المقررات</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-1.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : !courses || courses.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
            <BookOpen size={36} className="text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">لا توجد مقررات مضافة حتى الآن</p>
            <p className="text-[11px] text-slate-400">قم بإضافة مقرر جديد بالضغط على زر إضافة كورس جديد أعلاه</p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onTogglePublish={handleTogglePublish}
                onEdit={handleOpenEditModal}
                onDeactivate={handleOpenDeactivateModal}
                isUpdating={
                  updateCourseMutation.isPending &&
                  updateCourseMutation.variables?.courseId === course._id
                }
              />
            ))}
          </div>
        )}
      </div>

      <CreateCourseModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      <EditCourseModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        courseId={editingCourseId}
      />

      <DeactivateCourseModal
        isOpen={isDeactivateModalOpen}
        onClose={handleCloseDeactivateModal}
        courseId={deactivatingCourseId}
        courseTitle={deactivatingCourseTitle}
      />
    </div>
  );
};

export default CourseManager;
