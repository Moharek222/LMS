import React, { useState, useMemo } from 'react';
import {
  Users,
  User,
  Phone,
  CheckCircle2,
  Loader2,
  RefreshCw,
  X,
  Printer,
  Search,
} from 'lucide-react';
import type { GroupStudent } from '../../types/groupManagement';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';

interface GroupStudentsAttendanceRosterProps {
  students: GroupStudent[] | undefined;
  isLoadingStudents: boolean;
  isErrorStudents: boolean;
  errorStudents: unknown;
  onRefetchStudents: () => void;
  recordingStudentId: string | null;
  isRecordingPending: boolean;
  onRecordAttendance: (studentId: string, studentName: string) => void;
  onPrintStudentQr: (student: {
    id: string;
    name: string;
    phone?: string;
    parentPhone?: string;
  }) => void;
}

const normalizeArabic = (text: string) => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '');
};

export const GroupStudentsAttendanceRoster: React.FC<GroupStudentsAttendanceRosterProps> = ({
  students,
  isLoadingStudents,
  isErrorStudents,
  errorStudents,
  onRefetchStudents,
  recordingStudentId,
  isRecordingPending,
  onRecordAttendance,
  onPrintStudentQr,
}) => {
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    if (!studentSearchQuery.trim()) return students;
    const q = normalizeArabic(studentSearchQuery);
    return students.filter((s) => {
      const nameMatch = normalizeArabic(s.name || '').includes(q);
      const phoneMatch = (s.phone || '').includes(studentSearchQuery.trim());
      const parentMatch = (s.parentPhone || '').includes(studentSearchQuery.trim());
      return nameMatch || phoneMatch || parentMatch;
    });
  }, [students, studentSearchQuery]);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col min-h-96">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
          <Users size={18} className="text-[#0D8A82]" />
          <span>قائمة طلاب المجموعة</span>
        </h4>
        {students && (
          <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-[#0D8A82] text-xs font-bold border border-teal-100">
            {studentSearchQuery.trim()
              ? `النتائج: ${filteredStudents.length} من ${students.length}`
              : `${students.length} طالب`}
          </span>
        )}
      </div>

      {/* Instant Student Search Bar */}
      {students && students.length > 0 && (
        <div className="relative">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={studentSearchQuery}
            onChange={(e) => setStudentSearchQuery(e.target.value)}
            placeholder="ابحث باسم الطالب، رقم هاتفه، أو هاتف ولي الأمر..."
            className="w-full pr-10 pl-9 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] bg-slate-50/70 transition"
          />
          {studentSearchQuery && (
            <button
              type="button"
              onClick={() => setStudentSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              title="مسح البحث"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

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
            onClick={onRefetchStudents}
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
      ) : filteredStudents.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto border border-amber-200">
            <Search size={20} />
          </div>
          <h5 className="text-xs font-bold text-slate-700">لا توجد نتائج مطابقة لبحثك</h5>
          <p className="text-[11px] text-slate-400">"{studentSearchQuery}"</p>
          <button
            type="button"
            onClick={() => setStudentSearchQuery('')}
            className="text-xs text-[#0D8A82] font-bold hover:underline cursor-pointer pt-1"
          >
            مسح البحث وعرض جميع الطلاب
          </button>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-115 pr-1">
          {filteredStudents.map((student) => {
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
                      onPrintStudentQr({
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
                    onClick={() => onRecordAttendance(student._id, student.name)}
                    disabled={isRecordingPending}
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
  );
};

