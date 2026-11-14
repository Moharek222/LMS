import React from 'react';
import { KeyRound, Printer, Sparkles, Plus } from 'lucide-react';

interface AccessCodesHeaderProps {
  totalItems: number;
  activeCount: number;
  filteredCount: number;
  onOpenPrint: () => void;
  onOpenGenerateGroup: () => void;
  onOpenGenerateSingle: () => void;
}

export const AccessCodesHeader: React.FC<AccessCodesHeaderProps> = ({
  totalItems,
  activeCount,
  filteredCount,
  onOpenPrint,
  onOpenGenerateGroup,
  onOpenGenerateSingle,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
          <KeyRound size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-extrabold text-slate-800">أكواد التفعيل</h3>
            <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-[#0D8A82] text-xs font-bold border border-teal-100">
              إجمالي الأكواد: {totalItems}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              الأكواد النشطة الحالية: {activeCount}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            توليد ومتابعة أكواد شحن تفعيل حسابات وإشتراكات الطلاب والبحث والفلترة حسب الصف الدراسي والمسار
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {filteredCount > 0 && (
          <button
            type="button"
            onClick={onOpenPrint}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-50 text-[#0D8A82] border border-teal-200 hover:bg-teal-100 text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            <Printer size={16} />
            <span>طباعة وتصدير الكشف ({filteredCount}) 🖨️</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenGenerateGroup}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition cursor-pointer shadow-xs"
        >
          <Sparkles size={16} />
          <span>توليد أكواد جماعية</span>
        </button>

        <button
          type="button"
          onClick={onOpenGenerateSingle}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs"
        >
          <Plus size={16} />
          <span>إنشاء كود فردي</span>
        </button>
      </div>
    </div>
  );
};

export default AccessCodesHeader;

