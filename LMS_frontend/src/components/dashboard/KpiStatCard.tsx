import React from 'react';

export type KpiColor = 'teal' | 'blue' | 'green' | 'amber' | 'purple';

interface KpiStatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color?: KpiColor;
}

const colorStyles: Record<
  KpiColor,
  {
    iconBg: string;
    iconColor: string;
    valueColor: string;
    strokeColor: string;
    fillColor: string;
  }
> = {
  teal: {
    iconBg: 'bg-teal-50 border-teal-100',
    iconColor: 'text-[#0D8A82]',
    valueColor: 'text-[#0D8A82]',
    strokeColor: '#0D8A82',
    fillColor: 'rgba(13, 138, 130, 0.08)',
  },
  blue: {
    iconBg: 'bg-blue-50 border-blue-100',
    iconColor: 'text-blue-600',
    valueColor: 'text-blue-600',
    strokeColor: '#2563eb',
    fillColor: 'rgba(37, 99, 235, 0.08)',
  },
  green: {
    iconBg: 'bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-600',
    valueColor: 'text-emerald-600',
    strokeColor: '#059669',
    fillColor: 'rgba(5, 150, 105, 0.08)',
  },
  amber: {
    iconBg: 'bg-amber-50 border-amber-100',
    iconColor: 'text-amber-600',
    valueColor: 'text-amber-600',
    strokeColor: '#d97706',
    fillColor: 'rgba(217, 119, 6, 0.08)',
  },
  purple: {
    iconBg: 'bg-purple-50 border-purple-100',
    iconColor: 'text-purple-600',
    valueColor: 'text-purple-600',
    strokeColor: '#9333ea',
    fillColor: 'rgba(147, 51, 234, 0.08)',
  },
};

export const KpiStatCard: React.FC<KpiStatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'teal',
}) => {
  const styles = colorStyles[color] || colorStyles.teal;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between relative overflow-hidden group">
      
      
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-right">
          <span className="text-xs font-extrabold text-slate-500">{title}</span>
          <div className={`text-2xl sm:text-3xl font-black mt-1 ${styles.valueColor}`}>
            {value}
          </div>
          <span className="text-[11px] font-semibold text-slate-400 mt-0.5 block">
            {subtitle}
          </span>
        </div>

        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${styles.iconBg} ${styles.iconColor}`}>
          {icon}
        </div>
      </div>

      
      <div className="w-full h-8 mt-2 -mb-2">
        <svg viewBox="0 0 100 30" className="w-full h-full preserve-3d">
          <path
            d="M0 25 Q20 15 40 20 T80 10 T100 15 L100 30 L0 30 Z"
            fill={styles.fillColor}
          />
          <path
            d="M0 25 Q20 15 40 20 T80 10 T100 15"
            fill="none"
            stroke={styles.strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

    </div>
  );
};

export default KpiStatCard;
