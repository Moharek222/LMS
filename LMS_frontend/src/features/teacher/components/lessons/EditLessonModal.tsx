import React, { useState, useEffect } from 'react';
import { Edit, Loader2, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import type { Lesson } from '../../../lessons/types/lesson';
import { useUpdateLesson } from '../../../lessons/hooks/useUpdateLesson';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';
import { DirectVideoUploader } from '../../../lessons/components/DirectVideoUploader';

interface EditLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  courseId: string;
}

export const EditLessonModal: React.FC<EditLessonModalProps> = ({
  isOpen,
  onClose,
  lesson,
  courseId,
}) => {
  const toast = useToast();
  const updateLessonMutation = useUpdateLesson(courseId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number | string>(1);
  const [requiresPassing, setRequiresPassing] = useState(false);
  const [contentUrl, setContentUrl] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (lesson && isOpen) {
      setTitle(lesson.title || '');
      setDescription(lesson.description || '');
      setOrder(lesson.order ?? 1);
      setRequiresPassing(Boolean(lesson.requiresPassing));
      setContentUrl(lesson.contentUrl || '');
      setValidationError('');
    }
  }, [lesson, isOpen]);

  const handleCloseModal = () => {
    if (updateLessonMutation.isPending) return;
    onClose();
    setValidationError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!lesson || !courseId) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle.length < 3) {
      setValidationError('عنوان الدرس يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription && trimmedDescription.length < 3) {
      setValidationError('الوصف يجب أن يكون 3 أحرف على الأقل عند إدخاله');
      return;
    }

    const parsedOrder = Number(order);
    if (isNaN(parsedOrder) || parsedOrder < 1) {
      setValidationError('ترتيب الدرس يجب أن يكون رقماً صحيحاً موجباً');
      return;
    }

    setValidationError('');

    updateLessonMutation.mutate(
      {
        lessonId: lesson._id,
        payload: {
          title: trimmedTitle,
          description: trimmedDescription || undefined,
          contentUrl: contentUrl || undefined,
          order: parsedOrder,
          requiresPassing,
        },
      },
      {
        onSuccess: () => {
          toast.success('تم تعديل الدرس بنجاح 🎓');
          onClose();
        },
        onError: (err) => {
          const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء تعديل الدرس');
          setValidationError(msg);
          toast.error(msg);
        },
      }
    );
  };

  if (!isOpen || !lesson) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCloseModal();
        }
      }}
    >
      <div
        className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative my-8 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
              <Edit size={18} />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-800">تعديل بيانات الدرس</h4>
              <p className="text-[11px] text-slate-500 font-semibold">تعديل العنوان والترتيب ومتطلبات الإجتياز</p>
            </div>
          </div>
          <button
            type="button"
            disabled={updateLessonMutation.isPending}
            onClick={handleCloseModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              عنوان الدرس *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: مقدمة في البرمجة..."
              disabled={updateLessonMutation.isPending}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82]"
            />
          </div>

          {/* Order */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ترتيب الدرس *
            </label>
            <input
              type="number"
              min="1"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              disabled={updateLessonMutation.isPending}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              وصف الدرس (اختياري)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف مختصر لمحتوى الدرس..."
              disabled={updateLessonMutation.isPending}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] resize-none"
            />
          </div>

          {/* Direct Cloud Video Uploader */}
          <DirectVideoUploader
            currentVideoUrl={contentUrl}
            onVideoUploaded={(key: string) => setContentUrl(key)}
          />

          {/* Requires Passing Checkbox/Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-700">يتطلب اجتياز الاختبار للانتقال للدرس التالي</span>
            <button
              type="button"
              disabled={updateLessonMutation.isPending}
              onClick={() => setRequiresPassing(!requiresPassing)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                requiresPassing ? 'bg-[#0D8A82]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  requiresPassing ? 'translate-x-0' : '-translate-x-5'
                }`}
              />
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={updateLessonMutation.isPending}
              onClick={handleCloseModal}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={updateLessonMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateLessonMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري حفظ التعديلات...</span>
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
      </div>
    </div>
  );
};

export default EditLessonModal;
