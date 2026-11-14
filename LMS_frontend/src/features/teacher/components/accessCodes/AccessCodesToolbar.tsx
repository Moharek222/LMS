import React from 'react';
import { Search, X, CheckCircle2, XCircle } from 'lucide-react';
import type { StatusFilterValue } from '../../hooks/useTeacherAccessCodeManager';

interface AccessCodesToolbarProps {
  searchQuery: string;
  statusFilter: StatusFilterValue;
  totalCount: number;
  activeCount: number;
  expiredCount: number;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: StatusFilterValue) => void;
}

export const AccessCodesToolbar: React.FC<AccessCodesToolbarProps> = ({
  searchQuery,
  statusFilter,
  totalCount,
  activeCount,
  expiredCount,
  onSearchChange,
  onStatusChange,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Instant Search Input */}
      <div className="relative w-full md:max-w-md">
        <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث في جميع الأكواد (الكود، اسم الطالب، رقم الهاتف)..."
          className="w-full pr-10 pl-9 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] bg-slate-50/70 transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            title="مسح البحث"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Status Quick Filter Buttons */}
      <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
        <button
          type="button"
          onClick={() => onStatusChange('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-[#0D8A82] text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          الكل ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => onStatusChange('active')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            statusFilter === 'active'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <CheckCircle2 size={13} />
          <span>النشطة ({activeCount})</span>
        </button>
        <button
          type="button"
          onClick={() => onStatusChange('expired')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            statusFilter === 'expired'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
          }`}
        >
          <XCircle size={13} />
          <span>المنتهية ({expiredCount})</span>
        </button>
      </div>
    </div>
  );
};

export default AccessCodesToolbar;

