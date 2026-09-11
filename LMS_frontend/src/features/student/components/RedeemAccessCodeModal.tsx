import React, { useState } from 'react';
import { KeyRound, X, CheckCircle2, AlertCircle, Loader2, Sparkles, LogOut, ShieldAlert } from 'lucide-react';
import { useVerifyAccessCode } from '../hooks/useVerifyAccessCode';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/useAuth';

interface RedeemAccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMandatory?: boolean;
  onSuccessVerified?: () => void;
}

export const RedeemAccessCodeModal: React.FC<RedeemAccessCodeModalProps> = ({
  isOpen,
  onClose,
  isMandatory = false,
  onSuccessVerified,
}) => {
  const toast = useToast();
  const { user, updateUser, logout } = useAuth();
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
        if (user?.id) {
          sessionStorage.setItem(`lms_code_verified_${user.id}`, 'true');
        }
        updateUser({ hasActiveSubscription: true });
        setCode('');
        if (onSuccessVerified) {
          onSuccessVerified();
        }
        onClose();
      },
      onError: (err) => {
        const msg = toArabicErrorMessage(err, 'كود الوصول غير صحيح أو منتهي الصلاحية');
        setErrorMsg(msg);
      },
    });
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isMandatory
          ? 'bg-slate-950/85 backdrop-blur-md'
          : 'bg-slate-900/60 backdrop-blur-xs'
      }`}
    >
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                isMandatory
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-amber-50 text-amber-600 border-amber-200'
              }`}
            >
              {isMandatory ? <ShieldAlert size={24} /> : <KeyRound size={24} />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">
                {isMandatory ? 'تفعيل كود الاشتراك مطلوب 🔒' : 'تفعيل كود الوصول 🔑'}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {isMandatory
                  ? 'يرجى إدخال كود الاشتراك الخاص بك لبدء استخدام المنصة'
                  : 'أدخل الكود الموفر لك من المعلم للانضمام للدورة'}
              </p>
            </div>
          </div>
          {!isMandatory && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          )}
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

          <div
            className={`p-4 rounded-2xl border text-xs font-semibold space-y-1 ${
              isMandatory
                ? 'bg-rose-50/70 border-rose-200/80 text-rose-900'
                : 'bg-amber-50/60 border-amber-200/80 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles size={15} />
              <span>{isMandatory ? 'تنبيه هام للوصول:' : 'تعليمات تفعيل الكود:'}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              {isMandatory
                ? 'لا يمكنك تصفح الدروس أو إجراء الاختبارات حتى يتم تفعيل كود الاشتراك الخطي الصادر لك من المعلم.'
                : 'تأكد من كتابة أحرف الكود بدقة كما حصلت عليها من المعلم. تفعيل الكود يتيح لك الوصول المباشر للمحتوى التعليمي والامتحانات.'}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={verifyMutation.isPending || !code.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-[#0D8A82] text-white font-bold text-xs hover:bg-[#0B766F] transition cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري التحقق والتفعيل...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>تفعيل الكود ودخول المنصة</span>
                </>
              )}
            </button>
            {isMandatory ? (
              <button
                type="button"
                onClick={() => logout()}
                className="py-3 px-4 rounded-xl bg-slate-100 text-rose-600 font-bold text-xs hover:bg-rose-50 transition cursor-pointer flex items-center gap-1.5"
              >
                <LogOut size={15} />
                <span>تسجيل الخروج</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
              >
                إلغاء
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RedeemAccessCodeModal;
