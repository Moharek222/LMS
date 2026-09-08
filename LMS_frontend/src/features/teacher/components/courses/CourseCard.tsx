import React from 'react';
import { BookOpen, Globe, Lock, Loader2, Edit, XCircle } from 'lucide-react';
import type { Course } from '../../../courses/types/course';

interface CourseCardProps {
  course: Course;
  onTogglePublish: (courseId: string, currentStatus: boolean) => void;
  isUpdating: boolean;
  onEdit: (courseId: string) => void;
  onDeactivate: (courseId: string, courseTitle: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onTogglePublish,
  isUpdating,
  onEdit,
  onDeactivate,
}) => {
  const isCourseActive = course.isActive !== false;

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#0D8A82] flex items-center justify-center font-bold text-xs shrink-0">
          <BookOpen size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-bold text-slate-800">{course.title}</h5>
            {!isCourseActive && (
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                متوقف
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
            معرف المقرر: {course._id}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => onEdit(course._id)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 text-[#0D8A82] hover:bg-teal-100 border border-teal-100 text-xs font-bold transition cursor-pointer"
        >
          <Edit size={13} />
          <span>تعديل</span>
        </button>

        {isCourseActive ? (
          <button
            type="button"
            onClick={() => onDeactivate(course._id, course.title)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 text-xs font-bold transition cursor-pointer"
          >
            <XCircle size={13} />
            <span>إيقاف الكورس</span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed opacity-75"
          >
            الكورس متوقف
          </button>
        )}

        <button
          type="button"
          disabled={isUpdating}
          onClick={() => onTogglePublish(course._id, !!course.isPublished)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            course.isPublished
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
          title={course.isPublished ? 'إلغاء النشر وتحويل لمسودة' : 'نشر المقرر للطلاب'}
        >
          {isUpdating ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span>جاري التحديث...</span>
            </>
          ) : course.isPublished ? (
            <>
              <Globe size={13} />
              <span>منشور</span>
            </>
          ) : (
            <>
              <Lock size={13} />
              <span>مسودة</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
