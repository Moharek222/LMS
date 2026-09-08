import React from 'react';
import { Sparkles, ArrowLeft, BookOpen, PlayCircle } from 'lucide-react';

interface NextActionWidgetProps {
  onStartLearning: () => void;
  hasCourses?: boolean;
  firstCourseTitle?: string;
}

export const NextActionWidget: React.FC<NextActionWidgetProps> = ({
  onStartLearning,
  hasCourses = true,
  firstCourseTitle,
}) => {
  return (
    <div className="bg-linear-to-br from-slate-900 via-[#091523] to-[#0D8A82] rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col justify-between h-full relative overflow-hidden">
      
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-teal-400 animate-pulse" />
            <h3 className="text-sm font-extrabold text-white">خطوتك القادمة</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/30">
            توجيه دراسي
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30 mt-0.5">
              {hasCourses ? <PlayCircle size={22} /> : <BookOpen size={22} />}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-100">
                {hasCourses ? 'تابع تحصيلك في المواد الدراسية' : 'ابدأ رحلتك في الكيمياء'}
              </h4>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                {hasCourses
                  ? firstCourseTitle
                    ? `اختر مقرر "${firstCourseTitle}" أو تصفح الدروس لبدء مشاهدة المحاضرة والتفاعل مع التقييمات.`
                    : 'اختر المادة الدراسية واستكمل مشاهدة المحاضرات والدروس المتاحة لك.'
                  : 'تصفح المقررات الدراسية المتاحة وابدأ أول محطة تعليمية لك اليوم.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-800/80">
        <button
          onClick={onStartLearning}
          className="w-full py-2.5 px-4 rounded-xl bg-[#0D8A82] hover:bg-teal-600 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm group"
        >
          <span>{hasCourses ? 'الانتقال للمحاضرات والدروس' : 'استكشاف المقررات'}</span>
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default NextActionWidget;
