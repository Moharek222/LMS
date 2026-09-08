import React from 'react';
import { BarChart2 } from 'lucide-react';

export interface GradeBreakdown {
  label: string;
  percentage: number;
  color: string;
}

export interface PerformanceAnalyticsProps {
  averagePerformance?: number;
  breakdown?: GradeBreakdown[];
}

export const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  averagePerformance,
  breakdown,
}) => {
  const hasData = typeof averagePerformance === 'number' && breakdown && breakdown.length > 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart2 size={20} className="text-[#0D8A82]" />
            <h3 className="text-base font-extrabold text-slate-800">
              نظرة عامة على أداء الطلاب
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">تقييم شامل</span>
        </div>

        {!hasData ? (
          <div className="text-center py-8 text-xs font-semibold text-slate-400">
            سيتم احتساب متوسط الأداء بعد تقديم الطلاب للاختبارات
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-2">
            {/* Circle Progress Indicator */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#0D8A82]"
                  strokeDasharray={`${averagePerformance}, 100`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-800">{averagePerformance}%</span>
                <span className="text-[10px] font-bold text-slate-400">متوسط الأداء</span>
              </div>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 w-full">
              {breakdown.map((item, index) => (
                <div key={index} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-right">
                  <div className="flex items-center justify-end gap-1.5 mb-1">
                    <span className="text-xs font-bold text-slate-700">{item.label}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                  </div>
                  <span className="text-base font-black text-slate-800 block">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
