import React from 'react';
import { FileText, Trash2 } from 'lucide-react';

interface LessonPdfAttachmentFieldProps {
  pdfFile: File | null;
  onPdfFileChange: (file: File | null) => void;
  onValidationError: (msg: string) => void;
  hasExistingPdf?: boolean;
  disabled?: boolean;
  inputId?: string;
}

export const LessonPdfAttachmentField: React.FC<LessonPdfAttachmentFieldProps> = ({
  pdfFile,
  onPdfFileChange,
  onValidationError,
  hasExistingPdf = false,
  disabled = false,
  inputId = 'pdf-upload-input',
}) => {
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        onValidationError('يرجى اختيار ملف PDF صالح');
        return;
      }
      if (file.size > 35 * 1024 * 1024) {
        onValidationError('حجم ملف الـ PDF يجب ألا يتجاوز 35 ميجابايت');
        return;
      }
      onPdfFileChange(file);
      onValidationError('');
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
        <span>مذكرة أو ملخص الدرس (PDF)</span>
        {hasExistingPdf && !pdfFile ? (
          <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
            يحتوي على مذكرة PDF حالياً ✓
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 font-normal">اختياري</span>
        )}
      </label>

      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-teal-400 transition bg-slate-50/50">
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileInput}
          id={inputId}
          className="hidden"
          disabled={disabled}
        />

        {pdfFile ? (
          <div className="flex items-center justify-between p-2.5 bg-teal-50 border border-teal-200 rounded-xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-[#0D8A82] flex items-center justify-center shrink-0">
                <FileText size={18} />
              </div>
              <div className="text-right truncate">
                <span className="text-xs font-bold text-slate-800 block truncate">{pdfFile.name}</span>
                <span className="text-[10px] text-slate-400 font-semibold block">
                  {(pdfFile.size / (1024 * 1024)).toFixed(2)} ميجابايت
                  {hasExistingPdf ? ' (سيتم استبدال الملف السابق)' : ''}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onPdfFileChange(null)}
              disabled={disabled}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
              title="حذف الملف"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <label htmlFor={inputId} className="cursor-pointer space-y-1 block py-2">
            <FileText size={28} className="text-teal-600 mx-auto" />
            <span className="text-xs font-bold text-slate-700 block">
              {hasExistingPdf
                ? 'اضغط هنا لاستبدال مذكرة الـ PDF الحالية بملف جديد'
                : 'اضغط هنا لإرفاق مذكرة أو ملخص بصيغة PDF'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              سيتم رفعها مباشرة لسحابة Cloudflare R2 وإتاحتها للطلاب المشتركين
            </span>
          </label>
        )}
      </div>
    </div>
  );
};

