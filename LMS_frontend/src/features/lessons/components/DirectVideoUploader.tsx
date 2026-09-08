import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, FileVideo, X } from 'lucide-react';
import { generateUploadUrl, uploadVideoFileToPresignedUrl } from '../api/videoUploadApi';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { useToast } from '../../../context/ToastContext';

interface DirectVideoUploaderProps {
  onVideoUploaded: (fileKeyOrUrl: string) => void;
  currentVideoUrl?: string;
}

export const DirectVideoUploader: React.FC<DirectVideoUploaderProps> = ({
  onVideoUploaded,
  currentVideoUrl = '',
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedKey, setUploadedKey] = useState<string>(currentVideoUrl);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setErrorMsg('نوع الملف غير مدعوم. يرجى اختيار ملف فيديو (MP4, WebM, MOV...).');
      return;
    }

    setSelectedFile(file);
    setErrorMsg(null);
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMsg(null);

    try {
      // Step 1: Generate presigned upload URL from Backend
      const { uploadUrl, fileKey } = await generateUploadUrl(selectedFile.type);

      // Step 2: Upload file directly to Cloud R2/S3 storage with progress tracking
      await uploadVideoFileToPresignedUrl(uploadUrl, selectedFile, (percent) => {
        setUploadProgress(percent);
      });

      // Step 3: Success notification & callback to parent form
      setUploadedKey(fileKey);
      onVideoUploaded(fileKey);
      toast.success('تم رفع فيديو الدرس بنجاح إلى السيرفر السحابي! 🎥');
    } catch (err) {
      const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء رفع الفيديو بالسيرفر السحابي');
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadedKey('');
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-slate-700">
        رفع فيديو الدرس السحابي المباشر 🎥
      </label>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Box / Dropzone */}
      {!selectedFile && !uploadedKey ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-[#0D8A82] bg-slate-50/60 hover:bg-teal-50/30 rounded-2xl p-6 text-center space-y-2 cursor-pointer transition flex flex-col items-center justify-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-white text-[#0D8A82] flex items-center justify-center border border-slate-200 shadow-2xs">
            <UploadCloud size={24} />
          </div>
          <div className="space-y-0.5">
            <h5 className="text-xs font-extrabold text-slate-800">اضغط لاختيار فيديو الدرس من جهازك</h5>
            <p className="text-[11px] text-slate-400 font-semibold">
              يدعم فيديوهات عالية الجودة (MP4, WebM, MOV)
            </p>
          </div>
        </div>
      ) : (
        /* Selected File or Upload Status Card */
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
                <FileVideo size={20} />
              </div>
              <div className="space-y-0.5 max-w-xs overflow-hidden">
                <h5 className="text-xs font-bold text-slate-800 truncate">
                  {selectedFile ? selectedFile.name : uploadedKey}
                </h5>
                {selectedFile && (
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    الحجم: {(selectedFile.size / (1024 * 1024)).toFixed(1)} ميجابايت
                  </span>
                )}
              </div>
            </div>

            {!isUploading && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                title="إلغاء الملف"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <Loader2 size={13} className="animate-spin text-[#0D8A82]" />
                  <span>جاري رفع الفيديو إلى السحاب...</span>
                </span>
                <span className="text-[#0D8A82]">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-[#0D8A82] transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Banner */}
          {uploadedKey && !isUploading && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>تم رفع الملف ورابط الفيديو جاهز للاستخدام في الدرس!</span>
            </div>
          )}

          {/* Action Upload Trigger Button */}
          {selectedFile && !uploadedKey && !isUploading && (
            <button
              type="button"
              onClick={handleStartUpload}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <UploadCloud size={16} />
              <span>بدء الرفع السحابي الآن</span>
            </button>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

export default DirectVideoUploader;
