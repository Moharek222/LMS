import React from 'react';
import { Clock, Sparkles } from 'lucide-react';
import type { ScannedItemLog } from '../hooks/useQrAttendanceScanner';

interface QrSessionLogProps {
  sessionLog: ScannedItemLog[];
  getStudentName: (id: string) => string | null;
}

export const QrSessionLog: React.FC<QrSessionLogProps> = ({ sessionLog, getStudentName }) => {
  if (sessionLog.length === 0) return null;

  return (
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
  );
};

export default QrSessionLog;

