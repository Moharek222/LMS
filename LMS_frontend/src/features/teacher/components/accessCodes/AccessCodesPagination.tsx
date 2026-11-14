import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface AccessCodesPaginationProps {
  currentPage: number;
  totalPages: number;
  paginatedCount: number;
  filteredCount: number;
  onPageChange: (page: number | ((prev: number) => number)) => void;
}

export const AccessCodesPagination: React.FC<AccessCodesPaginationProps> = ({
  currentPage,
  totalPages,
  paginatedCount,
  filteredCount,
  onPageChange,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        onClick={() => onPageChange((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage <= 1}
      >
        <ChevronRight size={16} />
        <span>السابق</span>
      </button>

      <span className="text-xs font-bold text-slate-600">
        صفحة {currentPage} من {totalPages} (معروض {paginatedCount} من {filteredCount} كود)
      </span>

      <button
        type="button"
        onClick={() => onPageChange((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage >= totalPages}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
      >
        <span>التالي</span>
        <ChevronLeft size={16} />
      </button>
    </div>
  );
};

export default AccessCodesPagination;

