import type { AccessCode } from '../types/groupManagement';
import { isAccessCodeExpired } from './accessCodeUtils';

export const formatAccessCodeDate = (dateStr: string): string => {
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

export const buildAccessCodesPrintHtml = (accessCodes: AccessCode[]): string => {
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
            <span>تاريخ الانتهاء: ${formatAccessCodeDate(codeItem.expiresAt)}</span>
            <span class="platform-tag">منصة الصادق التعليمية</span>
          </div>
        </div>
      `;
    })
    .join('');

  return `
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
  `;
};

export const exportAccessCodesToCsv = (accessCodes: AccessCode[]): void => {
  const headers = ['م', 'اسم الطالب', 'رقم الهاتف', 'كود التفعيل', 'تاريخ الانتهاء', 'حالة الكود'];
  const rows = accessCodes.map((item, idx) => {
    const student =
      typeof item.studentID === 'object' && item.studentID !== null ? item.studentID : null;
    const studentName = (student?.name || 'كود عام').replace(/"/g, '""');
    const studentPhone = (student?.phone || '').replace(/"/g, '""');
    const codeStr = (item.code || '').replace(/"/g, '""');
    const expires = formatAccessCodeDate(item.expiresAt);
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
};

