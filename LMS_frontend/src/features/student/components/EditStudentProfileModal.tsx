import React, { useState } from 'react';
import { User, Lock, Phone, X, CheckCircle2, AlertCircle, Loader2, Edit3 } from 'lucide-react';
import { useUpdateStudentProfile } from '../hooks/useUpdateStudentProfile';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { useToast } from '../../../context/ToastContext';

interface EditStudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName?: string;
  currentParentPhone?: string;
}

export const EditStudentProfileModal: React.FC<EditStudentProfileModalProps> = ({
  isOpen,
  onClose,
  currentName = '',
  currentParentPhone = '',
}) => {
  const toast = useToast();
  const [name, setName] = useState(currentName);
  const [parentPhone, setParentPhone] = useState(currentParentPhone);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateMutation = useUpdateStudentProfile();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload: { name?: string; parentPhone?: string; password?: string } = {};
    if (name.trim() && name !== currentName) payload.name = name.trim();
    if (parentPhone.trim() && parentPhone !== currentParentPhone) payload.parentPhone = parentPhone.trim();
    if (password.trim()) payload.password = password.trim();

    if (Object.keys(payload).length === 0) {
      toast.info('لم تقم بتعديل أية بيانات.');
      onClose();
      return;
    }

    updateMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('تم تحديث البيانات الشخصية بنجاح! ✏️');
        onClose();
      },
      onError: (err) => {
        const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء تحديث البيانات الشخصية');
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
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100">
              <Edit3 size={24} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">تعديل البيانات الشخصية ✏️</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                تحديث الاسم أو رقم هاتف ولي الأمر أو كلمة المرور
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">الاسم بالكامل</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم الثلاثي..."
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition"
              />
              <User size={18} className="absolute right-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم هاتف ولي الأمر</label>
            <div className="relative">
              <input
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="01xxxxxxxx"
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition dir-ltr text-right"
              />
              <Phone size={18} className="absolute right-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              كلمة المرور الجديدة <span className="text-slate-400 font-normal">(اختياري)</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة مرور جديدة للتغيير..."
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition"
              />
              <Lock size={18} className="absolute right-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 py-3 px-4 rounded-xl bg-[#0D8A82] text-white font-bold text-xs hover:bg-teal-700 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري حفظ التعديلات...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>حفظ التعديلات</span>
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

export default EditStudentProfileModal;
