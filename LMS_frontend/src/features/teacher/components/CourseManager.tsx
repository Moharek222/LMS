import React, { useState } from 'react';
import { BookOpen, Plus, Loader2, CheckCircle2, AlertTriangle, Globe, Lock } from 'lucide-react';
import { useTeacherCourses } from '../hooks/useTeacherCourses';
import { useCreateCourse } from '../hooks/useCreateCourse';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { useToast } from '../../../context/ToastContext';

export const CourseManager: React.FC = () => {
  const toast = useToast();
  const { data: courses, isLoading, isError, refetch } = useTeacherCourses();
  const createCourseMutation = useCreateCourse();

  const [title, setTitle] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 3) {
      setValidationError('اسم المقرر يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    setValidationError('');
    setSuccessMessage('');

    createCourseMutation.mutate(
      {
        title: title.trim(),
        isPublished,
      },
      {
        onSuccess: () => {
          setTitle('');
          toast.success('تم إنشاء المقرر الدراسي بنجاح ✨');
        },
        onError: (err) => {
          toast.error(toArabicErrorMessage(err, 'تعذر إنشاء المقرر، يرجى إعادة المحاولة.'));
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Course Form Card */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Plus size={18} className="text-[#0D8A82]" />
            <span>إضافة مقرر جديد</span>
          </h4>

          {validationError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {createCourseMutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{toArabicErrorMessage(createCourseMutation.error, 'حصلت مشكلة أثناء إنشاء الكورس، حاول مرة تانية.')}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                عنوان المقرر / الكورس *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: الكيمياء العضوية - الصف الثالث"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82]"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700">تفعيل النشر للطلاب</span>
              <button
                type="button"
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

            <button
              type="submit"
              disabled={createCourseMutation.isPending}
              className="w-full py-3 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {createCourseMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري الإنشاء...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>حفظ المقرر</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing Courses List Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-extrabold text-slate-800">قائمة المقررات المتاحة</h4>
            <span className="text-xs text-slate-500 font-semibold">
              إجمالي الكورسات: {courses?.length || 0}
            </span>
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
              <p className="text-[11px] text-slate-400">قم بإضافة مقرر جديد من النموذج الجانبي</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#0D8A82] flex items-center justify-center font-bold text-xs shrink-0">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-800">{course.title}</h5>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                        معرف المقرر: {course._id}
                      </span>
                    </div>
                  </div>

                  <div>
                    {course.isPublished ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <Globe size={12} />
                        <span>منشور للطلاب</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 border border-slate-300 text-[10px] font-bold">
                        <Lock size={12} />
                        <span>مسودة مغلقة</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseManager;
