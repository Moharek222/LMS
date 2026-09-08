import React, { useState } from 'react';
import { UploadCloud, Plus, Loader2, CheckCircle2, AlertTriangle, FileVideo, X } from 'lucide-react';
import { useCreateLesson } from '../../hooks/useCreateLesson';
import { generateUploadUrl, uploadVideoToR2 } from '../../api/teacherApi';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourseId: string;
}

export const CreateLessonModal: React.FC<CreateLessonModalProps> = ({
  isOpen,
  onClose,
  selectedCourseId,
}) => {
  const toast = useToast();
  const createLessonMutation = useCreateLesson();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [requiresPassing, setRequiresPassing] = useState(false);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleCloseModal = () => {
    if (isUploading) return;
    onClose();
    setValidationError('');
    setSuccessMessage('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('video/')) {
        setValidationError('يرجى اختيار ملف فيديو بحجم صالح (MP4, WebM, Mov)');
        return;
      }
      setVideoFile(file);
      setValidationError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourseId) {
      setValidationError('يرجى اختيار الكورس أولاً');
      return;
    }
    if (!title.trim() || title.trim().length < 3) {
      setValidationError('عنوان الدرس يجب أن يكون 3 أحرف على الأقل');
      return;
    }
    if (!videoFile) {
      setValidationError('يرجى اختيار ملف فيديو للرفع');
      return;
    }

    setValidationError('');
    setSuccessMessage('');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      setUploadStatusText('جاري تجهيز رابط الرفع في السحابة (R2)...');
      const { uploadUrl, fileKey } = await generateUploadUrl(videoFile.type || 'video/mp4');

      setUploadStatusText('جاري رفع الفيديو للسحابة...');
      await uploadVideoToR2(uploadUrl, videoFile, (percent) => {
        setUploadProgress(percent);
      });

      setUploadStatusText('جاري حفظ الدرس في قاعدة البيانات...');
      createLessonMutation.mutate(
        {
          courseId: selectedCourseId,
          payload: {
            title: title.trim(),
            description: description.trim() || undefined,
            contentUrl: fileKey,
            order: Number(order) || 1,
            requiresPassing,
          },
        },
        {
          onSuccess: () => {
            setTitle('');
            setDescription('');
            setVideoFile(null);
            setOrder((prev) => prev + 1);
            onClose();
            toast.success('تم رفع الفيديو وإنشاء الدرس بنجاح 🎬✨');
          },
          onError: (err) => {
            const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء حفظ الدرس في قاعدة البيانات');
            setValidationError(msg);
            toast.error(msg);
          },
          onSettled: () => {
            setIsUploading(false);
            setUploadStatusText('');
            setUploadProgress(0);
          },
        }
      );
    } catch (err: unknown) {
      setIsUploading(false);
      setUploadStatusText('');
      const msg = toArabicErrorMessage(err, 'حصلت مشكلة أثناء رفع الفيديو، يرجى المحاولة مرة أخرى.');
      setValidationError(msg);
      toast.error(msg);
    }
  };

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
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Plus size={18} className="text-blue-600" />
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

        {validationError && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-bold flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMessage}</span>
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
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
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
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
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-700">يتطلب اجتياز اختبار قبل الانتقال للدرس التالي</span>
            <button
              type="button"
              onClick={() => setRequiresPassing(!requiresPassing)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                requiresPassing ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  requiresPassing ? 'translate-x-0' : '-translate-x-5'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ملف الفيديو (MP4, WebM) *
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-blue-400 transition bg-slate-50/50">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                id="video-upload-input"
                className="hidden"
              />
              <label htmlFor="video-upload-input" className="cursor-pointer space-y-2 block">
                <UploadCloud size={36} className="text-blue-500 mx-auto" />
                {videoFile ? (
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-blue-600 block">
                      {videoFile.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium block">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} ميجابايت
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">
                      اضغط هنا لاختيار ملف الفيديو من جهازك
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium block mt-1">
                      يدعم صيغ الفيديو المختلفة ليتم رفعه مباشرة إلى Cloudflare R2
                    </span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {isUploading && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <span>{uploadStatusText}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

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
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
