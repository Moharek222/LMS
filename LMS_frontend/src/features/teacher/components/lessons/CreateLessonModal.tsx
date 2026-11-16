import React from 'react';
import { Plus, Loader2, AlertTriangle, FileVideo, X } from 'lucide-react';
import { useCreateLessonLogic } from './hooks/useCreateLessonLogic';
import { CreateLessonVideoField } from './components/CreateLessonVideoField';
import { LessonPdfAttachmentField } from './LessonPdfAttachmentField';

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourseId: string;
  courseTitle?: string;
  courseLabel?: string;
}

export const CreateLessonModal: React.FC<CreateLessonModalProps> = ({
  isOpen,
  onClose,
  selectedCourseId,
  courseTitle,
  courseLabel,
}) => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    order,
    setOrder,
    requiresPassing,
    setRequiresPassing,
    videoFile,
    pdfFile,
    setPdfFile,
    uploadStatusText,
    uploadProgress,
    isUploading,
    validationError,
    setValidationError,
    handleCloseModal,
    handleFileChange,
    handleSubmit,
  } = useCreateLessonLogic({ selectedCourseId, onClose });

  if (!isOpen) return null;

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
        className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative my-8 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Plus size={18} className="text-[#0D8A82]" />
            <span>إضافة درس فيديو جديد</span>
          </h4>
          <button
            type="button"
            disabled={isUploading}
            onClick={handleCloseModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        {courseTitle && (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">إضافة درس للمقرر:</span>
              <span className="text-xs font-extrabold text-slate-800">{courseTitle}</span>
            </div>
            {courseLabel && (
              <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {courseLabel}
              </span>
            )}
          </div>
        )}

        {validationError && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                عنوان الدرس / المحاضرة *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: المحاضرة الأولى: مقدمة الكيمياء العضوية"
                disabled={isUploading}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ترتيب الدرس (Order) *
              </label>
              <input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(Math.max(1, Number(e.target.value) || 1))}
                disabled={isUploading}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] disabled:bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              وصف مختصر للدرس (اختياري)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب نبذة مختصرة عما يتناوله هذا الدرس..."
              disabled={isUploading}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] disabled:bg-slate-50"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-700">يتطلب اجتياز اختبار قبل الانتقال للدرس التالي</span>
            <button
              type="button"
              disabled={isUploading}
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

          {/* Video Attachment Field */}
          <CreateLessonVideoField
            videoFile={videoFile}
            onFileChange={handleFileChange}
            disabled={isUploading}
          />

          {/* PDF Attachment Field */}
          <LessonPdfAttachmentField
            pdfFile={pdfFile}
            onPdfFileChange={setPdfFile}
            onValidationError={setValidationError}
            disabled={isUploading}
            inputId="create-pdf-upload-input"
          />

          {/* Cloud Upload Progress */}
          {isUploading && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#0D8A82]">
                <span>{uploadStatusText}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-teal-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0D8A82] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={isUploading}
              onClick={handleCloseModal}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedCourseId || !videoFile}
              className="px-6 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>جاري معالجة ورفع الدرس...</span>
                </>
              ) : (
                <>
                  <FileVideo size={18} />
                  <span>رفع الفيديو وحفظ الدرس</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLessonModal;
