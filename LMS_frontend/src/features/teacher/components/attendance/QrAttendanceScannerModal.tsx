import React, { useState } from 'react';
import { QrCode, X, CheckCircle2, AlertCircle, Loader2, Camera, UserCheck } from 'lucide-react';
import { useRecordStudentAttendance } from '../../../attendance/hooks/useStudentAttendance';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';

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
  const [scannedCode, setScannedCode] = useState('');
  const [lastRecordedStudent, setLastRecordedStudent] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recordAttendanceMutation = useRecordStudentAttendance();

  if (!isOpen) return null;

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCode.trim()) return;

    setErrorMsg(null);
    const studentId = scannedCode.trim();

    recordAttendanceMutation.mutate(
      { groupId, studentId },
      {
        onSuccess: () => {
          setLastRecordedStudent(studentId);
          setScannedCode('');
          setTimeout(() => setLastRecordedStudent(null), 4000);
        },
        onError: (err) => {
          const msg = toArabicErrorMessage(err, 'فشل تسجيل حضور الطالب بالكود الممسوح');
          setErrorMsg(msg);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100">
              <QrCode size={24} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">ماسح الـ QR لحضور الطلاب 📷</h3>
              {groupName && <p className="text-xs text-slate-500 font-semibold mt-0.5">المجموعة: {groupName}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Camera Visualizer / Simulation */}
        <div className="relative rounded-2xl bg-slate-950 p-6 border border-slate-800 flex flex-col items-center justify-center space-y-3 text-center overflow-hidden">
          <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-[#0D8A82] flex flex-col items-center justify-center space-y-2 relative bg-slate-900/60">
            <div className="absolute inset-0 bg-[#0D8A82]/10 animate-pulse rounded-2xl" />
            <Camera size={36} className="text-[#0D8A82] animate-bounce" />
            <span className="text-[11px] font-bold text-teal-400 z-10">وجه الكاميرا أو قارئ الـ QR</span>
          </div>

          <p className="text-xs text-slate-400 font-semibold max-w-xs">
            قم بتمرير بطاقة الطالب الرقمية أو الـ QR Code أمام قارئ الأكواد لتسجيل الحضور فوراً.
          </p>
        </div>

        {/* Manual Input / Barcode Scanner Field */}
        <form onSubmit={handleScanSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              كود الطالب (ID / QR Code String)
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                placeholder="امسح الـ QR أو ادخل كود الطالب..."
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition"
              />
              <QrCode size={18} className="absolute right-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {lastRecordedStudent && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>تم تسجيل حضور الطالب بنجاح! ({lastRecordedStudent})</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={recordAttendanceMutation.isPending || !scannedCode.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-[#0D8A82] text-white font-bold text-xs hover:bg-teal-700 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {recordAttendanceMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري تسجيل الحضور...</span>
                </>
              ) : (
                <>
                  <UserCheck size={16} />
                  <span>تسجيل الحضور الآن</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QrAttendanceScannerModal;
