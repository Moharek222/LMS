import React, { useState } from 'react';
import { KeyRound, Copy, Check, User, Phone, Calendar } from 'lucide-react';
import type { AccessCode } from '../../types/groupManagement';
import { useToast } from '../../../../context/ToastContext';

interface AccessCodeCardProps {
  accessCode: AccessCode;
}

export const AccessCodeCard: React.FC<AccessCodeCardProps> = ({ accessCode }) => {
  const toast = useToast();
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyCode = async () => {
    if (!accessCode.code) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(accessCode.code);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = accessCode.code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success('تم نسخ كود التفعيل 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('تعذر نسخ كود التفعيل');
    }
  };

  // Safe Student Info Resolution
  const studentName =
    typeof accessCode.studentID === 'object' && accessCode.studentID !== null
      ? accessCode.studentID.name
      : 'طالب مغلق / محذوف';

  const studentPhone =
    typeof accessCode.studentID === 'object' && accessCode.studentID !== null
      ? accessCode.studentID.phone
      : null;

  // Safe Status Badge Translation
  const getStatusBadge = (status: string) => {
    const lower = (status || '').toLowerCase();
    if (lower === 'active') {
      return (
        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          نشط
        </span>
      );
    }
    if (lower === 'expired') {
      return (
        <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
          منتهي
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
        {status || 'غير معروف'}
      </span>
    );
  };

  // Safe Date Formatting
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
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Code & Student Details */}
      <div className="space-y-2.5 w-full md:w-auto">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-xl bg-teal-50 text-[#0D8A82] border border-teal-100 flex items-center gap-2 font-mono font-black text-sm tracking-wider">
            <KeyRound size={16} />
            <span>{accessCode.code}</span>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 text-xs font-bold transition cursor-pointer shadow-2xs"
            title="نسخ الكود"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="text-emerald-600">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy size={14} className="text-slate-500" />
                <span>نسخ الكود</span>
              </>
            )}
          </button>

          {getStatusBadge(accessCode.status)}
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-slate-700 flex-wrap">
          <div className="flex items-center gap-1.5">
            <User size={14} className="text-[#0D8A82]" />
            <span>{studentName}</span>
          </div>
          {studentPhone && (
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
              <Phone size={13} className="text-slate-400" />
              <span>{studentPhone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Expiration and Dates */}
      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60 w-full md:w-auto justify-between md:justify-end shrink-0">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-slate-400" />
          <span>تاريخ البدء: {formatDate(accessCode.startAt)}</span>
        </div>
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <Calendar size={14} className="text-rose-500" />
          <span>تاريخ الانتهاء: {formatDate(accessCode.expiresAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default AccessCodeCard;
