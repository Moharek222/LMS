import React from 'react';
import {
  KeyRound,
  Copy,
  Check,
  CheckCircle,
  Sparkles,
  Printer,
} from 'lucide-react';
import type {
  GeneratedAccessCodeResult,
  GenerateGroupAccessCodesResult,
} from '../../types/groupManagement';

interface AccessCodeResultViewsProps {
  singleResult: GeneratedAccessCodeResult | null;
  groupResult: GenerateGroupAccessCodesResult | null;
  studentMap: Map<string, { name: string; phone?: string }>;
  copied: boolean;
  onCopyCode: (code: string) => void;
  onCopyAllGenerated: () => void;
  onOpenPrintModal: () => void;
  onClose: () => void;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const AccessCodeResultViews: React.FC<AccessCodeResultViewsProps> = ({
  singleResult,
  groupResult,
  studentMap,
  copied,
  onCopyCode,
  onCopyAllGenerated,
  onOpenPrintModal,
  onClose,
}) => {
  if (singleResult) {
    return (
      <div className="space-y-5 text-center py-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle size={32} />
        </div>

        <div className="space-y-1">
          <h4 className="text-base font-bold text-slate-800">تم إنشاء الكود بنجاح</h4>
          <p className="text-xs text-slate-500 font-medium">
            تاريخ انتهاء الصلاحية:{' '}
            <span className="font-bold text-slate-700">{formatDate(singleResult.expiresAt)}</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-teal-50/90 border-2 border-teal-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <KeyRound size={26} className="text-[#0D8A82] shrink-0" />
            <div className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-[#0D8A82] dir-ltr select-all">
              {singleResult.code}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onCopyCode(singleResult.code)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check size={16} />
                <span>تم النسخ</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>نسخ الكود</span>
              </>
            )}
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    );
  }

  if (groupResult) {
    return (
      <div className="space-y-5 py-2">
        <div className="text-center space-y-1">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 mb-2">
            <Sparkles size={30} className="text-emerald-600" />
          </div>
          <h4 className="text-base font-black text-slate-900">
            تمت عملية التوليد الجماعي بنجاح! 🎉
          </h4>
          <p className="text-xs text-slate-500 font-semibold">
            تم فحص حالة الطلاب وإنشاء الأكواد وتخطي الاشتراكات السارية تلقائياً
          </p>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-center space-y-1">
            <span className="text-2xl font-black text-emerald-700 block">
              {Array.isArray(groupResult.generated) ? groupResult.generated.length : 0}
            </span>
            <span className="text-xs font-bold text-emerald-800 block">
              كود جديد تم إنشاؤه ✅
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-center space-y-1">
            <span className="text-2xl font-black text-amber-700 block">
              {Array.isArray(groupResult.skipped) ? groupResult.skipped.length : 0}
            </span>
            <span className="text-xs font-bold text-amber-800 block">
              طالب تم تخطيهم (اشتراكهم نشط) ℹ️
            </span>
          </div>
        </div>

        {/* Action Buttons for Results */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          {Array.isArray(groupResult.generated) && groupResult.generated.length > 0 && (
            <>
              <button
                type="button"
                onClick={onOpenPrintModal}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Printer size={16} />
                <span>طباعة الأكواد الجديدة ({groupResult.generated.length}) 🖨️</span>
              </button>

              <button
                type="button"
                onClick={onCopyAllGenerated}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Copy size={16} />
                <span>نسخ الكل</span>
              </button>
            </>
          )}
        </div>

        {/* Generated Codes List Preview */}
        {Array.isArray(groupResult.generated) && groupResult.generated.length > 0 ? (
          <div className="space-y-2">
            <h5 className="text-xs font-extrabold text-slate-700">قائمة الأكواد المولدة:</h5>
            <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 rounded-2xl p-2 bg-slate-50/60 divide-y divide-slate-100">
              {groupResult.generated.map((item, idx) => {
                const st = studentMap.get(String(item.studentID));
                return (
                  <div
                    key={item.code || idx}
                    className="pt-2 first:pt-0 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-slate-800 block">
                        {st?.name || 'طالب مسجل'}
                      </span>
                      {st?.phone && (
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {st.phone}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm tracking-wider text-[#0D8A82] bg-white px-3 py-1 rounded-lg border border-teal-200 select-all">
                        {item.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => onCopyCode(item.code)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition"
                        title="نسخ"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs font-bold text-slate-600">
            جميع الطلاب المحددين لديهم اشتراكات نشطة سارية بالفعل، لم يتم إنشاء أكواد جديدة.
          </div>
        )}

        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AccessCodeResultViews;

