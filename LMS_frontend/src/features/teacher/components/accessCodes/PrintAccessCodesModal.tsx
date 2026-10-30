import React, { useState } from 'react';
import { Printer, X, KeyRound, FileSpreadsheet, Check } from 'lucide-react';
import type { AccessCode } from '../../types/groupManagement';
import { isAccessCodeExpired } from '../../utils/accessCodeUtils';

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
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExported, setIsExported] = useState(false);

  if (!isOpen) return null;

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

  // 1. Dedicated Multi-Page Print Engine (Ensures 100% of all codes print without any browser clipping)
  const handlePrintAll = () => {
    setIsPrinting(true);

    try {
      // Remove any existing print iframe
      const oldFrame = document.getElementById('lms-dedicated-print-frame');
      if (oldFrame) {
        document.body.removeChild(oldFrame);
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'lms-dedicated-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.zIndex = '-9999';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        window.print();
        setIsPrinting(false);
        return;
      }

      const cardsHtml = accessCodes
        .map((codeItem, index) => {
          const studentName =
            typeof codeItem.studentID === 'object' && codeItem.studentID?.name
              ? codeItem.studentID.name
              : 'كود عام / طالب مسجل';

          const studentPhone =
            typeof codeItem.studentID === 'object' && codeItem.studentID?.phone
              ? codeItem.studentID.phone
              : '';

          const isExpired = isAccessCodeExpired(codeItem);
          const statusText = isExpired ? 'منتهي' : 'نشط ومفعل';
          const statusColor = isExpired ? '#be123c' : '#047857';
          const statusBg = isExpired ? '#fff1f2' : '#ecfdf5';

          return `
            <div class="code-card">
              <div class="card-top">
                <div class="student-info">
                  <span class="index-badge">${index + 1}</span>
                  <div>
                    <div class="student-name">${studentName}</div>
                    ${studentPhone ? `<div class="student-phone">${studentPhone}</div>` : ''}
                  </div>
                </div>
                <span class="status-tag" style="background:${statusBg}; color:${statusColor}; border:1px solid ${statusColor};">
                  ${statusText}
                </span>
              </div>

              <div class="code-box">
                <div class="code-label">كود التفعيل (Access Code)</div>
                <div class="code-text">${codeItem.code}</div>
              </div>

              <div class="card-bottom">
                <span>تاريخ الانتهاء: ${formatDate(codeItem.expiresAt)}</span>
                <span class="platform-tag">منصة الصادق التعليمية</span>
              </div>
            </div>
          `;
        })
        .join('');

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>كشف أكواد التفعيل - منصة الصادق التعليمية</title>
          <style>
            @page {
              size: A4;
              margin: 8mm 6mm;
            }
            * {
              box-sizing: border-box;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            }
            body {
              margin: 0;
              padding: 0;
              background: #fff;
              color: #0f172a;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .header-banner {
              text-align: center;
              border-bottom: 2px solid #0D8A82;
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .header-banner h1 {
              margin: 0 0 4px 0;
              font-size: 18px;
              font-weight: 900;
              color: #0D8A82;
            }
            .header-banner p {
              margin: 0;
              font-size: 11px;
              color: #64748b;
              font-weight: 600;
            }
            .cards-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
            }
            .code-card {
              border: 1.5px solid #cbd5e1;
              border-radius: 10px;
              padding: 8px 12px;
              background: #ffffff;
              page-break-inside: avoid;
              break-inside: avoid;
              display: flex;
              flex-direction: column;
              gap: 6px;
            }
            .card-top {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 1px solid #f1f5f9;
              padding-bottom: 4px;
            }
            .student-info {
              display: flex;
              align-items: center;
              gap: 6px;
            }
            .index-badge {
              width: 22px;
              height: 22px;
              border-radius: 6px;
              background: #f0fdfa;
              color: #0D8A82;
              border: 1px solid #ccfbf1;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: 800;
            }
            .student-name {
              font-size: 12px;
              font-weight: 800;
              color: #1e293b;
            }
            .student-phone {
              font-size: 10px;
              color: #64748b;
              font-family: monospace;
              direction: ltr;
              text-align: right;
            }
            .status-tag {
              font-size: 9px;
              font-weight: 800;
              padding: 1px 6px;
              border-radius: 4px;
            }
            .code-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 6px;
              text-align: center;
            }
            .code-label {
              font-size: 9px;
              color: #64748b;
              font-weight: 600;
              margin-bottom: 2px;
            }
            .code-text {
              font-family: monospace;
              font-size: 15px;
              font-weight: 900;
              letter-spacing: 2px;
              color: #0D8A82;
            }
            .card-bottom {
              display: flex;
              justify-content: space-between;
              font-size: 9px;
              color: #64748b;
              font-weight: 500;
            }
            .platform-tag {
              color: #0D8A82;
              font-weight: 700;
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <h1>منصة الصادق التعليمية - كشف أكواد التفعيل الرسمية</h1>
            <p>تاريخ الكشف: ${new Date().toLocaleDateString('ar-EG')} • إجمالي الأكواد: ${accessCodes.length} كود تفعيل</p>
          </div>
          <div class="cards-grid">
            ${cardsHtml}
          </div>
        </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setIsPrinting(false);
      }, 500);
    } catch (err) {
      console.error('Print error:', err);
      window.print();
      setIsPrinting(false);
    }
  };

  // 2. Export to Excel / CSV with full UTF-8 Arabic support
  const handleExportExcel = () => {
    try {
      const headers = ['م', 'اسم الطالب', 'رقم الهاتف', 'كود التفعيل', 'تاريخ الانتهاء', 'حالة الكود'];
      const rows = accessCodes.map((item, idx) => {
        const student =
          typeof item.studentID === 'object' && item.studentID !== null ? item.studentID : null;
        const studentName = (student?.name || 'كود عام').replace(/"/g, '""');
        const studentPhone = (student?.phone || '').replace(/"/g, '""');
        const codeStr = (item.code || '').replace(/"/g, '""');
        const expires = formatDate(item.expiresAt);
        const statusStr = isAccessCodeExpired(item) ? 'منتهي' : 'نشط';

        return [idx + 1, `"${studentName}"`, `"${studentPhone}"`, `"${codeStr}"`, `"${expires}"`, `"${statusStr}"`];
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `كشف_اكواد_تفعيل_الطلاب_${accessCodes.length}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExported(true);
      setTimeout(() => setIsExported(false), 3000);
    } catch (err) {
      console.error('CSV Export error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
              <Printer size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-800">طباعة وتصدير كشف الأكواد</h3>
                <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-[#0D8A82] text-xs font-black border border-teal-200">
                  {accessCodes.length} كود جاهز للطباعة 🖨️
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                تجهيز كشف الأكواد كاملاً لطباعته في صفحات A4 أو تصديره إلى ملف Excel (CSV)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Excel Button */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-black transition cursor-pointer shadow-2xs"
              title="تحميل كشف الأكواد كملف Excel"
            >
              {isExported ? <Check size={16} /> : <FileSpreadsheet size={16} />}
              <span>{isExported ? 'تم التحميل بنجاح!' : 'تصدير Excel (CSV) 📊'}</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrintAll}
              disabled={isPrinting}
              className="px-4 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-black hover:bg-teal-700 transition cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Printer size={16} />
              <span>{isPrinting ? 'جاري تجهيز الطباعة...' : `طباعة كامل الـ ${accessCodes.length} كود 🖨️`}</span>
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

        {/* Info Note */}
        <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-3 flex items-center justify-between text-xs text-teal-900 shrink-0">
          <span className="font-semibold">
            💡 سيتم طباعة جميع الأكواد الـ <strong>({accessCodes.length} كود)</strong> بالكامل وتوزيعها على صفحات A4 بدون أي نقص.
          </span>
          <span className="text-[11px] font-bold text-teal-700">
            عدد الصفحات التقريبي: {Math.ceil(accessCodes.length / 8)} صفحة
          </span>
        </div>

        {/* Scrollable Preview on Screen */}
        <div
          id="printable-access-codes-sheet"
          className="overflow-y-auto flex-1 space-y-4 pr-1"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {accessCodes.map((codeItem, index) => {
              const studentName =
                typeof codeItem.studentID === 'object' && codeItem.studentID?.name
                  ? codeItem.studentID.name
                  : 'كود عام / طالب مسجل';

              const studentPhone =
                typeof codeItem.studentID === 'object' && codeItem.studentID?.phone
                  ? codeItem.studentID.phone
                  : null;

              const isExpired = isAccessCodeExpired(codeItem);

              return (
                <div
                  key={codeItem._id || index}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5 hover:border-teal-300 transition"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#0D8A82] flex items-center justify-center font-bold text-xs shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 line-clamp-1">{studentName}</h4>
                        {studentPhone && (
                          <span className="text-[10px] text-slate-500 font-mono block dir-ltr text-right">
                            {studentPhone}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                        isExpired
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isExpired ? 'منتهي' : 'نشط'}
                    </span>
                  </div>

                  <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-xl text-center space-y-0.5">
                    <span className="text-[10px] text-slate-400 block font-semibold">
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

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-semibold">
            يمكنك طباعة الكشف كاملاً عبر زر الطباعة بالأعلى أو تصديره إلى ملف Excel (CSV).
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintAccessCodesModal;
