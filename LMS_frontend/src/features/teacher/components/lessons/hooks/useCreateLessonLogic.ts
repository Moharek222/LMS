import { useState } from 'react';
import { useCreateLesson } from '../../../hooks/useCreateLesson';
import {
  generateUploadUrl,
  uploadVideoToR2,
  generatePdfUploadUrl,
  uploadPdfToR2,
} from '../../../api/teacherApi';
import { toArabicErrorMessage } from '../../../../../utils/errorMessage';
import { useToast } from '../../../../../context/ToastContext';

interface UseCreateLessonLogicParams {
  selectedCourseId: string;
  onClose: () => void;
}

export const useCreateLessonLogic = ({
  selectedCourseId,
  onClose,
}: UseCreateLessonLogicParams) => {
  const toast = useToast();
  const createLessonMutation = useCreateLesson();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [requiresPassing, setRequiresPassing] = useState(false);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [validationError, setValidationError] = useState('');

  const handleCloseModal = () => {
    if (isUploading) return;
    onClose();
    setValidationError('');
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
    setIsUploading(true);
    setUploadProgress(0);

    try {
      setUploadStatusText('جاري تجهيز رابط رفع الفيديو في السحابة (R2)...');
      const { uploadUrl, fileKey } = await generateUploadUrl(videoFile.type || 'video/mp4');

      setUploadStatusText('جاري رفع الفيديو للسحابة...');
      await uploadVideoToR2(uploadUrl, videoFile, (percent) => {
        setUploadProgress(percent);
      });

      let uploadedPdfKey: string | undefined = undefined;
      if (pdfFile) {
        setUploadStatusText('جاري تجهيز رابط رفع مذكرة الـ PDF...');
        const pdfRes = await generatePdfUploadUrl();
        setUploadStatusText('جاري رفع مذكرة الـ PDF للسحابة...');
        await uploadPdfToR2(pdfRes.uploadUrl, pdfFile);
        uploadedPdfKey = pdfRes.pdfKey;
      }

      setUploadStatusText('جاري حفظ الدرس في قاعدة البيانات...');
      createLessonMutation.mutate(
        {
          courseId: selectedCourseId,
          payload: {
            title: title.trim(),
            description: description.trim() || undefined,
            contentUrl: fileKey,
            pdfKey: uploadedPdfKey,
            order: Number(order) || 1,
            requiresPassing,
          },
        },
        {
          onSuccess: () => {
            setTitle('');
            setDescription('');
            setVideoFile(null);
            setPdfFile(null);
            setOrder((prev) => prev + 1);
            onClose();
            toast.success('تم رفع الفيديو ومذكرة الدرس بنجاح 🎬✨');
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

  return {
    title,
    setTitle,
    description,
    setDescription,
    order,
    setOrder,
    requiresPassing,
    setRequiresPassing,
    videoFile,
    setVideoFile,
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
  };
};

export default useCreateLessonLogic;

