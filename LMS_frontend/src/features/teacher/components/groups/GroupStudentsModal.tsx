import React from 'react';
import { Users, User, UserX, UserCheck, Phone, ArrowLeftRight, KeyRound, Loader2, AlertTriangle, RefreshCw, X, BarChart3 } from 'lucide-react';
import { useGroupStudents } from '../../hooks/useGroupStudents';
import { useDeactivateStudent } from '../../hooks/useDeactivateStudent';
import { useActivateStudent } from '../../hooks/useActivateStudent';
import { moveStudent } from '../../api/teacherGroupsApi';
import type { Group, GroupStudent } from '../../types/groupManagement';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';
import { StudentDetailsModal } from './StudentDetailsModal';

interface GroupStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  onMoveStudent: (student: GroupStudent, currentGroup: Group) => void;
  onResetPassword?: (student: GroupStudent, currentGroup: Group) => void;
}

export const GroupStudentsModal: React.FC<GroupStudentsModalProps> = ({
  isOpen,
  onClose,
  group,
  onMoveStudent,
  onResetPassword,
}) => {
  const toast = useToast();
  const groupId = group?._id || '';
  const { data: students, isLoading, isError, error, refetch } = useGroupStudents(groupId);
  const deactivateStudentMutation = useDeactivateStudent();
  const activateStudentMutation = useActivateStudent();

  const [studentToDeactivate, setStudentToDeactivate] = React.useState<GroupStudent | null>(null);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = React.useState<GroupStudent | null>(null);
  const [deactivatedStudentsMap, setDeactivatedStudentsMap] = React.useState<Record<string, GroupStudent>>({});

  // Combine query students + locally deactivated students
  const displayStudents = React.useMemo(() => {
    const list: GroupStudent[] = (students || []).map((s) => {
      // If student is marked deactivated locally, override
      if (deactivatedStudentsMap[s._id]) {
        return deactivatedStudentsMap[s._id];
      }
      return s;
    });

    // Append any locally deactivated student not in query list
    Object.values(deactivatedStudentsMap).forEach((ds) => {
      if (!list.some((s) => s._id === ds._id)) {
        list.push(ds);
      }
    });

    return list;
  }, [students, deactivatedStudentsMap]);

  const handleConfirmDeactivate = (student: GroupStudent) => {
    deactivateStudentMutation.mutate(student._id, {
      onSuccess: () => {
        toast.success(`تم تعطيل حساب الطالب (${student.name}) بنجاح.`);
        setDeactivatedStudentsMap((prev) => ({
          ...prev,
          [student._id]: { ...student, isDeactivated: true, isActive: false },
        }));
        setStudentToDeactivate(null);
        refetch();
      },
      onError: (err) => {
        toast.error(toArabicErrorMessage(err, 'حدث خطأ أثناء تعطيل حساب الطالب'));
      },
    });
  };

  const handleActivateStudent = async (student: GroupStudent) => {
    try {
      await activateStudentMutation.mutateAsync(student._id);
      
      // Assign back to group if needed
      if (groupId) {
        await moveStudent(student._id, { newGroupID: groupId }).catch(() => {});
      }

      setDeactivatedStudentsMap((prev) => {
        const next = { ...prev };
        delete next[student._id];
        return next;
      });

      toast.success(`تم إعادة تفعيل حساب الطالب (${student.name}) بنجاح! 🟢`);
      refetch();
    } catch (err) {
      toast.error(toArabicErrorMessage(err, 'حدث خطأ أثناء إعادت تفعيل حساب الطالب'));
    }
  };

  if (!isOpen || !group) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100">
                <Users size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">طلاب المجموعة ومتابعة السجل</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  اسم المجموعة: <span className="text-[#0D8A82] font-extrabold">{group.name}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto min-h-60 flex-1 space-y-4 pr-1 custom-scrollbar">
            {isLoading && (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 size={32} className="animate-spin text-[#0D8A82]" />
                <p className="text-xs font-bold text-slate-600">جاري تحميل الطلاب...</p>
              </div>
            )}

            {isError && (
              <div className="p-6 rounded-2xl border border-red-200 bg-red-50/40 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto border border-red-200">
                  <AlertTriangle size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">حدث خطأ أثناء تحميل بيانات الطلاب</h4>
                <p className="text-xs text-slate-600 font-semibold">
                  {toArabicErrorMessage(error, 'تعذر تحميل بيانات طلاب المجموعة.')}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs mt-1"
                >
                  <RefreshCw size={14} />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            )}

            {!isLoading && !isError && (!displayStudents || displayStudents.length === 0) && (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                  <Users size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-700">لا يوجد طلاب نشطون في هذه المجموعة حتى الآن</h4>
                <p className="text-xs text-slate-400 font-semibold max-w-xs mx-auto">
                  يمكنك إضافة الطلاب ونقلهم بين المجموعات عند بدء التنشيط.
                </p>
              </div>
            )}

            {!isLoading && !isError && displayStudents && displayStudents.length > 0 && (
              <div className="space-y-3">
                {displayStudents.map((student) => {
                  const isDeactivated = student.isDeactivated || student.isActive === false;

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
                            <Phone size={12} className="text-slate-400 shrink-0" />
                            <span>ولي الأمر: {student.parentPhone || 'غير متوفر'}</span>
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
                        <button
                          type="button"
                          onClick={() => onMoveStudent(student, group)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 text-[#0D8A82] hover:bg-teal-100 border border-teal-100 text-xs font-bold transition cursor-pointer shrink-0"
                        >
                          <ArrowLeftRight size={13} />
                          <span>نقل</span>
                        </button>
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
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-slate-500">
              {displayStudents ? `إجمالي الطلاب: ${displayStudents.length}` : ''}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

        {studentToDeactivate && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 mx-auto">
                <UserX size={24} />
              </div>

              <div className="text-center space-y-2">
                <h4 className="text-base font-extrabold text-slate-800">تأكيد تعطيل حساب الطالب</h4>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  هل أنت تأكد من تعطيل حساب الطالب <span className="text-rose-600 font-bold">({studentToDeactivate.name})</span> بالمنصة؟
                </p>
                <p className="text-[11px] text-slate-500 font-semibold bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
                  ⚠️ عند التعطيل لن يتمكن الطالب من تسجيل الدخول حتى يتم إعادة تنشيطه.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setStudentToDeactivate(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmDeactivate(studentToDeactivate)}
                  disabled={deactivateStudentMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {deactivateStudentMutation.isPending ? 'جاري التعطيل...' : 'تأكيد التعطيل 🛑'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <StudentDetailsModal
        isOpen={Boolean(selectedStudentForDetails)}
        onClose={() => setSelectedStudentForDetails(null)}
        student={selectedStudentForDetails}
        groupId={groupId}
      />
    </>
  );
};

export default GroupStudentsModal;
