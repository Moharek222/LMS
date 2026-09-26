import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Award,
  AlertTriangle,
  Loader2,
  Calendar,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../../context/useAuth';
import {
  useMyAttendanceStats,
  useGroupAttendanceSheets,
} from '../hooks/useStudentAttendance';
import { toArabicErrorMessage } from '../../../utils/errorMessage';

const MONTH_NAMES_AR = [
  { value: '01', label: 'يناير (شهر 1)' },
  { value: '02', label: 'فبراير (شهر 2)' },
  { value: '03', label: 'مارس (شهر 3)' },
  { value: '04', label: 'أبريل (شهر 4)' },
  { value: '05', label: 'مايو (شهر 5)' },
  { value: '06', label: 'يونيو (شهر 6)' },
  { value: '07', label: 'يوليو (شهر 7)' },
  { value: '08', label: 'أغسطس (شهر 8)' },
  { value: '09', label: 'سبتمبر (شهر 9)' },
  { value: '10', label: 'أكتوبر (شهر 10)' },
  { value: '11', label: 'نوفمبر (شهر 11)' },
  { value: '12', label: 'ديسمبر (شهر 12)' },
];

export const StudentAttendanceCard: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id || '';
  const groupId = user?.groupId || '';

  const {
    data: statsData,
    isLoading: isLoadingStats,
    isError: isErrorStats,
    error: errorStats,
    refetch: refetchStats,
  } = useMyAttendanceStats(groupId);

  const {
    data: sheetsData,
    refetch: refetchSheets,
  } = useGroupAttendanceSheets(groupId, 1, 20);

  // Date, Year & Month selector states
  const currentDate = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState<string>(() => String(currentDate.getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState<string>(() => String(currentDate.getMonth() + 1).padStart(2, '0'));

  const selectedMonthKey = `${selectedYear}-${selectedMonth}`;

  // Dynamically compute available years (current year +-2 and any year from sheets)
  const availableYears = useMemo(() => {
    const currentY = currentDate.getFullYear();
    const yearsSet = new Set<number>([currentY - 2, currentY - 1, currentY, currentY + 1, currentY + 2]);
    (sheetsData?.data || []).forEach((s) => {
      if (s.date) {
        const y = new Date(s.date).getFullYear();
        if (!isNaN(y)) yearsSet.add(y);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [currentDate, sheetsData]);

  const selectedMonthLabel = useMemo(() => {
    const mObj = MONTH_NAMES_AR.find((m) => m.value === selectedMonth);
    const mName = mObj ? mObj.label.split(' ')[0] : '';
    return `${mName} ${selectedYear}`;
  }, [selectedMonth, selectedYear]);

  const sheets = sheetsData?.data || [];

  // Filter sheets for selected month
  const monthlySheets = useMemo(() => {
    return sheets
      .filter((sheet) => {
        if (!sheet.date) return false;
        const d = new Date(sheet.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return key === selectedMonthKey;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sheets, selectedMonthKey]);

  // Construct 8 monthly session slots
  const monthlySlots = useMemo(() => {
    const slots = [];
    const hasSheets = monthlySheets.length > 0;
    const totalRecordedSessions = hasSheets
      ? monthlySheets.length
      : (statsData?.totalSessions || 0);
    const totalAttendedSessions = hasSheets
      ? monthlySheets.filter(
          (sheet) =>
            Array.isArray(sheet.presentStudents) && sheet.presentStudents.includes(studentId)
        ).length
      : (statsData?.attendedSessions || 0);

    for (let i = 1; i <= 8; i++) {
      if (hasSheets) {
        const sheet = monthlySheets[i - 1];
        if (sheet) {
          const isPresent =
            Array.isArray(sheet.presentStudents) && sheet.presentStudents.includes(studentId);
          const formattedDate = new Date(sheet.date).toLocaleDateString('ar-EG', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
          slots.push({
            sessionNumber: i,
            title: `الحصة ${i}`,
            sheetId: sheet._id,
            date: sheet.date,
            formattedDate,
            status: isPresent ? ('present' as const) : ('absent' as const),
          });
        } else {
          slots.push({
            sessionNumber: i,
            title: `الحصة ${i}`,
            status: 'upcoming' as const,
          });
        }
      } else {
        if (i <= totalRecordedSessions) {
          const isPresent = i <= totalAttendedSessions;
          slots.push({
            sessionNumber: i,
            title: `الحصة ${i}`,
            formattedDate: 'تم رصد الجلسة',
            status: isPresent ? ('present' as const) : ('absent' as const),
          });
        } else {
          slots.push({
            sessionNumber: i,
            title: `الحصة ${i}`,
            status: 'upcoming' as const,
          });
        }
      }
    }
    return slots;
  }, [monthlySheets, studentId, statsData]);

  const monthlyAttendedCount = useMemo(() => {
    return monthlySlots.filter((s) => s.status === 'present').length;
  }, [monthlySlots]);

  const monthlyAbsentCount = useMemo(() => {
    return monthlySlots.filter((s) => s.status === 'absent').length;
  }, [monthlySlots]);

  const monthlyPercentage = useMemo(() => {
    return Math.round((monthlyAttendedCount / 8) * 100);
  }, [monthlyAttendedCount]);

  if (!studentId || !groupId) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
          <CalendarCheck size={28} />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h4 className="text-base font-extrabold text-slate-800">سجل انضباط الحضور والغياب</h4>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            لم يتم تفعيل مجموعتك الدراسية بعد. يرجى التواصل مع المعلم/الإدارة لتأكيد تسجيلك بالمجموعة لمتابعة حضورك وغيابك.
          </p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 max-w-md mx-auto text-xs text-slate-600 font-bold">
          💡 الحضور والغياب يتم رصده إلكترونياً وتلقائياً أثناء الحصص المباشرة والسنتر بواسطة المدرس.
        </div>
      </div>
    );
  }

  const isLoading = isLoadingStats;
  const isError = isErrorStats;
  const activeError = errorStats;

  const handleRetryAll = () => {
    refetchStats();
    refetchSheets();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3 min-h-75">
        <Loader2 size={36} className="animate-spin text-[#0D8A82]" />
        <p className="text-xs font-bold text-slate-600">جاري احتساب وتحميل سجل الحضور والغياب...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl p-8 border border-red-200 bg-red-50/40 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center border border-red-200">
          <AlertTriangle size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-800">حدث خطأ أثناء تحميل سجل الحضور</h4>
        <p className="text-xs text-slate-600 font-semibold max-w-md">
          {toArabicErrorMessage(activeError, 'تعذر الاتصال بسجل الحضور حالياً.')}
        </p>
        <button
          onClick={handleRetryAll}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs mt-2"
        >
          <RefreshCw size={14} />
          <span>إعادة المحاولة</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Overall Stats */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center shrink-0 border border-teal-100 shadow-2xs">
              <CalendarCheck size={30} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">سجل انضباط الحضور والغياب 📅</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                متابعة الحضور في حصص الشهر (8 حصص شهرياً) للجلسات التعليمية للمجموعة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0 self-end sm:self-auto">
            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-[#0D8A82]"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  سنة {y}
                </option>
              ))}
            </select>

            {/* Month Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-[#0D8A82]"
            >
              {MONTH_NAMES_AR.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold border ${
                monthlyPercentage >= 80
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : monthlyPercentage >= 50
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              <Award size={16} />
              <span>نسبة الشهر: {monthlyPercentage}%</span>
            </span>
          </div>
        </div>

        {/* 3 Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs">
              <Calendar size={22} />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">حصص الشهر المطلوب</span>
              <span className="text-base font-extrabold text-slate-800">8 حصص / شهر</span>
            </div>
          </div>

          <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/70 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-2xs">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span className="text-[11px] text-emerald-700 font-bold block">الحصص المحضورة</span>
              <span className="text-base font-extrabold text-emerald-900">{monthlyAttendedCount} من 8 حصص</span>
            </div>
          </div>

          <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-200/70 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/60 shadow-2xs">
              <XCircle size={22} />
            </div>
            <div>
              <span className="text-[11px] text-rose-700 font-bold block">حصص الغياب</span>
              <span className="text-base font-extrabold text-rose-900">{monthlyAbsentCount} حصة</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700">مؤشر الانضباط لحصص الشهر (8 حصص)</span>
            <span className="text-[#0D8A82] font-extrabold">{monthlyPercentage}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 p-0.5">
            <div
              className="h-full bg-[#0D8A82] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, monthlyPercentage))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 8-Sessions Monthly Interactive Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
          <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Clock size={18} className="text-[#0D8A82]" />
            <span>كشف حصص الشهر (8 حصص شهرياً)</span>
          </h4>
          <span className="text-xs font-bold text-slate-500 bg-teal-50 px-3 py-1 rounded-xl border border-teal-100">
            {selectedMonthLabel}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {monthlySlots.map((slot) => {
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
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    {slot.formattedDate || 'لم تُسجل بعد'}
                  </span>
                  <span
                    className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${
                      isPresent
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : isAbsent
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {isPresent ? 'حاضر ✅' : isAbsent ? 'غائب ❌' : 'قادمة ⚪'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceCard;
