export const Grade = {
  FirstSecondary: 'first_secondary',
  SecondSecondary: 'second_secondary',
  ThirdSecondary: 'third_secondary',
} as const;

export type Grade = (typeof Grade)[keyof typeof Grade];
export type GradeType = Grade;

export const GRADE_LABELS: Record<Grade, string> = {
  [Grade.FirstSecondary]: 'الصف الأول الثانوي',
  [Grade.SecondSecondary]: 'الصف الثاني الثانوي',
  [Grade.ThirdSecondary]: 'الصف الثالث الثانوي',
};

export const GRADE_SHORT_LABELS: Record<Grade, string> = {
  [Grade.FirstSecondary]: 'أولى ثانوي',
  [Grade.SecondSecondary]: 'تانية ثانوي',
  [Grade.ThirdSecondary]: 'تالتة ثانوي',
};

export const GRADE_OPTIONS: Array<{ value: Grade; label: string; shortLabel: string }> = [
  {
    value: Grade.FirstSecondary,
    label: 'الصف الأول الثانوي',
    shortLabel: 'أولى ثانوي',
  },
  {
    value: Grade.SecondSecondary,
    label: 'الصف الثاني الثانوي',
    shortLabel: 'تانية ثانوي',
  },
  {
    value: Grade.ThirdSecondary,
    label: 'الصف الثالث الثانوي',
    shortLabel: 'تالتة ثانوي',
  },
];

export const GRADE_BADGE_STYLES: Record<
  Grade,
  {
    bg: string;
    text: string;
    border: string;
    pill: string;
    dot: string;
  }
> = {
  [Grade.FirstSecondary]: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    pill: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
  },
  [Grade.SecondSecondary]: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    pill: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
  },
  [Grade.ThirdSecondary]: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    pill: 'bg-teal-50 text-teal-700 border-teal-200',
    dot: 'bg-teal-500',
  },
};

export const getGradeLabel = (grade?: Grade | string | null): string => {
  if (!grade) return 'غير محدد';
  return GRADE_LABELS[grade as Grade] || grade;
};

export const getGradeShortLabel = (grade?: Grade | string | null): string => {
  if (!grade) return 'غير محدد';
  return GRADE_SHORT_LABELS[grade as Grade] || grade;
};

export const getGradeBadgeStyle = (grade?: Grade | string | null) => {
  if (!grade || !GRADE_BADGE_STYLES[grade as Grade]) {
    return {
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      border: 'border-slate-200',
      pill: 'bg-slate-50 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
    };
  }
  return GRADE_BADGE_STYLES[grade as Grade];
};
