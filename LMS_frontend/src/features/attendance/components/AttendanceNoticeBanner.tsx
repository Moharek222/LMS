import React from 'react';
import { Compass, CalendarCheck, AlertTriangle } from 'lucide-react';
import { Grade } from '../../../types/grade';

interface AttendanceNoticeBannerProps {
  isSecondSecondary: boolean;
  hasNoGroup: boolean;
  grade?: Grade;
}

export const AttendanceNoticeBanner: React.FC<AttendanceNoticeBannerProps> = ({
  isSecondSecondary,
  hasNoGroup,
}) => {
  if (isSecondSecondary) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4 text-center sm:text-right">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center shrink-0 border border-teal-100 shadow-2xs">
            <Compass size={30} />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                الصف الثاني الثانوي • مسار إلكتروني تفاعلي
              </h3>
              <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-[#0D8A82] text-xs font-bold border border-teal-100">
                دراسة أونلاين
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed">
              حسابك مقيد بالمسار الإلكتروني بالمنصة مباشرة. يتم احتساب انضباطك وتقدمك الدراسي من خلال
              متابعة المحاضرات وحل كويزات الدروس والامتحانات، ولا تنطبق عليك مجموعات الحضور الميداني بالسنتر.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs text-slate-600 font-bold flex items-center gap-2.5">
          <CalendarCheck size={18} className="text-[#0D8A82] shrink-0" />
          <span>
            سجل الحضور والغياب اليدوي مخصص فقط للمجموعات الميدانية. تقدمك التعليمي يُرصد تلقائياً في شاشة &quot;المحاضرات والدروس&quot;.
          </span>
        </div>
      </div>
    );
  }

  if (hasNoGroup) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle size={28} />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h4 className="text-base font-extrabold text-slate-800">سجل انضباط الحضور والغياب</h4>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            لم يتم ربط حسابك بمجموعة دراسية بعد. يرجى التواصل مع المعلم أو إدارة السنتر لتأكيد إسنادك لمجموعتك الدراسية لمتابعة حضورك وغيابك.
          </p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 max-w-md mx-auto text-xs text-slate-600 font-bold">
          💡 يتم تسجيل الحضور والغياب إلكترونياً وتلقائياً أثناء الحصص في السنتر بواسطة المعلم.
        </div>
      </div>
    );
  }

  return null;
};

