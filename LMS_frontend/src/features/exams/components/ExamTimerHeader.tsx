import React from 'react';
import { Clock, ShieldCheck, Save } from 'lucide-react';

interface ExamTimerHeaderProps {
  title: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  saveIndicator: boolean;
  timeLeft: number | null;
  formatTime: (seconds: number) => string;
  answeredCount: number;
  progressPercent: number;
}

export const ExamTimerHeader: React.FC<ExamTimerHeaderProps> = ({
  title,
  currentQuestionIndex,
  totalQuestions,
  saveIndicator,
  timeLeft,
  formatTime,
  answeredCount,
  progressPercent,
}) => {
  const isUrgent = timeLeft !== null && timeLeft <= 60;
  const isWarning = timeLeft !== null && timeLeft <= 300 && !isUrgent;

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center shrink-0 border border-teal-100">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 line-clamp-1">{title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-400 font-semibold">
                السؤال {currentQuestionIndex + 1} من {totalQuestions}
              </span>
              {saveIndicator && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 animate-fade-in">
                  <Save size={10} />
                  <span>تم حفظ الإجابة تلقائياً 💾</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {timeLeft !== null && (
          <div
            className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border shadow-xs transition-all shrink-0 self-end sm:self-auto ${
              isUrgent
                ? 'bg-rose-950 text-rose-200 border-rose-800 animate-pulse'
                : isWarning
                ? 'bg-amber-950 text-amber-200 border-amber-800'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <Clock
              size={18}
              className={isUrgent ? 'text-rose-400 animate-spin' : isWarning ? 'text-amber-400 animate-bounce' : 'text-teal-400'}
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 leading-none">
                {isUrgent ? 'تنبيه حرج! الوقت ينتهي:' : isWarning ? 'تنبيه! متبقي أقل من 5 دقائق:' : 'الوقت المتبقي:'}
              </span>
              <span className={`font-mono text-sm font-black ${isUrgent ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
          <span>تقدم الحل: تمت الإجابة على {answeredCount} من أصل {totalQuestions} سؤالاً</span>
          <span className="text-[#0D8A82] font-black">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-[#0D8A82] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
