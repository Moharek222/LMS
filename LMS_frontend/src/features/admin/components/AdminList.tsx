import React from 'react';
import { Users, Search, X, Loader2, ShieldCheck } from 'lucide-react';
import { AdminCard } from './AdminCard';
import type { AdminUserItem } from '../api/adminUserApi';

interface AdminListProps {
  admins: AdminUserItem[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onDeleteClick: (admin: AdminUserItem) => void;
  deletingId?: string | null;
}

export const AdminList: React.FC<AdminListProps> = ({
  admins,
  isLoading,
  searchTerm,
  onSearchChange,
  onDeleteClick,
  deletingId,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
      {/* Header & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
          <Users size={18} className="text-[#0D8A82]" />
          <span>قائمة مدراء النظام المسجلين</span>
        </h4>

        <div className="relative max-w-xs w-full sm:w-60">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="بحث باسم أو بريد المدير..."
            className="w-full pl-8 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#0D8A82] outline-none"
          />
          <Search size={14} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              aria-label="مسح البحث"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-14 text-center text-xs text-slate-500 font-semibold space-y-2">
          <Loader2 size={30} className="animate-spin text-[#0D8A82] mx-auto" />
          <p>جاري تحميل قائمة المدراء من المنصة...</p>
        </div>
      ) : admins.length === 0 ? (
        <div className="py-14 text-center space-y-2.5">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
            <ShieldCheck size={28} />
          </div>
          <h5 className="text-xs font-extrabold text-slate-800">
            {searchTerm ? 'لا توجد نتائج مطابقة لبحثك' : 'لا يوجد مدراء مسجلين حالياً'}
          </h5>
          <p className="text-[11px] text-slate-400 font-semibold max-w-xs mx-auto leading-relaxed">
            {searchTerm
              ? 'جرب البحث باسم أو بريد إلكتروني مختلف.'
              : 'يمكنك إضافة حساب مدير نظام جديد من النموذج وسوف يظهر هنا فوراً.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-130 overflow-y-auto pr-1 custom-scrollbar">
          {admins.map((admin) => (
            <AdminCard
              key={admin._id}
              admin={admin}
              onDeleteClick={onDeleteClick}
              disabled={deletingId === admin._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

