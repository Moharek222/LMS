import React, { useState } from 'react';
import { CalendarCheck, CheckCircle2, XCircle, Loader2, RefreshCw, X } from 'lucide-react';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';

interface SheetStudentStatus {
  _id: string;
  name: string;
  phone?: string;
  status: 'Present' | 'Absent' | string;
}

interface AttendanceSheetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetDate?: string;
  studentStatuses: SheetStudentStatus[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRefetch: () => void;
  formatDate: (dateStr: string) => string;
}

export const AttendanceSheetDetailsModal: React.FC<AttendanceSheetDetailsModalProps> = ({
  isOpen,
  onClose,
  sheetDate,
  studentStatuses,
  isLoading,
  isError,
  error,
  onRefetch,
  formatDate,
}) => {
  const [detailsTab, setDetailsTab] = useState<'present' | 'absent'>('present');

  if (!isOpen) return null;

  const presentList = studentStatuses.filter((s) => s.status === 'Present');
  const absentList = studentStatuses.filter((s) => s.status === 'Absent');

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
            onClick={onClose}
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
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
              <Loader2 size={28} className="animate-spin text-[#0D8A82]" />
              <span className="text-xs font-bold text-slate-600">جاري تحميل تفاصيل الكشف...</span>
            </div>
          ) : isError ? (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-700 text-center space-y-2">
              <p>{toArabicErrorMessage(error, 'فشل تحميل تفاصيل الكشف')}</p>
              <button
                type="button"
                onClick={onRefetch}
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
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

