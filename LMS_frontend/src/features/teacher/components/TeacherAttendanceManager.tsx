import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Users,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  X,
  QrCode,
  Printer,
  Award,
  Calendar,
} from 'lucide-react';
import { useTeacherGroups } from '../hooks/useTeacherGroups';
import { useGroupStudents } from '../hooks/useGroupStudents';
import {
  useGroupAttendanceSheets,
  useAttendanceSheetDetails,
  useRecordStudentAttendance,
} from '../../attendance/hooks/useStudentAttendance';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { useToast } from '../../../context/ToastContext';
import { QrAttendanceScannerModal } from './attendance/QrAttendanceScannerModal';
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

export const TeacherAttendanceManager: React.FC = () => {
  const toast = useToast();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [sheetsPage, setSheetsPage] = useState<number>(1);
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);
  const [detailsTab, setDetailsTab] = useState<'present' | 'absent'>('present');
  const [recordingStudentId, setRecordingStudentId] = useState<string | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [printStudentTarget, setPrintStudentTarget] = useState<{
    id: string;
    name: string;
    phone?: string;
    parentPhone?: string;
  } | null>(null);

  // Date, Year & Month selector states
  const currentDate = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState<string>(() => String(currentDate.getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState<string>(() => String(currentDate.getMonth() + 1).padStart(2, '0'));

  const selectedMonthKey = `${selectedYear}-${selectedMonth}`;

  // Fetch Teacher Groups
  const {
    data: groupsData,
    isLoading: isLoadingGroups,
    isError: isErrorGroups,
    error: errorGroups,
    refetch: refetchGroups,
  } = useTeacherGroups({ limit: 100 });

  const activeGroups = (groupsData?.data || []).filter((g) => g.isActive !== false);

  // Fetch Group Students
  const {
    data: students,
    isLoading: isLoadingStudents,
    isError: isErrorStudents,
    error: errorStudents,
    refetch: refetchStudents,
  } = useGroupStudents(selectedGroupId);

  // Fetch Attendance Sheets (limit 100 to support monthly view)
  const {
    data: sheetsData,
    isLoading: isLoadingSheets,
    isError: isErrorSheets,
    error: errorSheets,
    refetch: refetchSheets,
  } = useGroupAttendanceSheets(selectedGroupId, sheetsPage, 100);

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

  // Fetch Details of a single sheet
  const {
    data: sheetDetailsData,
    isLoading: isLoadingSheetDetails,
    isError: isErrorSheetDetails,
    error: errorSheetDetails,
    refetch: refetchSheetDetails,
  } = useAttendanceSheetDetails(selectedGroupId, selectedSheetId || undefined);

  // Record Attendance Mutation
  const recordAttendanceMutation = useRecordStudentAttendance();

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroupId(e.target.value);
    setSheetsPage(1);
    setSelectedSheetId(null);
  };

  const handleRecordAttendance = (studentId: string, studentName: string) => {
    if (!selectedGroupId) return;
    setRecordingStudentId(studentId);

    recordAttendanceMutation.mutate(
      { groupId: selectedGroupId, studentId },
      {
        onSuccess: () => {
          toast.success(`تم تسجيل حضور الطالب (${studentName}) بنجاح.`);
          setRecordingStudentId(null);
        },
        onError: (err) => {
          const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء تسجيل حضور الطالب');
          toast.error(msg);
          setRecordingStudentId(null);
        },
      }
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const sheets = sheetsData?.data || [];
  const totalSheetsPages = sheetsData?.totalPages || 1;

  // Filter sheets for selected group and month
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

  // Construct 8 monthly session slots for control panel
  const monthlySlots = useMemo(() => {
    const totalStudentsInGroup = students?.length || 0;
    const slots = [];
    for (let i = 1; i <= 8; i++) {
      const sheet = monthlySheets[i - 1];
      if (sheet) {
        const presentCount = Array.isArray(sheet.presentStudents) ? sheet.presentStudents.length : 0;
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
          presentCount,
          totalStudents: totalStudentsInGroup,
          status: 'recorded' as const,
        });
      } else {
        slots.push({
          sessionNumber: i,
          title: `الحصة ${i}`,
          status: 'upcoming' as const,
        });
      }
    }
    return slots;
  }, [monthlySheets, students]);

  const recordedCount = monthlySlots.filter((s) => s.status === 'recorded').length;
  const totalPresentSum = monthlySlots.reduce((acc, s) => acc + (s.presentCount || 0), 0);
  const totalPossibleSum = recordedCount * (students?.length || 1);
  const monthAttendancePercentage =
    totalPossibleSum > 0 ? Math.round((totalPresentSum / totalPossibleSum) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
            <CalendarCheck size={24} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800">نظام لوحة التحكم للحضور والغياب 📅</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              متابعة حصص الشهر (8 حصص شهرياً) وتسجيل الحضور بالـ QR Code
            </p>
          </div>
        </div>

        {selectedGroupId && (
          <button
            type="button"
            onClick={() => setIsQrScannerOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-2xs flex items-center gap-2"
          >
            <QrCode size={16} />
            <span>ماسح الـ QR Code 📷</span>
          </button>
        )}
      </div>

      {/* Group, Year & Month Selectors */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              المجموعة الدراسية <span className="text-rose-500">*</span>
            </label>

            {isLoadingGroups ? (
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-500">
                <Loader2 size={16} className="animate-spin text-[#0D8A82]" />
                <span>جاري تحميل المجموعات المتاحة...</span>
              </div>
            ) : isErrorGroups ? (
              <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-700 flex items-center justify-between gap-2">
                <span>{toArabicErrorMessage(errorGroups, 'فشل تحميل المجموعات الدراسية')}</span>
                <button
                  type="button"
                  onClick={() => refetchGroups()}
                  className="inline-flex items-center gap-1 text-xs underline cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            ) : activeGroups.length === 0 ? (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-xs font-bold text-amber-800">
                لا توجد مجموعات نشطة متاحة حالياً.
              </div>
            ) : (
              <select
                dir="rtl"
                value={selectedGroupId}
                onChange={handleGroupChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-right text-sm font-medium focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] transition outline-none"
              >
                <option value="">اختر المجموعة الدراسية</option>
                {activeGroups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedGroupId && (
            <>
              {/* Year Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  تحديد السنة الدراسية 📅
                </label>
                <select
                  dir="rtl"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-right text-sm font-medium focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] transition outline-none bg-slate-50/50"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      سنة {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  تحديد الشهر (8 حصص شهرياً) 🗓️
                </label>
                <select
                  dir="rtl"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-right text-sm font-medium focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] transition outline-none bg-slate-50/50"
                >
                  {MONTH_NAMES_AR.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 8-Sessions Monthly Control View for Teacher */}
      {selectedGroupId && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center shrink-0 border border-teal-100">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-800">
                  لوحة متابعة حصص الشهر (8 حصص شهرياً)
                </h4>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  عرض كشوف الحصص الـ 8 المحددة للمجموعة لشهـر{' '}
                  {selectedMonthLabel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-50 text-[#0D8A82] border border-teal-100 text-xs font-bold">
                <Award size={16} />
                <span>متوسط حضور الشهر: {monthAttendancePercentage}%</span>
              </span>
            </div>
          </div>

          {/* 3 Summary Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs">
                <Calendar size={20} />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">مطلوب الخطة الشهري</span>
                <span className="text-sm font-extrabold text-slate-800">8 حصص شهرياً</span>
              </div>
            </div>

            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/70 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60 shadow-2xs">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <span className="text-[11px] text-emerald-700 font-bold block">الحصص المرصودة</span>
                <span className="text-sm font-extrabold text-emerald-900">{recordedCount} من 8 حصص</span>
              </div>
            </div>

            <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/70 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60 shadow-2xs">
                <Clock size={20} />
              </div>
              <div>
                <span className="text-[11px] text-amber-700 font-bold block">الحصص المتبقية</span>
                <span className="text-sm font-extrabold text-amber-900">{8 - recordedCount} حصص</span>
              </div>
            </div>
          </div>

          {/* 8-Session Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {monthlySlots.map((slot) => {
              const isRecorded = slot.status === 'recorded';

              return (
                <div
                  key={slot.sessionNumber}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-4 ${
                    isRecorded
                      ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300'
                      : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800">{slot.title}</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                        isRecorded
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-white text-slate-500 border-slate-200'
                      }`}
                    >
                      {isRecorded ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>تم الرصد</span>
                        </>
                      ) : (
                        <>
                          <Clock size={12} />
                          <span>لم تُسجل</span>
                        </>
                      )}
                    </span>
                  </div>

                  {isRecorded ? (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-600">
                        🗓️ {slot.formattedDate}
                      </div>
                      <div className="text-xs font-extrabold text-[#0D8A82]">
                        👥 حضور: {slot.presentCount} {slot.totalStudents ? `من ${slot.totalStudents}` : ''} طالب
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 font-semibold">
                      لم يتم عقد/رصد الحصة بعد
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200/60">
                    {isRecorded && slot.sheetId ? (
                      <button
                        type="button"
                        onClick={() => setSelectedSheetId(slot.sheetId!)}
                        className="w-full py-2 rounded-xl bg-white text-[#0D8A82] hover:bg-teal-50 border border-teal-200 text-xs font-bold transition cursor-pointer text-center"
                      >
                        عرض التفاصيل 🔍
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsQrScannerOpen(true)}
                        className="w-full py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition cursor-pointer text-center"
                      >
                        رصد الحضور 📷
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Roster & History Grid */}
      {selectedGroupId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Group Students Roster */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col min-h-96">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <Users size={18} className="text-[#0D8A82]" />
                <span>قائمة طلاب المجموعة</span>
              </h4>
              {students && (
                <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-[#0D8A82] text-xs font-bold border border-teal-100">
                  {students.length} طالب
                </span>
              )}
            </div>

            {isLoadingStudents ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                <Loader2 size={28} className="animate-spin text-[#0D8A82]" />
                <span className="text-xs font-bold text-slate-600">جاري تحميل طلاب المجموعة...</span>
              </div>
            ) : isErrorStudents ? (
              <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-700 space-y-2 text-center">
                <p>{toArabicErrorMessage(errorStudents, 'فشل تحميل بيانات الطلاب')}</p>
                <button
                  type="button"
                  onClick={() => refetchStudents()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            ) : !students || students.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Users size={20} />
                </div>
                <h5 className="text-xs font-bold text-slate-700">لا يوجد طلاب في هذه المجموعة</h5>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-115 pr-1">
                {students.map((student) => {
                  const isRecordingThis = recordingStudentId === student._id;

                  return (
                    <div
                      key={student._id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <User size={14} className="text-[#0D8A82]" />
                          <span className="text-xs font-bold text-slate-800">{student.name}</span>
                        </div>
                        {student.phone && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold dir-ltr text-right">
                            <Phone size={11} className="text-slate-400" />
                            <span>{student.phone}</span>
                          </div>
                        )}
                        {student.parentPhone && (
                          <div className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold dir-ltr text-right">
                            <Phone size={11} className="text-amber-500" />
                            <span>ولي الأمر: {student.parentPhone}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setPrintStudentTarget({
                              id: student._id,
                              name: student.name,
                              phone: student.phone,
                              parentPhone: student.parentPhone,
                            })
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-teal-50 text-[#0D8A82] hover:bg-teal-100 border border-teal-100 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                          title="طباعة كارت الـ QR للطالب"
                        >
                          <Printer size={13} />
                          <span className="hidden sm:inline">طباعة</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRecordAttendance(student._id, student.name)}
                          disabled={recordAttendanceMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-2xs shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isRecordingThis ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              <span>تسجيل...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={13} />
                              <span>تسجيل حضور</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Previous Attendance Sheets List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col min-h-96">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <Clock size={18} className="text-[#0D8A82]" />
                <span>كشوف الجلسات السابقة</span>
              </h4>
              {sheetsData?.total !== undefined && (
                <span className="text-xs font-bold text-slate-500">
                  إجمالي الكشوف: {sheetsData.total}
                </span>
              )}
            </div>

            {isLoadingSheets ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                <Loader2 size={28} className="animate-spin text-[#0D8A82]" />
                <span className="text-xs font-bold text-slate-600">جاري تحميل كشوف الحضور...</span>
              </div>
            ) : isErrorSheets ? (
              <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-700 space-y-2 text-center">
                <p>{toArabicErrorMessage(errorSheets, 'فشل تحميل كشوف الحضور')}</p>
                <button
                  type="button"
                  onClick={() => refetchSheets()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            ) : sheets.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <CalendarCheck size={20} />
                </div>
                <h5 className="text-xs font-bold text-slate-700">لا توجد سجلات حضور لهذه المجموعة حتى الآن</h5>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-115 pr-1">
                {sheets.map((sheet) => {
                  const presentCount = Array.isArray(sheet.presentStudents)
                    ? sheet.presentStudents.length
                    : 0;

                  return (
                    <div
                      key={sheet._id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-teal-50/40 transition"
                    >
                      <div>
                        <h5 className="text-xs font-extrabold text-slate-800">
                          {formatDate(sheet.date)}
                        </h5>
                        <span className="text-[11px] font-semibold text-[#0D8A82] block mt-0.5">
                          عدد الحاضرين: {presentCount} طالب
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedSheetId(sheet._id)}
                        className="px-3 py-1.5 rounded-xl bg-white text-[#0D8A82] hover:bg-teal-50 border border-teal-100 text-xs font-bold transition cursor-pointer shadow-2xs"
                      >
                        عرض التفاصيل
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {totalSheetsPages > 1 && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSheetsPage((p) => Math.max(p - 1, 1))}
                  disabled={sheetsPage <= 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
                <span>
                  صفحة {sheetsPage} من {totalSheetsPages}
                </span>
                <button
                  type="button"
                  onClick={() => setSheetsPage((p) => Math.min(p + 1, totalSheetsPages))}
                  disabled={sheetsPage >= totalSheetsPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sheet Details Modal */}
      {selectedSheetId && (() => {
        const studentStatuses = sheetDetailsData?.data || [];
        const presentList = studentStatuses.filter((s) => s.status === 'Present');
        const absentList = studentStatuses.filter((s) => s.status === 'Absent');
        const sheetDate = sheetDetailsData?.date;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100">
                    <CalendarCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800">تفاصيل كشف الحضور والغياب</h4>
                    {sheetDate && (
                      <p className="text-xs text-slate-500 font-medium">
                        التاريخ: {formatDate(sheetDate)}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSheetId(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl shrink-0">
                <button
                  type="button"
                  onClick={() => setDetailsTab('present')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    detailsTab === 'present'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>الطلاب الحاضرون ({presentList.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDetailsTab('absent')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    detailsTab === 'absent'
                      ? 'bg-white text-rose-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <XCircle size={15} className="text-rose-600" />
                  <span>الطلاب الغائبون ({absentList.length})</span>
                </button>
              </div>

              <div className="overflow-y-auto flex-1 space-y-3 pr-1 min-h-50">
                {isLoadingSheetDetails ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                    <Loader2 size={28} className="animate-spin text-[#0D8A82]" />
                    <span className="text-xs font-bold text-slate-600">جاري تحميل تفاصيل الكشف...</span>
                  </div>
                ) : isErrorSheetDetails ? (
                  <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-700 text-center space-y-2">
                    <p>{toArabicErrorMessage(errorSheetDetails, 'فشل تحميل تفاصيل الكشف')}</p>
                    <button
                      type="button"
                      onClick={() => refetchSheetDetails()}
                      className="inline-flex items-center gap-1 text-xs underline cursor-pointer"
                    >
                      <RefreshCw size={12} />
                      <span>إعادة المحاولة</span>
                    </button>
                  </div>
                ) : detailsTab === 'present' ? (
                  presentList.length === 0 ? (
                    <div className="py-10 text-center text-xs font-bold text-slate-500">
                      لا يوجد طلاب مسجل لهم حضور في هذه الجلسة
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {presentList.map((st) => (
                        <div
                          key={st._id}
                          className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 font-bold text-slate-800">
                            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                            <span>{st.name}</span>
                          </div>
                          {st.phone && (
                            <span className="text-slate-500 font-semibold dir-ltr text-right">
                              {st.phone}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                ) : absentList.length === 0 ? (
                  <div className="py-10 text-center text-xs font-bold text-emerald-700 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                    ممتاز! لا يوجد أي طلاب غائبين في هذه الجلسة 🎉
                  </div>
                ) : (
                  <div className="space-y-2">
                    {absentList.map((st) => (
                      <div
                        key={st._id}
                        className="p-3 rounded-xl bg-rose-50/50 border border-rose-200/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <XCircle size={15} className="text-rose-600 shrink-0" />
                          <span>{st.name}</span>
                        </div>
                        {st.phone && (
                          <span className="text-slate-500 font-semibold dir-ltr text-right">
                            {st.phone}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedSheetId(null)}
                  className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* QR Code Scanner Modal */}
      {selectedGroupId && (
        <QrAttendanceScannerModal
          isOpen={isQrScannerOpen}
          onClose={() => setIsQrScannerOpen(false)}
          groupId={selectedGroupId}
          groupName={activeGroups.find((g) => g._id === selectedGroupId)?.name}
        />
      )}

      {/* QR Code Print Modal */}
      {printStudentTarget && (
        <PrintStudentQrCardModal
          isOpen={Boolean(printStudentTarget)}
          onClose={() => setPrintStudentTarget(null)}
          studentId={printStudentTarget.id}
          studentName={printStudentTarget.name}
          studentPhone={printStudentTarget.phone}
          parentPhone={printStudentTarget.parentPhone}
          groupName={activeGroups.find((g) => g._id === selectedGroupId)?.name}
        />
      )}
    </div>
  );
};

export default TeacherAttendanceManager;
