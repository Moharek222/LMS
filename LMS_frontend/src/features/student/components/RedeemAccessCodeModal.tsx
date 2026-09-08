import React, { useState } from 'react';
import { KeyRound, X, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useVerifyAccessCode } from '../hooks/useVerifyAccessCode';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { useToast } from '../../../context/ToastContext';

interface RedeemAccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RedeemAccessCodeModal: React.FC<RedeemAccessCodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const toast = useToast();
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const verifyMutation = useVerifyAccessCode();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setErrorMsg(null);

    verifyMutation.mutate(code.trim(), {
      onSuccess: (res) => {
        toast.success(res.message || 'تم تفعيل كود الوصول والاشتراك بنجاح! 🎉');
        setCode('');
        onClose();
      },
      onError: (err) => {
        const msg = toArabicErrorMessage(err, 'كود الوصول غير صحيح أو منتهي الصلاحية');
        setErrorMsg(msg);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <KeyRound size={24} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">تفعيل كود الوصول 🔑</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                أدخل الكود الموفر لك من المعلم للانضمام للدورة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              رمز أو كود التفعيل <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="مثال: ACC-89X2-9901"
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 text-sm font-extrabold tracking-wider text-slate-800 uppercase focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition"
              />
              <KeyRound size={18} className="absolute right-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 font-semibold space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <Sparkles size={15} />
              <span>تعليمات تفعيل الكود:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              تأكد من كتابة أحرف الكود بدقة كما حصلت عليها من المعلم. تفعيل الكود يتيح لك الوصول المباشر للمحتوى التعليمي والامتحانات.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={verifyMutation.isPending || !code.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري التحقق والتفعيل...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>تفعيل الكود الآن</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RedeemAccessCodeModal;
