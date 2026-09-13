import React, { useState } from 'react';
import { KeyRound, X, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import type { GroupStudent } from '../../types/groupManagement';
import { useResetStudentPassword } from '../../hooks/useResetStudentPassword';
import { useToast } from '../../../../context/ToastContext';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';

interface ResetStudentPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: GroupStudent | null;
  groupName?: string;
}

export const ResetStudentPasswordModal: React.FC<ResetStudentPasswordModalProps> = ({
  isOpen,
  onClose,
  student,
  groupName,
}) => {
  const toast = useToast();
  const resetMutation = useResetStudentPassword();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!password) {
      setErrorMsg('يرجى إدخال كلمة المرور الجديدة');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('كلمتا المرور غير متطابقتين');
      return;
    }

    resetMutation.mutate(
      { studentId: student._id, password },
      {
        onSuccess: (res) => {
          toast.success(res.message || 'تم تعيين كلمة المرور الجديدة بنجاح وإلغاء جميع الجلسات النشطة للطالب 🔑');
          setPassword('');
          setConfirmPassword('');
          onClose();
        },
        onError: (err) => {
          const msg = toArabicErrorMessage(err, 'تعذر تعيين كلمة المرور الجديدة، يرجى المحاولة لاحقاً');
          setErrorMsg(msg);
        },
      }
    );
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100">
              <KeyRound size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">تعيين كلمة مرور جديدة</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                الطالب: <span className="text-[#0D8A82] font-bold">{student.name}</span>
                {groupName ? ` (${groupName})` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              كلمة المرور الجديدة <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0D8A82] focus:ring-2 focus:ring-teal-500/20 transition pl-10"
                disabled={resetMutation.isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              تأكيد كلمة المرور <span className="text-rose-500">*</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="أعد كتابة كلمة المرور للتأكيد"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0D8A82] focus:ring-2 focus:ring-teal-500/20 transition"
              disabled={resetMutation.isPending}
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2 text-[11px] text-amber-800 font-medium">
            <ShieldCheck size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <span>سيتم تغيير كلمة المرور فوراً وسيتم تسجيل خروج الطالب تلقائياً من الأجهزة المفتوحة.</span>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={resetMutation.isPending}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={resetMutation.isPending}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 disabled:opacity-50 transition cursor-pointer shadow-xs"
            >
              {resetMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>حفظ كلمة المرور الجديدة</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetStudentPasswordModal;
