import React, { useState } from 'react';
import { Video, Edit, Trash2, FileText, Loader2 } from 'lucide-react';
import type { Lesson } from '../../../lessons/types/lesson';
import { getLessonPdfPreview } from '../../api/teacherApi';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';

interface LessonCardProps {
  lesson: Lesson;
  onEdit?: (lesson: Lesson) => void;
  onDelete?: (lesson: Lesson) => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, onEdit, onDelete }) => {
  const toast = useToast();
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const hasPdf = Boolean(lesson.hasPdf || lesson.pdfKey);

  const handlePreviewPdf = async () => {
    setIsLoadingPdf(true);
    try {
      const res = await getLessonPdfPreview(lesson._id);
      if (res?.pdfPreviewUrl) {
        window.open(res.pdfPreviewUrl, '_blank', 'noopener,noreferrer');
        toast.success('جاري فتح مذكرة الدرس (PDF) 📄');
      } else {
        toast.error('رابط مذكرة الـ PDF غير متوفر');
      }
    } catch (err) {
      toast.error(toArabicErrorMessage(err, 'تعذر فتح مذكرة الدرس'));
    } finally {
      setIsLoadingPdf(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-teal-100 text-[#0D8A82] font-black text-xs flex items-center justify-center shrink-0 border border-teal-200">
          {lesson.order}
        </div>
        <div className="space-y-1 text-right">
          <div className="flex items-center gap-2 flex-wrap">
            <h5 className="text-xs font-extrabold text-slate-800">{lesson.title}</h5>
            {lesson.requiresPassing && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                يتطلب اجتياز اختبار
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 flex items-center gap-1">
              <Video size={10} />
              <span>فيديو مرفوع</span>
            </span>
            {hasPdf && (
              <button
                type="button"
                onClick={handlePreviewPdf}
                disabled={isLoadingPdf}
                className="px-2 py-0.5 rounded-md bg-teal-50 text-[#0D8A82] hover:bg-teal-100 text-[10px] font-bold border border-teal-200 flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                title="معاينة مذكرة الـ PDF"
              >
                {isLoadingPdf ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : (
                  <FileText size={10} />
                )}
                <span>مذكرة PDF 📄</span>
              </button>
            )}
          </div>
          {lesson.description && (
            <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
              {lesson.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(lesson)}
            className="p-2 rounded-xl text-slate-500 hover:text-[#0D8A82] hover:bg-slate-100 transition cursor-pointer border border-slate-200/60"
            title="تعديل الدرس"
          >
            <Edit size={16} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(lesson)}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer border border-slate-200/60"
            title="حذف الدرس"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonCard;


