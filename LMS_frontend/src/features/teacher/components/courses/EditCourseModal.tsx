import React, { useState } from 'react';
import { Edit, Loader2, AlertTriangle, RefreshCw, X, CheckCircle2, Layers } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCourseDetails } from '../../../courses/hooks/useCourseDetails';
import { useUpdateCourse } from '../../hooks/useUpdateCourse';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';
import { getGradeLabel, getGradeBadgeStyle } from '../../../../types/grade';

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
}

export const EditCourseModal: React.FC<EditCourseModalProps> = ({
  isOpen,
  onClose,
  courseId,
}) => {
  const {
    data: courseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useCourseDetails(isOpen ? courseId : undefined);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative my-8 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
              <Edit size={18} />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-800">تعديل المقرر الدراسي</h4>
              <p className="text-[11px] text-slate-500 font-semibold">تعديل عنوان المقرر وحالة النشر</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-2">
            <Loader2 size={32} className="animate-spin text-[#0D8A82]" />
            <p className="text-xs font-semibold text-slate-500">جاري تحميل بيانات المقرر...</p>
          </div>
        ) : isError || !courseData ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
            <AlertTriangle size={28} className="mx-auto text-rose-600" />
            <p className="text-xs font-bold text-slate-800">
              {toArabicErrorMessage(error, 'تعذر تحميل بيانات المقرر للتعديل')}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        ) : (
          <EditCourseForm
            key={courseData._id}
            courseId={courseId}
            initialTitle={courseData.title || ''}
            initialIsPublished={Boolean(courseData.isPublished)}
            grade={courseData.grade}
            academicTrack={courseData.academicTrack}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

const EditCourseForm: React.FC<{
  courseId: string;
  initialTitle: string;
  initialIsPublished: boolean;
  grade?: string;
  academicTrack?: string;
  onClose: () => void;
}> = ({ courseId, initialTitle, initialIsPublished, grade, academicTrack, onClose }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const updateCourseMutation = useUpdateCourse();

  const [title, setTitle] = useState(initialTitle);
  const [isPublished, setIsPublished] = useState(initialIsPublished);
  const [validationError, setValidationError] = useState('');

  const handleCloseModal = () => {
    if (updateCourseMutation.isPending) return;
    onClose();
    setValidationError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId) return;

    if (!title.trim() || title.trim().length < 3) {
      setValidationError('اسم المقرر يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    setValidationError('');

    updateCourseMutation.mutate(
      {
        courseId,
        payload: {
          title: title.trim(),
          isPublished,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['course-details', courseId] });
          toast.success('تم تحديث المقرر بنجاح 🎓✨');
          onClose();
        },
        onError: (err) => {
          const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء تحديث المقرر');
          setValidationError(msg);
          toast.error(msg);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {validationError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {grade && (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-[#0D8A82]" />
              <span className="text-xs font-bold text-slate-700">المرحلة الدراسية:</span>
            </div>
            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${getGradeBadgeStyle(grade).pill}`}>
              {grade === 'second_secondary' && academicTrack
                ? `(تانية ثانوي • ${academicTrack === 'baccalaureate' ? 'بكالوريا' : 'عام'})`
                : getGradeLabel(grade)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
            ملاحظة: المرحلة الدراسية للمقرر محددة عند الإنشاء لضمان عزل وصول الطلاب ولا يمكن تعديلها بعد إسناد الدروس والطلاب.
          </p>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          عنوان المقرر / الكورس *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان المقرر..."
          disabled={updateCourseMutation.isPending}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82]"
        />
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
        <span className="text-xs font-bold text-slate-700">تفعيل النشر للطلاب</span>
        <button
          type="button"
          disabled={updateCourseMutation.isPending}
          onClick={() => setIsPublished(!isPublished)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isPublished ? 'bg-[#0D8A82]' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              isPublished ? 'translate-x-0' : '-translate-x-5'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          disabled={updateCourseMutation.isPending}
          onClick={handleCloseModal}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={updateCourseMutation.isPending}
          className="px-6 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateCourseMutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>جاري الحفظ...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              <span>حفظ التعديلات</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default EditCourseModal;
