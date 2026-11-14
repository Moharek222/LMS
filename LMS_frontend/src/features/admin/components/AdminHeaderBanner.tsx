import React from 'react';
import { ShieldCheck, Users, RefreshCw } from 'lucide-react';

interface AdminHeaderBannerProps {
  totalAdmins: number;
  isRefetching: boolean;
  isLoading: boolean;
  onRefresh: () => void;
}

export const AdminHeaderBanner: React.FC<AdminHeaderBannerProps> = ({
  totalAdmins,
  isRefetching,
  isLoading,
  onRefresh,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
          <ShieldCheck size={26} />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-800">إدارة المدراء والمنصة 🛡️</h3>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            إضافة واستعراض مدراء النظام المعتمدين بالمنصة وإدارة حساباتهم بصلاحيات كاملة
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="px-3.5 py-1.5 rounded-xl bg-teal-50 text-[#0D8A82] text-xs font-black border border-teal-100 flex items-center gap-1.5">
          <Users size={16} />
          <span>إجمالي المدراء: {totalAdmins}</span>
        </span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading || isRefetching}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
          title="تحديث القائمة"
          aria-label="تحديث القائمة"
        >
          <RefreshCw size={16} className={isRefetching ? 'animate-spin text-[#0D8A82]' : ''} />
        </button>
      </div>
    </div>
  );
};

