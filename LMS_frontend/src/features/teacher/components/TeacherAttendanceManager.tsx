import React, { useState } from 'react';
import {
  CalendarCheck,
  Users,
  User,
  Phone,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  X,
  QrCode,
  ArrowRightLeft,
  Printer,
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
import { MoveStudentModal } from './groups/MoveStudentModal';
import { PrintStudentQrCardModal } from '../../student/components/PrintStudentQrCardModal';

export const TeacherAttendanceManager: React.FC = () => {
  const toast = useToast();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [sheetsPage, setSheetsPage] = useState<number>(1);
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);
  const [recordingStudentId, setRecordingStudentId] = useState<string | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [moveStudentTarget, setMoveStudentTarget] = useState<{ id: string; name: string } | null>(null);
  const [printStudentTarget, setPrintStudentTarget] = useState<{
    id: string;
    name: string;
    phone?: string;
  } | null>(null);

  // 1. Fetch active teacher groups
  const {
    data: groupsData,
    isLoading: isLoadingGroups,
    isError: isErrorGroups,
    error: errorGroups,
    refetch: refetchGroups,
  } = useTeacherGroups({ limit: 100 });

  const activeGroups = (groupsData?.data || []).filter((g) => g.isActive !== false);

  // 2. Fetch students for selected group
  const {
    data: students,
    isLoading: isLoadingStudents,
    isError: isErrorStudents,
    error: errorStudents,
    refetch: refetchStudents,
  } = useGroupStudents(selectedGroupId);

  // 3. Fetch attendance sheets for selected group
  const {
    data: sheetsData,
    isLoading: isLoadingSheets,
    isError: isErrorSheets,
    error: errorSheets,
    refetch: refetchSheets,
  } = useGroupAttendanceSheets(selectedGroupId, sheetsPage, 10);

  // 4. Fetch sheet details when a sheet is selected
  const {
    data: sheetDetailsData,
    isLoading: isLoadingSheetDetails,
    isError: isErrorSheetDetails,
    error: errorSheetDetails,
    refetch: refetchSheetDetails,
  } = useAttendanceSheetDetails(selectedGroupId, selectedSheetId || undefined);

  // 5. Attendance recording mutation
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
            <CalendarCheck size={24} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800">نظام تسجيل الحضور والغياب</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              تسجيل حضور وغياب الطلاب بالـ QR Code واستعراض كشوف الجلسات
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

      {/* Step 1: Select Active Group */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
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

      {/* Main Content Area after Group Selection */}
      {selectedGroupId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Group Roster & Manual Attendance Marking */}
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
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setPrintStudentTarget({
                              id: student._id,
                              name: student.name,
                              phone: student.phone,
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
                          onClick={() => setMoveStudentTarget({ id: student._id, name: student.name })}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                          title="نقل الطالب لمجموعة أخرى"
                        >
                          <ArrowRightLeft size={13} />
                          <span className="hidden sm:inline">نقل</span>
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

          {/* Right Column: Attendance Sheets History */}
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

            {/* Server Pagination for Sheets */}
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
      {selectedSheetId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100">
                  <CalendarCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">تفاصيل كشف الحضور</h4>
                  {sheetDetailsData?.data?.date && (
                    <p className="text-xs text-slate-500 font-medium">
                      التاريخ: {formatDate(sheetDetailsData.data.date)}
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
              ) : !sheetDetailsData?.data?.presentStudents ||
                sheetDetailsData.data.presentStudents.length === 0 ? (
                <div className="py-10 text-center text-xs font-bold text-slate-500">
                  لا يوجد طلاب مسجل لهم حضور في هذه الورقة
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1">
                    <span>قائمة الطلاب الحاضرين:</span>
                    <span className="text-[#0D8A82]">
                      إجمالي الحضور: {sheetDetailsData.data.presentStudents.length}
                    </span>
                  </div>

                  {sheetDetailsData.data.presentStudents.map((st) => (
                    <div
                      key={st._id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <CheckCircle2 size={15} className="text-emerald-600" />
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
      )}

      {/* QR Attendance Scanner Modal */}
      {selectedGroupId && (
        <QrAttendanceScannerModal
          isOpen={isQrScannerOpen}
          onClose={() => setIsQrScannerOpen(false)}
          groupId={selectedGroupId}
          groupName={activeGroups.find((g) => g._id === selectedGroupId)?.name}
        />
      )}

      {/* Move Student Modal */}
      {moveStudentTarget && selectedGroupId && (
        <MoveStudentModal
          isOpen={Boolean(moveStudentTarget)}
          onClose={() => setMoveStudentTarget(null)}
          studentId={moveStudentTarget.id}
          studentName={moveStudentTarget.name}
          currentGroupId={selectedGroupId}
        />
      )}

      {/* Print Student QR Card Modal */}
      {printStudentTarget && (
        <PrintStudentQrCardModal
          isOpen={Boolean(printStudentTarget)}
          onClose={() => setPrintStudentTarget(null)}
          studentId={printStudentTarget.id}
          studentName={printStudentTarget.name}
          studentPhone={printStudentTarget.phone}
          groupName={activeGroups.find((g) => g._id === selectedGroupId)?.name}
        />
      )}
    </div>
  );
};

export default TeacherAttendanceManager;
