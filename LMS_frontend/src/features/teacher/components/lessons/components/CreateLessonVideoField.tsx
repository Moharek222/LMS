import React from 'react';
import { UploadCloud } from 'lucide-react';

interface CreateLessonVideoFieldProps {
  videoFile: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const CreateLessonVideoField: React.FC<CreateLessonVideoFieldProps> = ({
  videoFile,
  onFileChange,
  disabled = false,
}) => {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1.5">
        ملف الفيديو (MP4, WebM) *
      </label>
      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-teal-400 transition bg-slate-50/50">
        <input
          type="file"
          accept="video/*"
          onChange={onFileChange}
          disabled={disabled}
          id="video-upload-input"
          className="hidden"
        />
        <label htmlFor="video-upload-input" className="cursor-pointer space-y-2 block">
          <UploadCloud size={36} className="text-[#0D8A82] mx-auto" />
          {videoFile ? (
            <div className="space-y-1">
              <span className="text-xs font-extrabold text-[#0D8A82] block">
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
                يدعم صيغ الفيديو المختلفة ليتم رفعه مباشرة إلى السحابة (Cloudflare R2)
              </span>
            </div>
          )}
        </label>
      </div>
    </div>
  );
};

export default CreateLessonVideoField;

