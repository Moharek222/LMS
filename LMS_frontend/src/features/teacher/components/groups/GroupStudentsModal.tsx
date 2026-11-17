import React from 'react';
import { Users, User, UserX, UserCheck, Phone, ArrowLeftRight, KeyRound, Loader2, AlertTriangle, RefreshCw, X, BarChart3, Search, GraduationCap, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useGroupStudents } from '../../hooks/useGroupStudents';
import { useDeactivateStudent } from '../../hooks/useDeactivateStudent';
import { useActivateStudent } from '../../hooks/useActivateStudent';
import { useDeleteStudent } from '../../hooks/useDeleteStudent';
import type { Group, GroupStudent } from '../../types/groupManagement';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';
import { StudentDetailsModal } from './StudentDetailsModal';
import { isStaticSecondSecGroup, getStaticTrackFromGroupId } from '../../utils/staticSecondSecGroups';
import { getAllStudentsApi } from '../../api/teacherAccessCodesApi';
import { Grade } from '../../../../types/grade';
import { AcademicTrack } from '../../../../types/academicTrack';

interface GroupStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  onMoveStudent: (student: GroupStudent, currentGroup: Group) => void;
  onResetPassword?: (student: GroupStudent, currentGroup: Group) => void;
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

export const GroupStudentsModal: React.FC<GroupStudentsModalProps> = ({
  isOpen,
  onClose,
  group,
  onMoveStudent,
  onResetPassword,
}) => {
  const toast = useToast();
  const groupId = group?._id || '';
  const isStatic = isStaticSecondSecGroup(groupId);
  const staticTrack = getStaticTrackFromGroupId(groupId);

  const {
    data: students,
    isLoading,
    isError,
    error,
    refetch,
  } = useGroupStudents(!isStatic ? groupId : '');

  const {
    data: allStudents,
    isLoading: isLoadingAllStudents,
    isError: isErrorAllStudents,
    error: errorAllStudents,
    refetch: refetchAllStudents,
  } = useQuery({
    queryKey: ['all-platform-students-for-group-modal'],
    queryFn: getAllStudentsApi,
    enabled: isStatic && isOpen,
    staleTime: 60 * 1000,
  });

  const staticStudents: GroupStudent[] = React.useMemo(() => {
    if (!allStudents || !staticTrack) return [];
    return allStudents
      .filter((s) => {
        const isSecondSec = s.grade === Grade.SecondSecondary || s.grade === 'second_secondary';
        const trackMatches =
          staticTrack === AcademicTrack.General
            ? s.academicTrack === AcademicTrack.General || s.academicTrack === 'general'
            : s.academicTrack === AcademicTrack.Baccalaureate || s.academicTrack === 'baccalaureate';
        return isSecondSec && trackMatches;
      })
      .map((s) => ({
        _id: s._id,
        name: s.name,
        phone: s.phone,
        parentPhone: s.parentPhone || '',
        grade: Grade.SecondSecondary,
      }));
  }, [allStudents, staticTrack]);

  const effectiveStudents = React.useMemo(() => {
    return isStatic ? staticStudents : (students || []);
  }, [isStatic, staticStudents, students]);
  const effectiveLoading = isStatic ? isLoadingAllStudents : isLoading;
  const effectiveError = isStatic ? isErrorAllStudents : isError;
  const effectiveErrorMessage = isStatic ? errorAllStudents : error;
  const effectiveRefetch = isStatic ? refetchAllStudents : refetch;

  const deactivateStudentMutation = useDeactivateStudent();
  const activateStudentMutation = useActivateStudent();
  const deleteStudentMutation = useDeleteStudent();

  const [studentToDeactivate, setStudentToDeactivate] = React.useState<GroupStudent | null>(null);
  const [studentToDelete, setStudentToDelete] = React.useState<GroupStudent | null>(null);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = React.useState<GroupStudent | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const filteredStudents = React.useMemo(() => {
    if (!effectiveStudents) return [];
    if (!searchQuery.trim()) return effectiveStudents;
    const q = normalizeArabic(searchQuery);

    return effectiveStudents.filter((s) => {
      const normName = normalizeArabic(s.name || '');
      const nameMatch = normName.includes(q);
      const phoneMatch = (s.phone || '').includes(searchQuery.trim());
      const parentMatch = (s.parentPhone || '').includes(searchQuery.trim());
      return nameMatch || phoneMatch || parentMatch;
    });
  }, [effectiveStudents, searchQuery]);

  const handleConfirmDeactivate = (student: GroupStudent) => {
    deactivateStudentMutation.mutate(student._id, {
      onSuccess: () => {
        toast.success(`تم تعطيل حساب الطالب (${student.name}) ونقله لصفحة (تفعيل الطلاب) 🔴`);
        setStudentToDeactivate(null);
        effectiveRefetch();
      },
      onError: (err) => {
        toast.error(toArabicErrorMessage(err, 'حدث خطأ أثناء تعطيل حساب الطالب'));
      },
    });
  };

  const handleActivateStudent = async (student: GroupStudent) => {
    try {
      await activateStudentMutation.mutateAsync(student._id);
      toast.success(`تم إعادة تفعيل حساب الطالب (${student.name}) بنجاح! 🟢`);
      effectiveRefetch();
    } catch (err) {
      toast.error(toArabicErrorMessage(err, 'حدث خطأ أثناء إعادة تفعيل حساب الطالب'));
    }
  };

  const handleConfirmDelete = async (student: GroupStudent) => {
    try {
      await deleteStudentMutation.mutateAsync(student._id);
      toast.success(`تم حذف الطالب (${student.name}) نهائياً من المنصة بنجاح.`);
      setStudentToDelete(null);
      effectiveRefetch();
    } catch (err) {
      toast.error(toArabicErrorMessage(err, 'حدث خطأ أثناء حذف الطالب'));
    }
  };

  if (!isOpen || !group) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                  isStatic
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-teal-50 text-[#0D8A82] border-teal-100'
                }`}
              >
                {isStatic ? <GraduationCap size={22} /> : <Users size={22} />}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">طلاب المجموعة ومتابعة السجل</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  اسم المجموعة: <span className="text-[#0D8A82] font-extrabold">{group.name}</span>
                  {isStatic && (
                    <span className="mr-2 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200 inline-flex items-center gap-1">
                      <GraduationCap size={11} />
                      <span>مجموعة تلقائية حسب المسار</span>
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الطالب أو رقم الهاتف أو هاتف ولي الأمر..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition"
            />
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-60">
            {effectiveLoading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-3">
                <Loader2 size={32} className="animate-spin text-[#0D8A82]" />
                <p className="text-xs font-bold text-slate-500">جاري تحميل طلاب المجموعة...</p>
              </div>
            ) : effectiveError ? (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between gap-3 text-red-700 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} />
                  <span>{toArabicErrorMessage(effectiveErrorMessage, 'حدث خطأ أثناء تحميل الطلاب')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => effectiveRefetch()}
                  className="inline-flex items-center gap-1 text-xs underline cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Users size={36} className="mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-600">
                  {searchQuery.trim()
                    ? 'لم يتم العثور على طلاب يطابقون بحثك'
                    : 'لا يوجد طلاب مسجلون في هذه المجموعة حالياً'}
                </p>
                <p className="text-xs text-slate-400">
                  {isStatic
                    ? 'عندما يسجل أي طالب في الصف الثاني الثانوي ويختار هذا المسار، سيظهر هنا فوراً.'
                    : 'الطلاب المسجلون في هذه المجموعة سيظهرون هنا تلقائياً.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredStudents.map((student) => {
                  const isDeactivated = Boolean(student.isDeactivated || student.isActive === false);

                  return (
                    <div
                      key={student._id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3.5 w-full min-w-0 overflow-hidden"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <User size={15} className="text-[#0D8A82] shrink-0" />
                          <span className="text-xs font-extrabold text-slate-800 break-words">{student.name}</span>
                          {isDeactivated ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-1 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                              <span>حساب معطل 🔴</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>نشط ومفعل 🟢</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 font-semibold flex-wrap">
                          <div className="flex items-center gap-1">
                            <Phone size={12} className="text-slate-400 shrink-0" />
                            <span>الهاتف: {student.phone || 'غير متوفر'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone size={12} className="text-amber-600 shrink-0" />
                            <span className={student.parentPhone ? "text-amber-800 font-bold" : "text-slate-400"}>
                              ولي الأمر: {student.parentPhone || 'غير مسجل'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForDetails(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 text-xs font-bold transition cursor-pointer shadow-2xs shrink-0"
                          title="متابعة نسبة الحضور والمشاهدات والكويزات"
                        >
                          <BarChart3 size={13} />
                          <span>السجل والتقدم</span>
                        </button>

                        {onResetPassword && (
                          <button
                            type="button"
                            onClick={() => onResetPassword(student, group)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/80 text-xs font-bold transition cursor-pointer shrink-0"
                            title="تعيين كلمة مرور جديدة للطالب"
                          >
                            <KeyRound size={13} />
                            <span>كلمة السر</span>
                          </button>
                        )}
                        {!isStatic && (
                          <button
                            type="button"
                            onClick={() => onMoveStudent(student, group)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-[#0D8A82] hover:bg-teal-100 border border-teal-100 text-xs font-bold transition cursor-pointer shrink-0"
                          >
                            <ArrowLeftRight size={13} />
                            <span>نقل</span>
                          </button>
                        )}
                        {isDeactivated ? (
                          <button
                            type="button"
                            onClick={() => handleActivateStudent(student)}
                            disabled={activateStudentMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition cursor-pointer shrink-0"
                            title="إعادة تفعيل حساب الطالب"
                          >
                            <UserCheck size={13} />
                            <span>{activateStudentMutation.isPending ? 'جاري التفعيل...' : 'تفعيل'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setStudentToDeactivate(student)}
                            disabled={deactivateStudentMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80 text-xs font-bold transition cursor-pointer shrink-0"
                            title="تعطيل حساب الطالب"
                          >
                            <UserX size={13} />
                            <span>تعطيل</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setStudentToDelete(student)}
                          disabled={deleteStudentMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/80 text-xs font-bold transition cursor-pointer shrink-0"
                          title="حذف حساب الطالب نهائياً من المنصة"
                        >
                          <Trash2 size={13} />
                          <span>حذف نهائي</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-slate-500">
              {searchQuery.trim()
                ? `نتائج البحث: ${filteredStudents.length} من أصل ${effectiveStudents.length} طالب`
                : `إجمالي طلاب المجموعة: ${effectiveStudents.length} طالب`}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>

        </div>
      </div>

      {studentToDeactivate && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
                <AlertTriangle size={20} />
              </div>
              <h4 className="text-sm font-bold">تأكيد تعطيل حساب الطالب</h4>
            </div>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              هل أنت متأكد من رغبتك في تعطيل حساب الطالب <span className="text-slate-900 font-extrabold font-mono">({studentToDeactivate.name})</span>؟ سيتم منعه من الدخول للمنصة ونقله إلى صفحة تفعيل الطلاب الموقوفين.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDeactivate(null)}
                disabled={deactivateStudentMutation.isPending}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDeactivate(studentToDeactivate)}
                disabled={deactivateStudentMutation.isPending}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                {deactivateStudentMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                <span>نعم، تعطيل الحساب</span>
              </button>
            </div>
          </div>
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

      {selectedStudentForDetails && (
        <StudentDetailsModal
          isOpen={Boolean(selectedStudentForDetails)}
          onClose={() => setSelectedStudentForDetails(null)}
          student={selectedStudentForDetails}
          groupId={group._id}
        />
      )}
    </>
  );
};

export default GroupStudentsModal;
