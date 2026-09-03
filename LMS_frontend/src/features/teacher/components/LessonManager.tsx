import React, { useState } from 'react';
import { UploadCloud, Plus, Loader2, CheckCircle2, AlertTriangle, FileVideo, BookOpen } from 'lucide-react';
import { useTeacherCourses } from '../hooks/useTeacherCourses';
import { useCreateLesson } from '../hooks/useCreateLesson';
import { generateUploadUrl, uploadVideoToR2 } from '../api/teacherApi';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { useToast } from '../../../context/ToastContext';

export const LessonManager: React.FC = () => {
  const toast = useToast();
  const { data: courses, isLoading: isLoadingCourses } = useTeacherCourses();
  const createLessonMutation = useCreateLesson();

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [requiresPassing, setRequiresPassing] = useState(false);

  // File & Upload States
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // UI Error & Success Feedback
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
      // Step 1: Generate R2 Presigned Upload URL
      setUploadStatusText('جاري تجهيز رابط الرفع في السحابة (R2)...');
      const { uploadUrl, fileKey } = await generateUploadUrl(videoFile.type || 'video/mp4');

      // Step 2: Upload Video File Binary to R2
      setUploadStatusText('جاري رفع الفيديو للسحابة...');
      await uploadVideoToR2(uploadUrl, videoFile, (percent) => {
        setUploadProgress(percent);
      });

      // Step 3: Create Lesson record in Backend DB
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
    } catch (err: any) {
      setIsUploading(false);
      setUploadStatusText('');
      const msg = toArabicErrorMessage(err, 'حصلت مشكلة أثناء رفع الفيديو، يرجى المحاولة مرة أخرى.');
      setValidationError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-3xl mx-auto space-y-6">
        <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Plus size={18} className="text-blue-600" />
          <span>إضافة درس فيديو جديد</span>
        </h4>

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
          {/* Select Course */}
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

          {/* Lesson Title & Order */}
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

          {/* Description */}
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

          {/* Requires Passing Toggle */}
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

          {/* Video Upload Field */}
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

          {/* Upload Progress Bar */}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || !selectedCourseId || !videoFile}
            className="w-full py-3.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
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
        </form>
      </div>
    </div>
  );
};

export default LessonManager;
