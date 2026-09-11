import React from 'react';
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
    isLoading: isLoadingSheets,
    isError: isErrorSheets,
    error: errorSheets,
    refetch: refetchSheets,
  } = useGroupAttendanceSheets(groupId, 1, 20);

  if (!studentId || !groupId) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-800">بيانات الحضور غير متاحة حالياً</h4>
        <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
          يرجى التأكد من ربط حسابك بمجموعة دراسية صحيحة ومحاولة تسجيل الدخول مرة أخرى.
        </p>
      </div>
    );
  }

  const isLoading = isLoadingStats || isLoadingSheets;
  const isError = isErrorStats || isErrorSheets;
  const activeError = errorStats || errorSheets;

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

  const totalSessions = statsData?.totalSessions ?? 0;
  const attendedSessions = statsData?.attendedSessions ?? 0;
  const attendancePercentage = statsData?.attendancePercentage ?? 0;
  const absentSessions = Math.max(0, totalSessions - attendedSessions);
  const sheets = sheetsData?.data || [];

  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center shrink-0 border border-teal-100 shadow-2xs">
              <CalendarCheck size={30} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">سجل انضباط الحضور والغياب</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                متابعة حضور المحاضرات المباشرة والجلسات التعليمية للمجموعة
              </p>
            </div>
          </div>

          <div className="shrink-0 self-end sm:self-auto">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold border ${
                attendancePercentage >= 80
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : attendancePercentage >= 60
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              <Award size={16} />
              <span>نسبة الانضباط: {attendancePercentage}%</span>
            </span>
          </div>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs">
              <Calendar size={22} />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">إجمالي المحاضرات</span>
              <span className="text-base font-extrabold text-slate-800">{totalSessions} محاضرة</span>
            </div>
          </div>

         
          <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/70 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-2xs">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <span className="text-[11px] text-emerald-700 font-bold block">المحاضرات المحضورة</span>
              <span className="text-base font-extrabold text-emerald-900">{attendedSessions} محاضرة</span>
            </div>
          </div>

         
          <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-200/70 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/60 shadow-2xs">
              <XCircle size={22} />
            </div>
            <div>
              <span className="text-[11px] text-rose-700 font-bold block">أيام الغياب</span>
              <span className="text-base font-extrabold text-rose-900">{absentSessions} يوم</span>
            </div>
          </div>
        </div>

       
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700">مؤشر الالتزام بالحضور</span>
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

      
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Clock size={18} className="text-[#0D8A82]" />
            <span>سجل المحاضرات والجلسات المسجلة</span>
          </h4>
          <span className="text-xs font-bold text-slate-400">
            عدد المحاضرات: {sheets.length}
          </span>
        </div>

        {sheets.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
              <CalendarCheck size={24} />
            </div>
            <h5 className="text-sm font-bold text-slate-700">لا يوجد كشف حضور مسجل لهذه المجموعة حتى الآن</h5>
            <p className="text-xs text-slate-400 font-semibold">
              سيتم إضافة وسجل الحضور تلقائياً فور رصد الجلسات المباشرة.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sheets.map((sheet) => {
              const isPresent = Array.isArray(sheet.presentStudents) && sheet.presentStudents.includes(studentId);
              const formattedDate = new Date(sheet.date).toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <div
                  key={sheet._id}
                  className="rounded-2xl p-4 border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 transition flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isPresent
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                          : 'bg-rose-100 text-rose-700 border-rose-300'
                      }`}
                    >
                      {isPresent ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    </div>
                    <div>
                      <h5 className="text-xs font-extrabold text-slate-800">{formattedDate}</h5>
                      <span className="text-[11px] text-slate-400 font-semibold block mt-0.5">
                        جلسة تعليمية مباشرة
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold border shrink-0 ${
                      isPresent
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {isPresent ? 'حاضر' : 'غائب'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendanceCard;
