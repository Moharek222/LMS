import React from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useStudentAttendanceCardState } from '../hooks/useStudentAttendanceCardState';
import { AttendanceStatsOverview } from './AttendanceStatsOverview';
import { AttendanceSessionsGrid } from './AttendanceSessionsGrid';
import { AttendanceNoticeBanner } from './AttendanceNoticeBanner';
import { toArabicErrorMessage } from '../../../utils/errorMessage';

export const StudentAttendanceCard: React.FC = () => {
  const {
    grade,
    isSecondSecondary,
    hasNoGroup,
    totalSessions,
    attendedSessions,
    absentSessions,
    attendancePercentage,
    sessionSlots,
    isLoading,
    isError,
    error,
    refetch,
  } = useStudentAttendanceCardState();

  // 1. If student is in Second Secondary or has no group assigned
  if (isSecondSecondary || hasNoGroup) {
    return (
      <AttendanceNoticeBanner
        isSecondSecondary={isSecondSecondary}
        hasNoGroup={hasNoGroup}
        grade={grade}
      />
    );
  }

  // 2. Loading State
  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3 min-h-75">
        <Loader2 size={36} className="animate-spin text-[#0D8A82]" />
        <p className="text-xs font-bold text-slate-600">جاري احتساب وتحميل سجل الحضور والغياب...</p>
      </div>
    );
  }

  // 3. Error State
  if (isError) {
    return (
      <div className="rounded-3xl p-8 border border-red-200 bg-red-50/40 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center border border-red-200">
          <AlertTriangle size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-800">حدث خطأ أثناء تحميل سجل الحضور</h4>
        <p className="text-xs text-slate-600 font-semibold max-w-md">
          {toArabicErrorMessage(error, 'تعذر الاتصال بسجل الحضور حالياً.')}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs mt-2"
        >
          <RefreshCw size={14} />
          <span>إعادة المحاولة</span>
        </button>
      </div>
    );
  }

  // 4. Normal Attendance Overview
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <AttendanceStatsOverview
        totalSessions={totalSessions}
        attendedSessions={attendedSessions}
        absentSessions={absentSessions}
        attendancePercentage={attendancePercentage}
      />

      <AttendanceSessionsGrid slots={sessionSlots} />
    </div>
  );
};

export default StudentAttendanceCard;
