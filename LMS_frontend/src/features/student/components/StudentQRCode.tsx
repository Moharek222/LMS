import React, { useEffect, useRef, useState } from 'react';
import { Download, QrCode, AlertTriangle, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import { useAuth } from '../../../context/useAuth';

export const StudentQRCode: React.FC = () => {
  const { user, isLoading } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isQrGenerated, setIsQrGenerated] = useState<boolean>(false);

  const studentId = user?.id || '';
  const studentName = user?.name || '';

  useEffect(() => {
    if (!studentId || !canvasRef.current) {
      setIsQrGenerated(false);
      return;
    }

    const payload = JSON.stringify({ studentId });

    QRCode.toCanvas(
      canvasRef.current,
      payload,
      {
        width: 280,
        margin: 4, // ISO 18004 Quiet Zone standard
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      },
      (err) => {
        if (err) {
          console.error('Error generating QR code:', err);
          setIsQrGenerated(false);
        } else {
          setIsQrGenerated(true);
        }
      }
    );
  }, [studentId]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isQrGenerated || !studentId) return;

    try {
      const exportCanvas = document.createElement('canvas');
      const padding = 40;
      const headerHeight = 90;
      const totalWidth = canvas.width + padding * 2;
      const totalHeight = canvas.height + headerHeight + padding * 2;

      exportCanvas.width = totalWidth;
      exportCanvas.height = totalHeight;

      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return;

      // Pure white background for maximum contrast and scanner readability
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // Card header title
      ctx.fillStyle = '#0D8A82';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('منصة الصادق التعليمية - رمز الطالب', totalWidth / 2, 45);

      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(studentName ? `الطالب: ${studentName}` : `المعرف: ${studentId}`, totalWidth / 2, 75);

      // Draw QR Canvas in center with clear quiet zone margin
      ctx.drawImage(canvas, padding, headerHeight + padding);

      const dataUrl = exportCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `student-qr-${studentId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `student-qr-${studentId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#0D8A82] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">جاري التحقق من رمز الطالب...</p>
      </div>
    );
  }

  if (!studentId) {
    return (
      <div className="bg-amber-50/80 rounded-3xl p-6 border border-amber-200/80 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle size={24} />
        </div>
        <h4 className="text-sm font-extrabold text-slate-800">رمز الطالب QR غير متاح</h4>
        <p className="text-xs font-semibold text-amber-800 max-w-sm mx-auto">
          تعذر إنشاء رمز الطالب لعدم توفر بيانات الحساب.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5 flex flex-col items-center text-center">
      
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shadow-2xs shrink-0">
          <QrCode size={22} />
        </div>
        <div className="text-right">
          <h4 className="text-base font-black text-slate-800">رمز الطالب (QR Code)</h4>
          <span className="text-xs text-slate-400 font-semibold block mt-0.5">
            رمز التعرف الشخصي للطالب بالمنصة
          </span>
        </div>
      </div>

      
      <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-2xs inline-block">
        <canvas
          ref={canvasRef}
          className="w-52 h-52 sm:w-60 sm:h-60 rounded-2xl bg-white shadow-2xs block mx-auto"
        />
      </div>

      
      <div className="space-y-1.5 max-w-md mx-auto">
        <p className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
          <ShieldCheck size={16} className="text-[#0D8A82] shrink-0" />
          <span>هذا الرمز مخصص للتعريف بالطالب.</span>
        </p>
        <p className="text-[11px] text-slate-500 font-semibold">
          احفظ الرمز على جهازك لاستخدامه بدون إنترنت.
        </p>
      </div>

     
      <div className="flex items-center justify-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={handleDownload}
          disabled={!isQrGenerated}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0D8A82] text-white text-xs font-extrabold hover:bg-teal-700 transition cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          <Download size={16} />
          <span>تحميل صورة الـ QR</span>
        </button>
      </div>
    </div>
  );
};

export default StudentQRCode;
