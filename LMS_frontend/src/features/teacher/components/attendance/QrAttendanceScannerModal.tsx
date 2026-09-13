import React, { useState, useRef } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  QrCode,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  UserCheck,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  Clock,
  Keyboard,
} from 'lucide-react';
import { useRecordStudentAttendance } from '../../../attendance/hooks/useStudentAttendance';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';

interface QrAttendanceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName?: string;
}

interface ScannedItemLog {
  id: string;
  studentId: string;
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

  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [scannedInput, setScannedInput] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sessionLog, setSessionLog] = useState<ScannedItemLog[]>([]);

  const cooldownRef = useRef<boolean>(false);

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      // Ignore audio errors
    }
  };

  const extractStudentId = (raw: string): string => {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object' && parsed.studentId) {
        return String(parsed.studentId);
      }
    } catch {
      // Not JSON, fallback to raw string
    }
    return trimmed;
  };

  const isMongoId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

  const processAttendance = (rawId: string) => {
    const studentId = extractStudentId(rawId);
    if (!studentId || recordAttendanceMutation.isPending || cooldownRef.current) return;

    setErrorMsg(null);

    if (!isMongoId(studentId)) {
      playBeep();
      const msg =
        'معرف الطالب غير صحيح. يرجى إدخال كود الطالب (ID المكون من 24 عنصر) أو مسح كود الـ QR. (ملاحظة: أكواد الوصول مثل ' +
        studentId +
        ' هي أكواد تفعيل وليست ID الحضور)';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    cooldownRef.current = true;

    recordAttendanceMutation.mutate(
      { groupId, studentId },
      {
        onSuccess: () => {
          playBeep();
          setLastScannedId(studentId);
          toast.success(`تم تسجيل حضور الطالب بنجاح!`);

          const nowTime = new Date().toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          setSessionLog((prev) => [
            { id: Math.random().toString(), studentId, timestamp: nowTime },
            ...prev,
          ]);

          setScannedInput('');

          setTimeout(() => {
            cooldownRef.current = false;
            setLastScannedId(null);
          }, 2500);
        },
        onError: (err) => {
          playBeep();
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

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedInput.trim()) return;
    processAttendance(scannedInput);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
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

        
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 shrink-0">
          <button
            type="button"
            onClick={() => setMode('camera')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'camera' ? 'bg-[#0D8A82] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera size={15} />
            <span>كاميرا مباشر (Live Scan)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'manual' ? 'bg-[#0D8A82] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Keyboard size={15} />
            <span>قارئ يدوي</span>
          </button>
        </div>

        
        {mode === 'camera' ? (
          <div className="space-y-4 flex-1 overflow-y-auto">
            <div className="relative rounded-2xl bg-slate-950 p-2 border-2 border-slate-800 flex flex-col items-center justify-center min-h-64 overflow-hidden">
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
                <div className="w-full h-64 rounded-xl overflow-hidden">
                  <Scanner
                    onScan={(result) => {
                      if (result && result.length > 0 && result[0].rawValue) {
                        processAttendance(result[0].rawValue);
                      }
                    }}
                    onError={(err) => {
                      if (err) {
                        const msg = typeof err === 'string' ? err : err.message || 'تعذر تشغيل كاميرا المسح الضوئي';
                        setCameraError(msg);
                      }
                    }}
                    components={{
                      finder: true,
                    }}
                    constraints={{
                      facingMode: 'environment',
                    }}
                    styles={{
                      container: { width: '100%', height: '100%', borderRadius: '0.75rem', overflow: 'hidden' },
                      video: { borderRadius: '0.75rem', objectFit: 'cover' },
                    }}
                  />
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 font-semibold text-center leading-relaxed">
              قم بوضع كارت الطالب الفيزيائي أو الـ QR الخاص بالطالب في منتصف المربع لتسجيل الحضور تلقائياً.
            </p>
          </div>
        ) : (
          
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                امسح الكود بالقارئ الخارجي أو أدخل كود الطالب المكون من 24 عنصر
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={scannedInput}
                  onChange={(e) => setScannedInput(e.target.value)}
                  placeholder="امسح كارت الـ QR بالقارئ الخارجي أو أدخل الـ ID (24 عنصر)..."
                  className="w-full pl-4 pr-10 py-3.5 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition"
                />
                <QrCode size={18} className="absolute right-3.5 top-4 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                💡 الـ ID المكون من 24 عنصر يوجد في كود الـ QR للطالب أو صفحته الشخصية. (أكواد التفعيل مثل FHJ22U6V ليست ID حضور).
              </p>
            </div>

            <button
              type="submit"
              disabled={recordAttendanceMutation.isPending || !scannedInput.trim()}
              className="w-full py-3 px-4 rounded-xl bg-[#0D8A82] text-white font-bold text-xs hover:bg-teal-700 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {recordAttendanceMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري تسجيل الحضور...</span>
                </>
              ) : (
                <>
                  <UserCheck size={16} />
                  <span>تسجيل الحضور يدويّاً</span>
                </>
              )}
            </button>
          </form>
        )}

       
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2 shrink-0">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {lastScannedId && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2.5 shadow-2xs shrink-0 animate-in fade-in">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <div className="space-y-0.5">
              <span>تم تسجيل حضور الطالب بنجاح! 🎉</span>
              <span className="block text-[11px] text-emerald-700 font-mono font-bold">
                ID: {lastScannedId}
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

            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {sessionLog.map((item) => (
                <div
                  key={item.id}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Sparkles size={13} className="text-[#0D8A82]" />
                    <span className="font-mono text-[11px]">{item.studentId}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold dir-ltr">{item.timestamp}</span>
                </div>
              ))}
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
