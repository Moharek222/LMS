import React from 'react';
import { Users, User, Phone, ArrowLeftRight, Loader2, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useGroupStudents } from '../../hooks/useGroupStudents';
import type { Group, GroupStudent } from '../../types/groupManagement';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';

interface GroupStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  onMoveStudent: (student: GroupStudent, currentGroup: Group) => void;
}

export const GroupStudentsModal: React.FC<GroupStudentsModalProps> = ({
  isOpen,
  onClose,
  group,
  onMoveStudent,
}) => {
  const groupId = group?._id || '';
  const { data: students, isLoading, isError, error, refetch } = useGroupStudents(groupId);

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100">
              <Users size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">طلاب المجموعة</h3>
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

      
        <div className="overflow-y-auto min-h-60 flex-1 space-y-4 pr-1">
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
              <h4 className="text-sm font-bold text-slate-800">حدث خطأ أثناء تحميل قنوات الطلاب</h4>
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

          {!isLoading && !isError && (!students || students.length === 0) && (
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

          {!isLoading && !isError && students && students.length > 0 && (
            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User size={15} className="text-[#0D8A82]" />
                      <span className="text-xs font-bold text-slate-800">{student.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 font-semibold flex-wrap">
                      <div className="flex items-center gap-1">
                        <Phone size={12} className="text-slate-400" />
                        <span>الهاتف: {student.phone || 'غير متوفر'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone size={12} className="text-slate-400" />
                        <span>ولي الأمر: {student.parentPhone || 'غير متوفر'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onMoveStudent(student, group)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 text-[#0D8A82] hover:bg-teal-100 border border-teal-100 text-xs font-bold transition cursor-pointer shrink-0"
                  >
                    <ArrowLeftRight size={14} />
                    <span>نقل الطالب</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-500">
            {students ? `إجمالي الطلاب: ${students.length}` : ''}
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
    </div>
  );
};

export default GroupStudentsModal;
