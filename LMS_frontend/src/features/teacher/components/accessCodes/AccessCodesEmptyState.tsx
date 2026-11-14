import React from 'react';
import { KeyRound, Search } from 'lucide-react';
import type { GradeFilterValue, TrackFilterValue } from '../../hooks/useTeacherAccessCodeManager';

interface AccessCodesEmptyStateProps {
  isEntirelyEmpty: boolean;
  totalCodesCount: number;
  gradeFilter?: GradeFilterValue;
  trackFilter?: TrackFilterValue;
  searchQuery?: string;
  onResetFilters: () => void;
}

export const AccessCodesEmptyState: React.FC<AccessCodesEmptyStateProps> = ({
  isEntirelyEmpty,
  totalCodesCount,
  gradeFilter,
  trackFilter,
  searchQuery,
  onResetFilters,
}) => {
  if (isEntirelyEmpty) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xs text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
          <KeyRound size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-800">لا توجد أكواد تفعيل حتى الآن</h4>
        <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
          قم بإنشاء كود تفعيل مخصص للطلاب لتفعيل صلاحيات الوصول بالمنصة.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto border border-amber-200">
        <Search size={22} />
      </div>
      <h4 className="text-sm font-bold text-slate-700">لا توجد أكواد مطابقة لمعايير الفلترة الحالية</h4>
      <p className="text-xs text-slate-400">
        {gradeFilter && gradeFilter !== 'ALL' ? `الصف: ${gradeFilter}` : ''}
        {trackFilter && trackFilter !== 'ALL' ? ` • المسار: ${trackFilter}` : ''}
        {searchQuery ? ` • البحث: "${searchQuery}"` : ''}
      </p>
      <button
        type="button"
        onClick={onResetFilters}
        className="text-xs text-[#0D8A82] font-bold hover:underline cursor-pointer"
      >
        إعادة تعيين الفلاتر وعرض جميع الأكواد ({totalCodesCount})
      </button>
    </div>
  );
};

export default AccessCodesEmptyState;

