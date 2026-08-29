import React from 'react';

export type CardAccentColor = 'teal' | 'blue' | 'purple' | 'amber' | 'emerald' | 'dark';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  statusText?: string;
  accentColor?: CardAccentColor;
  onClick?: () => void;
}

const colorStyles: Record<
  CardAccentColor,
  { iconContainer: string; statusText: string }
> = {
  teal: {
    iconContainer: 'bg-teal-50 text-[#0D8A82] border-teal-100',
    statusText: 'text-[#0D8A82]',
  },
  blue: {
    iconContainer: 'bg-blue-50 text-blue-600 border-blue-100',
    statusText: 'text-blue-600',
  },
  purple: {
    iconContainer: 'bg-purple-50 text-purple-600 border-purple-100',
    statusText: 'text-purple-600',
  },
  amber: {
    iconContainer: 'bg-amber-50 text-amber-600 border-amber-100',
    statusText: 'text-amber-600',
  },
  emerald: {
    iconContainer: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    statusText: 'text-emerald-600',
  },
  dark: {
    iconContainer: 'bg-[#091523] text-teal-300 border-slate-700',
    statusText: 'text-slate-800',
  },
};

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon,
  statusText = 'قريباً...',
  accentColor = 'teal',
  onClick,
}) => {
  const styles = colorStyles[accentColor] || colorStyles.teal;

  return (
    <div
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition group ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border ${styles.iconContainer}`}
      >
        {icon}
      </div>
      <h4 className="text-base font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
        {description}
      </p>
      {statusText && (
        <div className={`mt-4 pt-3 border-t border-slate-100 text-xs font-bold ${styles.statusText}`}>
          {statusText}
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
