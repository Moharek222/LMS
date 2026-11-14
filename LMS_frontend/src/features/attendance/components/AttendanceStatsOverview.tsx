import React from 'react';
import { CalendarCheck, Calendar, CheckCircle2, XCircle, Award } from 'lucide-react';

interface AttendanceStatsOverviewProps {
  totalSessions: number;
  attendedSessions: number;
  absentSessions: number;
  attendancePercentage: number;
}

export const AttendanceStatsOverview: React.FC<AttendanceStatsOverviewProps> = ({
  totalSessions,
  attendedSessions,
  absentSessions,
  attendancePercentage,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center shrink-0 border border-teal-100 shadow-2xs">
            <CalendarCheck size={30} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">سجل انضباط الحضور والغياب 📅</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              متابعة حضور حصص المجموعة التعليمية بالسنتر
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold border shrink-0 ${
            attendancePercentage >= 80
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : attendancePercentage >= 50
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          <Award size={16} />
          <span>نسبة الانضباط: {attendancePercentage}%</span>
        </span>
      </div>

      {/* 3 Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs">
            <Calendar size={22} />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">إجمالي حصص المجموعة</span>
            <span className="text-base font-extrabold text-slate-800">{totalSessions} حصص مرصودة</span>
          </div>
        </div>

        <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/70 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-2xs">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="text-[11px] text-emerald-700 font-bold block">الحصص المحضورة</span>
            <span className="text-base font-extrabold text-emerald-900">
              {attendedSessions} من {totalSessions}
            </span>
          </div>
        </div>

        <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-200/70 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/60 shadow-2xs">
            <XCircle size={22} />
          </div>
          <div>
            <span className="text-[11px] text-rose-700 font-bold block">حصص الغياب</span>
            <span className="text-base font-extrabold text-rose-900">{absentSessions} حصة</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700">مؤشر الانضباط العام للحضور</span>
          <span className="text-[#0D8A82] font-extrabold">{attendancePercentage}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 p-0.5">
          <div
            className="h-full bg-[#0D8A82] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, attendancePercentage))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

