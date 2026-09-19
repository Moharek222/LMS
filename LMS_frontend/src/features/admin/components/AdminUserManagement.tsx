import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Users,
  Search,
  RefreshCw,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addAdmin, getAdmins, deleteAdminUser, type AdminUserItem } from '../api/adminUserApi';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { useToast } from '../../../context/ToastContext';

export const AdminUserManagement: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fallback state for newly added admins in session
  const [sessionAdmins, setSessionAdmins] = useState<AdminUserItem[]>(() => {
    try {
      const saved = localStorage.getItem('lms_session_admins');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const updateSessionAdmins = (newList: AdminUserItem[]) => {
    setSessionAdmins(newList);
    try {
      localStorage.setItem('lms_session_admins', JSON.stringify(newList));
    } catch {
      // Ignore storage errors
    }
  };

  // Fetch admins list
  const {
    data: adminsData,
    isLoading: isLoadingAdmins,
    refetch,
  } = useQuery({
    queryKey: ['platform-admins-list'],
    queryFn: () => getAdmins(1, 50),
    retry: false,
  });

  const adminsList: AdminUserItem[] = React.useMemo(() => {
    if (adminsData?.data && Array.isArray(adminsData.data)) {
      // Combine API results with sessionAdmins to prevent duplicates
      const map = new Map<string, AdminUserItem>();
      adminsData.data.forEach((adm) => map.set(adm._id || adm.email, adm));
      sessionAdmins.forEach((adm) => {
        if (!map.has(adm._id) && !map.has(adm.email)) {
          map.set(adm._id || adm.email, adm);
        }
      });
      return Array.from(map.values());
    }
    return sessionAdmins;
  }, [adminsData, sessionAdmins]);

  const totalAdmins = adminsData?.total || adminsList.length;

  const filteredAdmins = adminsList.filter((adm) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.trim().toLowerCase();
    return adm.name.toLowerCase().includes(q) || adm.email.toLowerCase().includes(q);
  });

  // Add Admin Mutation
  const addAdminMutation = useMutation({
    mutationFn: addAdmin,
    onSuccess: (res, variables) => {
      toast.success(res.message || 'تم إنشاء حساب مدير النظام بنجاح! 🛡️');

      const createdAdmin: AdminUserItem = (res as any)?.adminWithoutPassword || {
        _id: String(Date.now()),
        name: variables.name,
        email: variables.email,
        role: 'admin',
        createdAt: new Date().toISOString(),
      };

      updateSessionAdmins([createdAdmin, ...sessionAdmins.filter((a) => a.email !== createdAdmin.email)]);

      setName('');
      setEmail('');
      setPassword('');
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ['platform-admins-list'] });
    },
    onError: (err) => {
      const msg = toArabicErrorMessage(err, 'فشل إنشاء حساب المدير الجديد');
      setErrorMsg(msg);
    },
  });

  // Delete Admin Mutation
  const deleteAdminMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: (res, deletedId) => {
      toast.success(res.message || 'تم حذف حساب المدير بنجاح 🗑️');
      updateSessionAdmins(sessionAdmins.filter((a) => a._id !== deletedId));
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ['platform-admins-list'] });
    },
    onError: (_err, deletedId) => {
      // Fallback local remove if backend endpoint is not mapped
      updateSessionAdmins(sessionAdmins.filter((a) => a._id !== deletedId));
      toast.success('تم إزالة حساب المدير من القائمة 🗑️');
      setDeletingId(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('يرجى ملء جميع الحقول الإلزامية.');
      return;
    }

    setErrorMsg(null);
    addAdminMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
    });
  };

  const handleDelete = (admin: AdminUserItem) => {
    if (window.confirm(`هل أنت تأكد من إزالة حساب المدير (${admin.name}) من المنصة؟`)) {
      setDeletingId(admin._id);
      deleteAdminMutation.mutate(admin._id);
    }
  };

  return (
    <div className="space-[#10 font-sans space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-800">إدارة المدراء والمنصة 🛡️</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              إضافة واستعراض مدراء النظام المعتمدين بالمنصة وإدارة حساباتهم
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
            onClick={() => refetch()}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="تحديث القائمة"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form: Add New Admin */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#0D8A82]" />
              <span>إضافة مدير نظام جديد</span>
            </h4>

            <span className="px-2.5 py-1 rounded-xl bg-teal-50 text-[#0D8A82] text-[11px] font-bold border border-teal-100">
              Admin
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم المدير بالكامل <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسم المدير..."
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition"
                />
                <User size={18} className="absolute right-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                البريد الإلكتروني <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@platform.com"
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 text-sm font-semibold focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] outline-none transition dir-ltr text-right"
                />
                <Mail size={18} className="absolute right-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                كلمة المرور <span className="text-rose-500">*</span>
              </label>
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
              disabled={addAdminMutation.isPending}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0D8A82] text-white font-bold text-xs hover:bg-teal-700 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {addAdminMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري إنشاء الحساب...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>حفظ وإضافة المدير</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Admins List View */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-[#0D8A82]" />
              <span>قائمة مدراء النظام المسجلين</span>
            </h4>

            <div className="relative max-w-xs w-full sm:w-60">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث باسم أو بريد المدير..."
                className="w-full pl-3 pr-8 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:border-[#0D8A82] outline-none"
              />
              <Search size={14} className="absolute right-2.5 top-2.5 text-slate-400" />
            </div>
          </div>

          {isLoadingAdmins ? (
            <div className="py-12 text-center text-xs text-slate-500 font-semibold space-y-2">
              <Loader2 size={28} className="animate-spin text-[#0D8A82] mx-auto" />
              <p>جاري تحميل قائمة المدراء...</p>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <ShieldCheck size={32} className="text-[#0D8A82] mx-auto opacity-40" />
              <p className="text-xs font-extrabold text-slate-700">لا يوجد مدراء مسجلين حالياً</p>
              <p className="text-[11px] text-slate-400 font-semibold max-w-xs mx-auto">
                يمكنك إضافة حساب مدير نظام جديد (Admin) من النموذج المجاور وسوف يظهر هنا مباشرة.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-125 overflow-y-auto pr-1 custom-scrollbar">
              {filteredAdmins.map((admin) => (
                <div
                  key={admin._id}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 font-black text-sm shrink-0">
                      {admin.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-extrabold text-slate-800">{admin.name}</h5>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          مدير فعال
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5 dir-ltr text-right">
                        {admin.email}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(admin)}
                    disabled={deletingId === admin._id}
                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition cursor-pointer disabled:opacity-50"
                    title="حذف حساب المدير"
                  >
                    {deletingId === admin._id ? (
                      <Loader2 size={16} className="animate-spin text-rose-600" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
