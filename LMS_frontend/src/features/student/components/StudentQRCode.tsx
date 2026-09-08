import React, { useEffect, useRef, useState } from 'react';
import { Download, QrCode, AlertTriangle, ShieldCheck, Printer } from 'lucide-react';
import { useAuth } from '../../../context/useAuth';
import { generateQRMatrix } from '../utils/qrGenerator';
import { PrintStudentQrCardModal } from './PrintStudentQrCardModal';

export const StudentQRCode: React.FC = () => {
  const { user, isLoading } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isQrGenerated, setIsQrGenerated] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  const studentId = user?.id || '';
  const studentName = user?.name || '';

  useEffect(() => {
    if (!studentId || !canvasRef.current) {
      setIsQrGenerated(false);
      return;
    }

    const payload = JSON.stringify({ studentId });
    const qrResult = generateQRMatrix(payload);

    if (!qrResult) {
      setIsQrGenerated(false);
      return;
    }

    const { size, modules } = qrResult;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale canvas for sharp rendering
    const moduleSize = 8; // Size of each QR cell
    const margin = 16; // White quiet zone margin
    const totalSize = size * moduleSize + margin * 2;

    canvas.width = totalSize;
    canvas.height = totalSize;

    // Background white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, totalSize, totalSize);

    // Draw QR Modules (Teal/Dark Navy color for modern look)
    ctx.fillStyle = '#091523';

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (modules[r][c]) {
          const x = margin + c * moduleSize;
          const y = margin + r * moduleSize;
          ctx.fillRect(x, y, moduleSize, moduleSize);
        }
      }
    }

    setIsQrGenerated(true);
  }, [studentId]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isQrGenerated || !studentId) return;

    try {
      // Create a high-resolution export canvas with title & branding for PNG download
      const exportCanvas = document.createElement('canvas');
      const padding = 32;
      const titleHeight = 80;
      const totalWidth = canvas.width + padding * 2;
      const totalHeight = canvas.height + padding * 2 + titleHeight;

      exportCanvas.width = totalWidth;
      exportCanvas.height = totalHeight;

      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return;

      // Draw white background card
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      // Draw subtle border line
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, totalWidth - 20, totalHeight - 20);

      // Header title (RTL friendly)
      ctx.fillStyle = '#0D8A82';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('منصة الصادق التعليمية - رمز الطالب', totalWidth / 2, 45);

      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(studentName ? `الطالب: ${studentName}` : `المعرف: ${studentId}`, totalWidth / 2, 70);

      // Draw QR Canvas
      ctx.drawImage(canvas, padding, titleHeight + padding);

      // Convert to PNG Blob / Data URL and trigger local file save
      const dataUrl = exportCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `student-qr-${studentId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Direct canvas fallback if export canvas fails
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
      {/* Title Header */}
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

      {/* QR Canvas Display Container */}
      <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-2xs inline-block">
        <canvas
          ref={canvasRef}
          className="w-52 h-52 sm:w-60 sm:h-60 rounded-2xl bg-white shadow-2xs block mx-auto"
        />
      </div>

      {/* Instructional Messages */}
      <div className="space-y-1.5 max-w-md mx-auto">
        <p className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
          <ShieldCheck size={16} className="text-[#0D8A82] shrink-0" />
          <span>هذا الرمز مخصص للتعريف بالطالب.</span>
        </p>
        <p className="text-[11px] text-slate-500 font-semibold">
          احفظ الرمز على جهازك لاستخدامه بدون إنترنت.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3 w-full sm:w-auto flex-wrap">
        <button
          type="button"
          onClick={handleDownload}
          disabled={!isQrGenerated}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0D8A82] text-white text-xs font-extrabold hover:bg-teal-700 transition cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-none"
        >
          <Download size={16} />
          <span>تحميل صورة الـ QR</span>
        </button>

        <button
          type="button"
          onClick={() => setIsPrintModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-teal-50 text-[#0D8A82] border border-teal-200 text-xs font-extrabold hover:bg-teal-100 transition cursor-pointer shadow-xs flex-1 sm:flex-none"
        >
          <Printer size={16} />
          <span>طباعة كارت الطالب 🖨️</span>
        </button>
      </div>

      {/* Print QR Badge Modal */}
      <PrintStudentQrCardModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        studentId={studentId}
        studentName={studentName}
        studentPhone={user?.phone}
      />
    </div>
  );
};

export default StudentQRCode;
