import React, { useEffect, useRef } from 'react';
import { QrCode, Printer, X, ShieldCheck, Phone, Users } from 'lucide-react';
import { generateQRMatrix } from '../utils/qrGenerator';

interface PrintStudentQrCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  groupName?: string;
}

export const PrintStudentQrCardModal: React.FC<PrintStudentQrCardModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  studentPhone,
  groupName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen || !studentId || !canvasRef.current) return;

    const payload = JSON.stringify({ studentId });
    const qrResult = generateQRMatrix(payload);
    if (!qrResult) return;

    const { size, modules } = qrResult;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const moduleSize = 5;
    const margin = 10;
    const totalSize = size * moduleSize + margin * 2;

    canvas.width = totalSize;
    canvas.height = totalSize;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, totalSize, totalSize);

    ctx.fillStyle = '#091523';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (modules[r][c]) {
          ctx.fillRect(margin + c * moduleSize, margin + r * moduleSize, moduleSize, moduleSize);
        }
      }
    }
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100">
              <Printer size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">طباعة كارت الـ QR للطالب 🖨️</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">بطاقة الهوية ورقم الحضور للسنتر والمنصة</p>
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

        {/* Printable Physical ID Card Box */}
        <div
          id="printable-student-card"
          className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 border-2 border-[#0D8A82]/50 shadow-xl space-y-5 relative overflow-hidden print:m-0 print:shadow-none print:border-2 print:border-black"
        >
          {/* Decorative Background Glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#0D8A82]/20 rounded-full blur-2xl pointer-events-none" />

          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 p-1 flex items-center justify-center shadow-md overflow-hidden shrink-0">
                <img
                  src="/logo.png"
                  alt="شعار منصة الصادق"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to GraduationCap if image fails
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap text-teal-300"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>';
                    }
                  }}
                />
              </div>
              <div>
                <h4 className="text-sm font-extrabold tracking-wide text-teal-300">منصة الصادق التعليمية</h4>
                <span className="text-[10px] text-slate-300 font-semibold block">بطاقة الطالب الرقمية الرسمية</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-bold">
              ID CARD
            </span>
          </div>

          {/* Student Info & QR Code */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2.5 flex-1">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">اسم الطالب</span>
                <h5 className="text-base font-black text-white">{studentName}</h5>
              </div>

              {studentPhone && (
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold dir-ltr text-right">
                  <Phone size={13} className="text-teal-400" />
                  <span>{studentPhone}</span>
                </div>
              )}

              {groupName && (
                <div className="flex items-center gap-1.5 text-xs text-teal-200 font-bold">
                  <Users size={13} className="text-teal-400" />
                  <span>المجموعة: {groupName}</span>
                </div>
              )}
            </div>

            {/* High Definition QR Code Canvas */}
            <div className="p-2.5 bg-white rounded-2xl border-2 border-teal-400/40 shadow-md shrink-0 flex flex-col items-center justify-center">
              <canvas ref={canvasRef} className="rounded-lg block" />
              <span className="text-[9px] font-mono font-bold text-slate-800 mt-1 dir-ltr">
                {studentId.slice(-8).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Card Footer Banner */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
            <div className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-teal-400" />
              <span>بطاقة رسمية معتمدة للحضور بالسنتر والمنصة</span>
            </div>
            <div className="flex items-center gap-1">
              <QrCode size={12} className="text-teal-400" />
              <span>QR PASS</span>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center gap-3 pt-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-xl bg-[#0D8A82] text-white font-bold text-xs hover:bg-teal-700 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <Printer size={16} />
            <span>طباعة كارت الطالب الآن 🖨️</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintStudentQrCardModal;
