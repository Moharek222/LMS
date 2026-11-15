import React from 'react';
import { AlertCircle, RefreshCw, UploadCloud } from 'lucide-react';

interface QrScannerViewportProps {
  cameraError: string | null;
  onRetryCamera: () => void;
  isScanningFile: boolean;
  onQrImageFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const QrScannerViewport: React.FC<QrScannerViewportProps> = ({
  cameraError,
  onRetryCamera,
  isScanningFile,
  onQrImageFileUpload,
}) => {
  return (
    <div className="space-y-4 flex-1 overflow-y-auto">
      {/* Overriding html5-qrcode injected DOM styles */}
      <style>{`
        #qr-reader-video-box {
          border: none !important;
          width: 100% !important;
        }
        #qr-reader-video-box video {
          border-radius: 1rem !important;
          object-fit: cover !important;
        }
        #qr-reader-video-box__scan_region {
          border-radius: 1rem !important;
          background: transparent !important;
        }
        #qr-reader-video-box__dashboard {
          padding: 8px !important;
          background: transparent !important;
        }
        #qr-reader-video-box__dashboard_control button,
        #qr-reader-video-box button {
          background-color: #0D8A82 !important;
          color: white !important;
          border-radius: 0.75rem !important;
          padding: 6px 14px !important;
          font-size: 12px !important;
          font-weight: bold !important;
          border: none !important;
          cursor: pointer !important;
          margin: 4px !important;
        }
        #qr-reader-video-box a {
          display: none !important;
        }
      `}</style>

      {/* Camera Viewport or Error Fallback */}
      <div className="relative rounded-2xl bg-slate-950 p-2 border-2 border-slate-800 flex flex-col items-center justify-center min-h-72 overflow-hidden">
        {cameraError ? (
          <div className="flex flex-col items-center justify-center space-y-3 text-center p-6 bg-slate-900 w-full h-64 rounded-xl">
            <AlertCircle size={32} className="text-rose-500" />
            <p className="text-xs font-bold text-slate-300 max-w-xs">{cameraError}</p>
            <button
              type="button"
              onClick={onRetryCamera}
              className="px-4 py-2 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw size={14} />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        ) : (
          <div className="w-full rounded-xl overflow-hidden relative">
            <div id="qr-reader-video-box" className="w-full rounded-xl overflow-hidden" />
          </div>
        )}
      </div>

      {/* Alternative File Upload */}
      <div className="flex flex-col items-center justify-center gap-2">
        <label
          htmlFor="qr-file-upload-input"
          className={`w-full py-3 px-4 rounded-2xl border-2 border-dashed border-[#0D8A82]/40 bg-teal-50/40 hover:bg-teal-50 hover:border-[#0D8A82] transition cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-[#0D8A82] shadow-2xs ${
            isScanningFile ? 'opacity-60 pointer-events-none' : ''
          }`}
        >
          <UploadCloud size={18} className="shrink-0 text-[#0D8A82]" />
          <span>
            {isScanningFile ? 'جاري فحص الصورة...' : 'رفع صورة الـ QR من الجهاز 🖼️'}
          </span>
        </label>
        <input
          id="qr-file-upload-input"
          type="file"
          accept="image/*"
          onChange={onQrImageFileUpload}
          className="hidden"
        />
      </div>

      <p className="text-xs text-slate-500 font-semibold text-center leading-relaxed">
        قم بوضع كارت الطالب الفيزيائي أمام الكاميرا لتسجيل الحضور تلقائياً، أو اختر صورة الـ QR المخزنة على جهازك.
      </p>
    </div>
  );
};

export default QrScannerViewport;

