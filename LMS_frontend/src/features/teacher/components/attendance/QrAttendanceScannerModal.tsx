import React, { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  QrCode,
  X,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  Clock,
  UploadCloud,
} from 'lucide-react';
import { useRecordStudentAttendance } from '../../../attendance/hooks/useStudentAttendance';
import { useGroupStudents } from '../../hooks/useGroupStudents';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';
import {
  playAttendanceBeep,
  extractStudentIdFromQr,
  isValidMongoId,
  decodeQrFromImageFile,
} from '../../utils/qrAttendanceUtils';

interface QrAttendanceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName?: string;
}

interface ScannedItemLog {
  id: string;
  studentId: string;
  studentName?: string;
  timestamp: string;
}

export const QrAttendanceScannerModal: React.FC<QrAttendanceScannerModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
}) => {
  const toast = useToast();
  const recordAttendanceMutation = useRecordStudentAttendance();
  const { data: students = [] } = useGroupStudents(groupId);

  const getStudentName = (id: string): string | null => {
    const student = students.find((s) => s._id === id);
    return student?.name || null;
  };

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sessionLog, setSessionLog] = useState<ScannedItemLog[]>([]);
  const [isScanningFile, setIsScanningFile] = useState(false);

  const cooldownRef = useRef<boolean>(false);

  const processAttendance = (rawId: string) => {
    const studentId = extractStudentIdFromQr(rawId);
    if (!studentId || recordAttendanceMutation.isPending || cooldownRef.current) return;

    setErrorMsg(null);

    if (!isValidMongoId(studentId)) {
      playAttendanceBeep(soundEnabled);
      const msg = 'رمز الـ QR غير مجسد بشكل صحيح لحساب الطالب.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    cooldownRef.current = true;

    recordAttendanceMutation.mutate(
      { groupId, studentId },
      {
        onSuccess: () => {
          playAttendanceBeep(soundEnabled);
          setLastScannedId(studentId);
          const sName = getStudentName(studentId);
          const displayName = sName ? `(${sName})` : '';
          toast.success(`تم تسجيل حضور الطالب ${displayName} بنجاح! 🎉`);

          const nowTime = new Date().toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          setSessionLog((prev) => [
            {
              id: Math.random().toString(),
              studentId,
              studentName: sName || undefined,
              timestamp: nowTime,
            },
            ...prev,
          ]);

          setTimeout(() => {
            cooldownRef.current = false;
            setLastScannedId(null);
          }, 3000);
        },
        onError: (err) => {
          playAttendanceBeep(soundEnabled);
          const msg = toArabicErrorMessage(err, 'فشل تسجيل حضور الطالب بالكود الممسوح');
          setErrorMsg(msg);
          toast.error(msg);
          setTimeout(() => {
            cooldownRef.current = false;
          }, 2000);
        },
      }
    );
  };

  const processAttendanceRef = useRef(processAttendance);
  useEffect(() => {
    processAttendanceRef.current = processAttendance;
  });

  const handleQrImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP)');
      return;
    }

    setIsScanningFile(true);
    setErrorMsg(null);

    try {
      const decodedText = await decodeQrFromImageFile(file);

      if (decodedText) {
        processAttendance(decodedText);
      } else {
        const msg = 'لم يتم التمكن من قراءة رمز الـ QR من الصورة المختارة. يرجى التأكد من اختيار صورة واضحة لرمز QR الطالب.';
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch {
      const msg = 'تعذر قراءة رمز QR من الصورة المختارة. تأكد أن الصورة واضحة وتحتوي على رمز QR الطالب.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsScanningFile(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    let scanner: Html5QrcodeScanner | null = null;

    const timer = setTimeout(() => {
      try {
        const element = document.getElementById('qr-reader-video-box');
        if (!element) return;

        scanner = new Html5QrcodeScanner(
          'qr-reader-video-box',
          {
            fps: 15,
            qrbox: { width: 220, height: 220 },
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            rememberLastUsedCamera: true,
            showTorchButtonIfSupported: true,
          },
          false
        );

        scanner.render(
          (decodedText) => {
            if (decodedText) {
              processAttendanceRef.current(decodedText);
            }
          },
          () => {}
        );
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'تعذر بدء ماسح الـ QR الضوئي';
        setCameraError(errMsg);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (scanner) {
        try {
          scanner.clear().catch(() => {});
        } catch {
          // Ignore scanner clear errors
        }
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
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

      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
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

        <div className="space-y-4 flex-1 overflow-y-auto">
          <div className="relative rounded-2xl bg-slate-950 p-2 border-2 border-slate-800 flex flex-col items-center justify-center min-h-72 overflow-hidden">
            {cameraError ? (
              <div className="flex flex-col items-center justify-center space-y-3 text-center p-6 bg-slate-900 w-full h-64 rounded-xl">
                <AlertCircle size={32} className="text-rose-500" />
                <p className="text-xs font-bold text-slate-300 max-w-xs">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => setCameraError(null)}
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
              onChange={handleQrImageFileUpload}
              className="hidden"
            />
          </div>

          <p className="text-xs text-slate-500 font-semibold text-center leading-relaxed">
            قم بوضع كارت الطالب الفيزيائي أمام الكاميرا لتسجيل الحضور تلقائياً، أو اختر صورة الـ QR المخزنة على جهازك.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2 shrink-0">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

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

        {sessionLog.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#0D8A82]" />
                <span>سجل الحضور للجلسة الحالية</span>
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-teal-50 text-[#0D8A82] text-[11px]">
                {sessionLog.length} طالب
              </span>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {sessionLog.map((item) => {
                const sName = item.studentName || getStudentName(item.studentId);
                return (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 font-extrabold text-slate-800">
                      <Sparkles size={14} className="text-[#0D8A82] shrink-0" />
                      <span>{sName || `طالب (ID: ${item.studentId.slice(-6)})`}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-semibold dir-ltr">{item.timestamp}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
