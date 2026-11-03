import React from 'react';
import { Clock, Award, Calendar, CheckCircle2 } from 'lucide-react';

export interface MonthlySessionSlot {
  sessionNumber: number;
  title: string;
  sheetId?: string;
  date?: string;
  formattedDate?: string;
  presentCount?: number;
  totalStudents?: number;
  status: 'recorded' | 'upcoming';
}

interface MonthlyAttendanceControlPanelProps {
  selectedMonthLabel: string;
  monthAttendancePercentage: number;
  recordedCount: number;
  monthlySlots: MonthlySessionSlot[];
  onSelectSheet: (sheetId: string) => void;
  onOpenQrScanner: () => void;
}

export const MonthlyAttendanceControlPanel: React.FC<MonthlyAttendanceControlPanelProps> = ({
  selectedMonthLabel,
  monthAttendancePercentage,
  recordedCount,
  monthlySlots,
  onSelectSheet,
  onOpenQrScanner,
}) => {
  return (
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
              عرض كشوف الحصص الـ 8 المحددة للمجموعة لشهـر {selectedMonthLabel}
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
                    onClick={() => onSelectSheet(slot.sheetId!)}
                    className="w-full py-2 rounded-xl bg-white text-[#0D8A82] hover:bg-teal-50 border border-teal-200 text-xs font-bold transition cursor-pointer text-center"
                  >
                    عرض التفاصيل 🔍
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenQrScanner}
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
  );
};

