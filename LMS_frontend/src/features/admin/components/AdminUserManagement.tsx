import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { addTeacher, addAdmin } from '../api/adminUserApi';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { useToast } from '../../../context/ToastContext';

export const AdminUserManagement: React.FC = () => {
  const toast = useToast();
  const [role, setRole] = useState<'teacher' | 'admin'>('teacher');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('يرجى ملء جميع الحقول الإلزامية.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (role === 'teacher') {
        const res = await addTeacher({ name: name.trim(), email: email.trim(), password: password.trim() });
        toast.success(res.message || 'تم إنشاء حساب المعلم بنجاح! 👨‍🏫');
      } else {
        const res = await addAdmin({ name: name.trim(), email: email.trim(), password: password.trim() });
        toast.success(res.message || 'تم إنشاء حساب المدير بنجاح! 🛡️');
      }

      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      const msg = toArabicErrorMessage(err, 'فشل إنشاء الحساب الجديد');
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
     

      {/* Account Creation Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 max-w-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#0D8A82]" />
            <span>إضافة حساب جديد</span>
          </h4>

          {/* Role Selector Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                role === 'teacher' ? 'bg-[#0D8A82] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مدرس (Teacher)
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                role === 'admin' ? 'bg-[#0D8A82] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مدير (Admin)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">الاسم بالكامل</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل الاسم الثلاثي..."
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition"
              />
              <User size={18} className="absolute right-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">البريد الإلكتروني الرسمي</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@platform.com"
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition dir-ltr text-right"
              />
              <Mail size={18} className="absolute right-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">كلمة المرور</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#0D8A82] text-white font-bold text-xs hover:bg-teal-700 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>جاري إنشاء الحساب...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>إنشاء حساب {role === 'teacher' ? 'المعلم' : 'المدير'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminUserManagement;
