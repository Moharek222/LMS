import { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useRecordStudentAttendance } from '../../../../attendance/hooks/useStudentAttendance';
import { useGroupStudents } from '../../../hooks/useGroupStudents';
import { toArabicErrorMessage } from '../../../../../utils/errorMessage';
import { useToast } from '../../../../../context/ToastContext';
import {
  playAttendanceBeep,
  extractStudentIdFromQr,
  isValidMongoId,
  decodeQrFromImageFile,
} from '../../../utils/qrAttendanceUtils';

export interface ScannedItemLog {
  id: string;
  studentId: string;
  studentName?: string;
  timestamp: string;
}

interface UseQrAttendanceScannerParams {
  isOpen: boolean;
  groupId: string;
}

export const useQrAttendanceScanner = ({ isOpen, groupId }: UseQrAttendanceScannerParams) => {
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

  return {
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
  };
};

export default useQrAttendanceScanner;

