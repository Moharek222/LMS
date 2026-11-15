import React from 'react';
import {
  QrCode,
  X,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useQrAttendanceScanner } from './hooks/useQrAttendanceScanner';
import { QrScannerViewport } from './components/QrScannerViewport';
import { QrSessionLog } from './components/QrSessionLog';

interface QrAttendanceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName?: string;
}

export const QrAttendanceScannerModal: React.FC<QrAttendanceScannerModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
}) => {
  const {
    cameraError,
    setCameraError,
    soundEnabled,
    setSoundEnabled,
    lastScannedId,
    errorMsg,
    sessionLog,
    isScanningFile,
    getStudentName,
    handleQrImageFileUpload,
  } = useQrAttendanceScanner({ isOpen, groupId });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100">
              <QrCode size={24} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">ماسح الـ QR Code للحضور 📷</h3>
              {groupName && <p className="text-xs text-slate-500 font-semibold mt-0.5">المجموعة: {groupName}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
            >
              {soundEnabled ? <Volume2 size={18} className="text-[#0D8A82]" /> : <VolumeX size={18} />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              aria-label="إغلاق"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Camera Viewport & File Upload */}
        <QrScannerViewport
          cameraError={cameraError}
          onRetryCamera={() => setCameraError(null)}
          isScanningFile={isScanningFile}
          onQrImageFileUpload={handleQrImageFileUpload}
        />

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2 shrink-0">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {lastScannedId && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2.5 shadow-2xs shrink-0 animate-in fade-in">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <div className="space-y-0.5">
              <span>تم تسجيل حضور الطالب بنجاح! 🎉</span>
              <span className="block text-xs font-extrabold text-emerald-800">
                {getStudentName(lastScannedId)
                  ? `الطالب: ${getStudentName(lastScannedId)}`
                  : `ID: ${lastScannedId}`}
              </span>
            </div>
          </div>
        )}

        {/* Session Log */}
        <QrSessionLog sessionLog={sessionLog} getStudentName={getStudentName} />

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrAttendanceScannerModal;
