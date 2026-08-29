import React from 'react';
import { useAuth } from '../../context/useAuth';
import { DashboardCard } from '../../components/dashboard/DashboardCard';
import { Footer } from '../../components/layout/Footer';
import {
  UserCheck,
  LogOut,
  Users,
  FolderKanban,
  Video,
  FilePlus,
  Key,
  QrCode,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 font-sans flex flex-col">
      
      <header className="bg-[#091523] text-white sticky top-0 z-50 shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-900/40 border border-teal-500/30">
              <UserCheck size={24} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white">لوحة المعلم | منصة الصادق</h1>
              <p className="text-[10px] text-teal-400 font-semibold">إدارة المنصة والطلاب والمحتوى التفاعلي</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs">
              <ShieldCheck size={16} className="text-amber-400" />
              <span className="text-slate-200 font-bold">{user?.name || 'الأستاذ الصادق'}</span>
            </div>

            <button
              onClick={logout}
              disabled={isLoading}
              className="flex items-center gap-2 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer shadow-xs"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
       
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#091523] via-[#0b1f33] to-[#091523] p-6 sm:p-8 text-white shadow-xl border border-slate-800">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Sparkles size={14} className="text-amber-400" />
              <span>لوحة التحكم الرئيسية للمعلم</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              أهلاً بك يا أستاذ، {user?.name || 'الصادق في الكيمياء'} 👋
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              مرحباً بك في لوحة تحكم المعلم. يمكنك متابعة مجموعات الطلاب، إضافة المحاضرات، توليد أكواد الاشتراكات، ومتابعة نتايج الامتحانات.
            </p>
          </div>

          <div className="absolute left-0 bottom-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-800">أدوات الإدارة والتحكم</h3>
            <span className="text-xs text-slate-400 font-semibold">لوحة المعلم</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <DashboardCard
              title="إدارة الطلاب"
              description="استعرض قائمة الطلاب المسجلين، حالة الحسابات والتفعيل."
              icon={<Users size={24} />}
              accentColor="teal"
            />

            <DashboardCard
              title="المجموعات والصفوف"
              description="إدارة المجموعات وتوزيع الطلاب حسب المراحل الدراسية."
              icon={<FolderKanban size={24} />}
              accentColor="blue"
            />

            <DashboardCard
              title="المحاضرات والدروس"
              description="إضافة روابط الشرح والملاحظات وتحديد الدروس المحمية."
              icon={<Video size={24} />}
              accentColor="purple"
            />

            <DashboardCard
              title="إنشاء الامتحانات"
              description="بناء الأسئلة وتحديد درجات المرور (50%) وتوقيت الاختبار."
              icon={<FilePlus size={24} />}
              accentColor="amber"
            />

            <DashboardCard
              title="توليد أكواد الاشتراكات"
              description="إنشاء أكواد كروت التفعيل للطلاب وتتبع صلاحيتها."
              icon={<Key size={24} />}
              accentColor="emerald"
            />

            <DashboardCard
              title="سجل الحضور و الـ QR"
              description="مسح واستعراض سجل الحضور والغياب للطلاب بالحصة."
              icon={<QrCode size={24} />}
              accentColor="dark"
            />
          </div>
        </div>

      </main>

      
      <Footer platformName="لوحة المعلم - منصة الصادق في الكيمياء" />
    </div>
  );
};

export default TeacherDashboard;
