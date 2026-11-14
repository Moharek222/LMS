import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { AttendanceSessionSlot } from '../hooks/useStudentAttendanceCardState';

interface AttendanceSessionsGridProps {
  slots: AttendanceSessionSlot[];
}

export const AttendanceSessionsGrid: React.FC<AttendanceSessionsGridProps> = ({ slots }) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
        <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
          <Clock size={18} className="text-[#0D8A82]" />
          <span>كشف حصص الشهر التعليمي</span>
        </h4>
        <span className="text-xs font-bold text-slate-500 bg-teal-50 px-3 py-1 rounded-xl border border-teal-100">
          نظام 8 حصص شهرياً
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {slots.map((slot) => {
          const isPresent = slot.status === 'present';
          const isAbsent = slot.status === 'absent';

          return (
            <div
              key={slot.sessionNumber}
              className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                isPresent
                  ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300'
                  : isAbsent
                  ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                  : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800">{slot.title}</span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border text-xs font-bold ${
                    isPresent
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                      : isAbsent
                      ? 'bg-rose-100 text-rose-700 border-rose-300'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  {isPresent ? (
                    <CheckCircle2 size={16} />
                  ) : isAbsent ? (
                    <XCircle size={16} />
                  ) : (
                    <Clock size={15} />
                  )}
                </div>
              </div>

              <div>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${
                    isPresent
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : isAbsent
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {slot.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

