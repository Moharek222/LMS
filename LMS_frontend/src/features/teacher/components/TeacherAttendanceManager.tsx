import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Clock,
  Loader2,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  QrCode,
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
import { Grade, GRADE_OPTIONS, getGradeShortLabel } from '../../../types/grade';
import { QrAttendanceScannerModal } from './attendance/QrAttendanceScannerModal';
import { PrintStudentQrCardModal } from '../../student/components/PrintStudentQrCardModal';
import { MonthlyAttendanceControlPanel } from './attendance/MonthlyAttendanceControlPanel';
import { GroupStudentsAttendanceRoster } from './attendance/GroupStudentsAttendanceRoster';
import { AttendanceSheetDetailsModal } from './attendance/AttendanceSheetDetailsModal';

const ALLOWED_GROUP_GRADES = GRADE_OPTIONS.filter((opt) => opt.value !== Grade.SecondSecondary);

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
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'ALL' | Grade>('ALL');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [sheetsPage, setSheetsPage] = useState<number>(1);
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);
  const [recordingStudentId, setRecordingStudentId] = useState<string | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [printStudentTarget, setPrintStudentTarget] = useState<{
    id: string;
    name: string;
    phone?: string;
    parentPhone?: string;
  } | null>(null);

  const currentDate = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState<string>(() => String(currentDate.getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState<string>(() =>
    String(currentDate.getMonth() + 1).padStart(2, '0')
  );

  const selectedMonthKey = `${selectedYear}-${selectedMonth}`;

  const {
    data: groupsData,
    isLoading: isLoadingGroups,
    isError: isErrorGroups,
    error: errorGroups,
    refetch: refetchGroups,
  } = useTeacherGroups({ limit: 100 });

  const activeGroups = (groupsData?.data || []).filter((g) => g.isActive !== false);

  const filteredActiveGroups = useMemo(() => {
    if (selectedGradeFilter === 'ALL') return activeGroups;
    return activeGroups.filter((g) => g.grade === selectedGradeFilter);
  }, [activeGroups, selectedGradeFilter]);

  const {
    data: students,
    isLoading: isLoadingStudents,
    isError: isErrorStudents,
    error: errorStudents,
    refetch: refetchStudents,
  } = useGroupStudents(selectedGroupId);

  const {
    data: sheetsData,
    isLoading: isLoadingSheets,
    isError: isErrorSheets,
    error: errorSheets,
    refetch: refetchSheets,
  } = useGroupAttendanceSheets(selectedGroupId, sheetsPage, 100);

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

  const {
    data: sheetDetailsData,
    isLoading: isLoadingSheetDetails,
    isError: isErrorSheetDetails,
    error: errorSheetDetails,
    refetch: refetchSheetDetails,
  } = useAttendanceSheetDetails(selectedGroupId, selectedSheetId || undefined);

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

  const sheets = useMemo(() => sheetsData?.data || [], [sheetsData]);
  const totalSheetsPages = sheetsData?.totalPages || 1;

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
        {/* Grade Filter Tabs */}
        {activeGroups.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <span className="text-xs font-bold text-slate-500 shrink-0 ml-1">تصفية بالمرحلة:</span>
            <button
              type="button"
              onClick={() => setSelectedGradeFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border ${
                selectedGradeFilter === 'ALL'
                  ? 'bg-[#0D8A82] text-white border-[#0D8A82] shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              الكل ({activeGroups.length})
            </button>
            {ALLOWED_GROUP_GRADES.map((opt) => {
              const count = activeGroups.filter((g) => g.grade === opt.value).length;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedGradeFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border ${
                    selectedGradeFilter === opt.value
                      ? 'bg-[#0D8A82] text-white border-[#0D8A82] shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.shortLabel} ({count})
                </button>
              );
            })}
          </div>
        )}

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
            ) : filteredActiveGroups.length === 0 ? (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
                لا توجد مجموعات لهذه المرحلة الدراسية.
              </div>
            ) : (
              <select
                dir="rtl"
                value={selectedGroupId}
                onChange={handleGroupChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-right text-sm font-medium focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] transition outline-none"
              >
                <option value="">اختر المجموعة الدراسية</option>
                {filteredActiveGroups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name} {g.grade ? `— (${getGradeShortLabel(g.grade)})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedGroupId && (
            <>
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

      {/* 8-Sessions Monthly Control View */}
      {selectedGroupId && (
        <MonthlyAttendanceControlPanel
          selectedMonthLabel={selectedMonthLabel}
          monthAttendancePercentage={monthAttendancePercentage}
          recordedCount={recordedCount}
          monthlySlots={monthlySlots}
          onSelectSheet={(sheetId) => setSelectedSheetId(sheetId)}
          onOpenQrScanner={() => setIsQrScannerOpen(true)}
        />
      )}

      {/* Roster & History Grid */}
      {selectedGroupId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GroupStudentsAttendanceRoster
            key={selectedGroupId}
            students={students}
            isLoadingStudents={isLoadingStudents}
            isErrorStudents={isErrorStudents}
            errorStudents={errorStudents}
            onRefetchStudents={() => refetchStudents()}
            recordingStudentId={recordingStudentId}
            isRecordingPending={recordAttendanceMutation.isPending}
            onRecordAttendance={handleRecordAttendance}
            onPrintStudentQr={(target) => setPrintStudentTarget(target)}
          />

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
      <AttendanceSheetDetailsModal
        isOpen={Boolean(selectedSheetId)}
        onClose={() => setSelectedSheetId(null)}
        sheetDate={sheetDetailsData?.date}
        studentStatuses={sheetDetailsData?.data || []}
        isLoading={isLoadingSheetDetails}
        isError={isErrorSheetDetails}
        error={errorSheetDetails}
        onRefetch={() => refetchSheetDetails()}
        formatDate={formatDate}
      />

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
