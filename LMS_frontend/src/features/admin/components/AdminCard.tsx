import React from 'react';
import { Trash2 } from 'lucide-react';
import type { AdminUserItem } from '../api/adminUserApi';

interface AdminCardProps {
  admin: AdminUserItem;
  onDeleteClick: (admin: AdminUserItem) => void;
  disabled?: boolean;
}

const getAdminInitial = (name?: string): string => {
  if (!name || !name.trim()) return 'م';
  return name.trim().charAt(0);
};

const formatAdminDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const AdminCard: React.FC<AdminCardProps> = ({
  admin,
  onDeleteClick,
  disabled = false,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 font-black text-sm shrink-0">
          {getAdminInitial(admin.name)}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h5 className="text-xs font-extrabold text-slate-800">{admin.name}</h5>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              مدير معتمد
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mt-1 flex-wrap">
            <span dir="ltr">{admin.email}</span>
            {admin.createdAt && (
              <>
                <span className="text-slate-300">•</span>
                <span>أضيف في: {formatAdminDate(admin.createdAt)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDeleteClick(admin)}
        disabled={disabled}
        className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        title="حذف حساب المدير"
        aria-label={`حذف حساب المدير ${admin.name}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

