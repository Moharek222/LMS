import React from 'react';
import { Printer, X, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import type { AccessCode } from '../../types/groupManagement';

interface PrintAccessCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessCodes: AccessCode[];
}

export const PrintAccessCodesModal: React.FC<PrintAccessCodesModalProps> = ({
  isOpen,
  onClose,
  accessCodes,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Action Header (Hidden on Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100">
              <Printer size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">طباعة شيت أكواد التفعيل 🖨️</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                تنسيق الشيت لطباعته في ورقة وتوزيعه على الطلاب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Printer size={16} />
              <span>طباعة الشيت الآن 🖨️</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Access Codes Content */}
        <div
          id="printable-access-codes-sheet"
          className="overflow-y-auto flex-1 space-y-6 pr-1 print:overflow-visible print:p-0"
        >
          {/* Print Header */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1 print:bg-white print:border-b-2 print:border-black print:rounded-none">
            <h2 className="text-lg font-black text-slate-900">منصة الصادق التعليمية - كشف أكواد التفعيل الرسمية</h2>
            <div className="flex items-center justify-center gap-6 text-xs text-slate-600 font-semibold pt-1">
              <span>تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</span>
              <span>•</span>
              <span>عدد الأكواد: {accessCodes.length} كود</span>
            </div>
          </div>

          {/* Grid of Access Codes Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
            {accessCodes.map((codeItem, index) => {
              const studentName =
                typeof codeItem.studentID === 'object' && codeItem.studentID?.name
                  ? codeItem.studentID.name
                  : 'كود عام / طالب غائب';

              const studentPhone =
                typeof codeItem.studentID === 'object' && codeItem.studentID?.phone
                  ? codeItem.studentID.phone
                  : null;

              const isUsed = codeItem.status?.toLowerCase() === 'used';

              return (
                <div
                  key={codeItem._id || index}
                  className="p-4 rounded-2xl bg-white border-2 border-slate-200 shadow-2xs space-y-3 print:border-2 print:border-black print:break-inside-avoid"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0D8A82] flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">{studentName}</h4>
                        {studentPhone && (
                          <span className="text-[10px] text-slate-500 font-mono block dir-ltr text-right">
                            {studentPhone}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                        isUsed
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isUsed ? 'مُستخدم' : 'نشط'}
                    </span>
                  </div>

                  <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-center space-y-1 print:bg-slate-100 print:text-slate-900 print:border">
                    <span className="text-[10px] text-slate-400 block font-semibold print:text-slate-600">
                      كود التفعيل (Access Code)
                    </span>
                    <span className="text-base font-black font-mono tracking-widest block select-all">
                      {codeItem.code}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span>صالح حتى: {formatDate(codeItem.expiresAt)}</span>
                    <div className="flex items-center gap-1 text-[#0D8A82]">
                      <KeyRound size={12} />
                      <span>كود مخصص</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer (Hidden on Print) */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0 print:hidden">
          <span className="text-xs text-slate-500 font-semibold">
            يمكنك طباعة الصفحة مباشرة عبر طابعة الكمبيوتر أو حفظها كملف PDF.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintAccessCodesModal;
