import React, { useState } from 'react';
import {
  UserCheck,
  UserX,
  Search,
  Phone,
  FolderKanban,
  CheckCircle2,
  Loader2,
  RefreshCw,
  GraduationCap,
  Trash2,
} from 'lucide-react';
import { useActivateStudent } from '../hooks/useActivateStudent';
import { useDeleteStudent } from '../hooks/useDeleteStudent';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { useDeactivatedStudents } from '../hooks/useDeactivatedStudents';
import { useToast } from '../../../context/ToastContext';
import { Grade, GRADE_OPTIONS, getGradeBadgeStyle, getGradeShortLabel } from '../../../types/grade';
import { AcademicTrack } from '../../../types/academicTrack';
import type { DeactivatedStudent } from '../types/groupManagement';

export interface DeactivatedStudentViewItem {
  _id: string;
  name: string;
  phone: string;
  parentPhone: string;
  groupId?: string;
  groupName?: string;
  grade?: Grade;
  academicTrack?: AcademicTrack | string;
  deactivatedAt: string;
}

export const DeactivatedStudentsManager: React.FC = () => {
  const toast = useToast();
  const activateStudentMutation = useActivateStudent();
  const deleteStudentMutation = useDeleteStudent();
  const { data: apiData, isLoading, refetch } = useDeactivatedStudents({ page: 1, limit: 100 });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'ALL' | Grade>('ALL');
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<DeactivatedStudentViewItem | null>(null);

  const displayStudents = React.useMemo<DeactivatedStudentViewItem[]>(() => {
    if (!apiData?.data || !Array.isArray(apiData.data)) return [];
    return apiData.data.map((s: DeactivatedStudent) => {
      const groupObj = typeof s.groupID === 'object' ? s.groupID : null;
      const studentGrade = s.grade || groupObj?.grade;
      const isSecondSec = studentGrade === Grade.SecondSecondary;
      return {
        _id: s._id,
        name: s.name,
        phone: s.phone || '',
        parentPhone: s.parentPhone || '',
        groupId: groupObj?._id || (typeof s.groupID === 'string' ? s.groupID : undefined),
        groupName: isSecondSec ? undefined : (groupObj?.name || (s.groupID ? 'مجموعة دراسية' : undefined)),
        grade: studentGrade,
        academicTrack: s.academicTrack,
        deactivatedAt: s.updatedAt || s.createdAt || '',
      };
    });
  }, [apiData]);

  const handleActivate = async (student: DeactivatedStudentViewItem) => {
    setActivatingId(student._id);
    try {
      await activateStudentMutation.mutateAsync(student._id);
      await refetch();

      toast.success(
        student.grade === Grade.SecondSecondary
          ? `تم إعادة تفعيل الطالب (${student.name}) بنجاح! 🟢`
          : student.groupName
          ? `تم إعادة تفعيل الطالب (${student.name}) بنجاح وعودته لمجموعة (${student.groupName})! 🟢`
          : `تم إعادة تفعيل الطالب (${student.name}) بنجاح! 🟢`
      );
    } catch (err) {
      toast.error(toArabicErrorMessage(err, 'حدث خطأ أثناء إعادة تفعيل الطالب'));
    } finally {
      setActivatingId(null);
    }
  };

  const handleConfirmDelete = async (student: DeactivatedStudentViewItem) => {
    try {
      await deleteStudentMutation.mutateAsync(student._id);
      await refetch();
      toast.success(`تم حذف الطالب (${student.name}) نهائياً من المنصة بنجاح.`);
      setStudentToDelete(null);
    } catch (err) {
      toast.error(toArabicErrorMessage(err, 'حدث خطأ أثناء حذف الطالب'));
    }
  };

  const filteredStudents = displayStudents.filter((s) => {
    if (selectedGradeFilter !== 'ALL' && s.grade !== selectedGradeFilter) return false;
    if (!searchQuery.trim()) return true;
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery) ||
      (s.parentPhone && s.parentPhone.includes(searchQuery)) ||
      (s.groupName && s.groupName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-rose-700 via-rose-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <UserCheck size={28} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black">إدارة وتفعيل الطلاب المعطلين</h2>
                <span className="px-3 py-1 rounded-full bg-rose-500/30 border border-rose-400/40 text-rose-100 text-xs font-bold">
                  {displayStudents.length} طالب معطل
                </span>
              </div>
              <p className="text-xs sm:text-sm text-rose-100/90 font-medium mt-1 max-w-2xl">
                استعراض الحسابات المعطلة مؤقتاً وإعادة تنشيطها بنقرة واحدة لتعود فوراً إلى مجموعاتها السابقة.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>تحديث القائمة</span>
          </button>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث باسم الطالب أو رقم الهاتف..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition"
            />
            <Search size={16} className="absolute right-3.5 top-3 text-slate-400" />
          </div>

          {/* Grade filter tabs */}
          {displayStudents.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedGradeFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  selectedGradeFilter === 'ALL'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                الكل ({displayStudents.length})
              </button>
              {GRADE_OPTIONS.map((opt) => {
                const count = displayStudents.filter((s) => s.grade === opt.value).length;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedGradeFilter(opt.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      selectedGradeFilter === opt.value
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt.shortLabel} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <span className="text-xs font-extrabold text-slate-500 shrink-0">
          إجمالي المعطلين: <span className="text-rose-600 font-black">{filteredStudents.length}</span> طالب
        </span>
      </div>

      {/* Deactivated Students List */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 size={32} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800">لا يوجد طلاب معطلون حالياً</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              جميع حسابات الطلاب مفعلة ونشطة في مجموعاتهم الدراسية بشكل طبيعي.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudents.map((student) => {
            const isActivating = activatingId === student._id;

            return (
              <div
                key={student._id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4 relative overflow-hidden group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                      <UserX size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-slate-800">{student.name}</h4>
                        {student.grade && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getGradeBadgeStyle(student.grade).pill}`}>
                            {getGradeShortLabel(student.grade)}
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          <span>معطل 🔴</span>
                        </span>
                      </div>
                      {student.grade === Grade.SecondSecondary ? (
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 mt-1 inline-flex items-center gap-1">
                          <GraduationCap size={12} />
                          <span>
                            {student.academicTrack === AcademicTrack.General || student.academicTrack === 'general'
                              ? 'تانية ثانوي • مسار عام'
                              : student.academicTrack === AcademicTrack.Baccalaureate || student.academicTrack === 'baccalaureate'
                              ? 'تانية ثانوي • مسار بكالوريا'
                              : 'تانية ثانوي • طالب أونلاين'}
                          </span>
                        </span>
                      ) : student.groupName ? (
                        <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 mt-1 inline-flex items-center gap-1">
                          <FolderKanban size={12} />
                          <span>المجموعة: {student.groupName}</span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-500 font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Phone size={12} className="text-slate-400" />
                      <span>رقم الهاتف:</span>
                    </span>
                    <span className="font-extrabold text-slate-700">{student.phone || 'غير متوفر'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Phone size={12} className="text-slate-400" />
                      <span>ولي الأمر:</span>
                    </span>
                    <span className={student.parentPhone ? "font-extrabold text-amber-700 dir-ltr" : "font-semibold text-slate-400"}>
                      {student.parentPhone || 'غير مسجل'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleActivate(student)}
                    disabled={isActivating || deleteStudentMutation.isPending}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-black transition cursor-pointer shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isActivating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>جاري التفعيل...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck size={16} />
                        <span>تفعيل الطالب 🟢</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudentToDelete(student)}
                    disabled={isActivating || deleteStudentMutation.isPending}
                    className="px-3.5 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold transition cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 shrink-0"
                    title="حذف حساب الطالب نهائياً من قاعدة البيانات"
                  >
                    <Trash2 size={15} />
                    <span>حذف نهائي</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {studentToDelete && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
                <Trash2 size={20} />
              </div>
              <h4 className="text-sm font-bold">تأكيد الحذف النهائي لحساب الطالب</h4>
            </div>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              هل أنت متأكد تماماً من رغبتك في حذف الطالب <span className="text-slate-900 font-extrabold font-mono">({studentToDelete.name})</span> نهائياً من المنصة؟
              <br />
              <span className="text-red-600 font-bold block mt-1">
                ⚠️ تحذير: هذا الإجراء نهائي ولا يمكن التراجع عنه، وسيتم مسح بيانات حساب الطالب بالكامل من قاعدة البيانات.
              </span>
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                disabled={deleteStudentMutation.isPending}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(studentToDelete)}
                disabled={deleteStudentMutation.isPending}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                {deleteStudentMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                <span>نعم، حذف نهائي</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeactivatedStudentsManager;
