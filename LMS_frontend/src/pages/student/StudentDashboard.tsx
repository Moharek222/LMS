import React from 'react';
import { useAuth } from '../../context/useAuth';
import { DashboardCard } from '../../components/dashboard/DashboardCard';
import { Footer } from '../../components/layout/Footer';
import {
  GraduationCap,
  LogOut,
  BookOpen,
  Video,
  FileText,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 font-sans flex flex-col">
     
      <header className="bg-[#091523] text-white sticky top-0 z-50 shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D8A82] flex items-center justify-center text-white shadow-md shadow-teal-900/40">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white">منصة الصادق</h1>
              <p className="text-[10px] text-teal-400 font-semibold">بوابة الطالب التعليمية في الكيمياء</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">{user?.name || 'الطالب'}</span>
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
        
        
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#091523] via-[#0d2238] to-[#091523] p-6 sm:p-8 text-white shadow-xl border border-slate-800">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold">
              <Sparkles size={14} className="text-amber-400" />
              <span>أهلاً بك في العام الدراسي 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              مرحباً بك، {user?.name || 'طالبنا العزيز'} 👋
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              واصل تعلم الكيمياء بفهم وتطبيق وثقة مع منصة الصادق. تابع دروسك، واختبر معلوماتك أولاً بأول لتحقيق التفوق.
            </p>
          </div>
          
          
          <div className="absolute left-0 bottom-0 w-72 h-72 bg-[#0D8A82]/20 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              user?.hasActiveSubscription
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}>
              {user?.hasActiveSubscription ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">حالة الاشتراك في المنصة</h4>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {user?.hasActiveSubscription
                  ? 'اشتراكك نشط ومفعل لمتابعة جميع المحاضرات والامتحانات'
                  : 'تنبيه: يلزم تفعيل كارت الاشتراك للوصول الكامل للمحاضرات والدروس المحمية'}
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            {user?.hasActiveSubscription ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100/80 text-emerald-800 text-xs font-bold border border-emerald-300">
                <CheckCircle2 size={16} />
                <span>اشتراك نشط</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-100/80 text-amber-900 text-xs font-bold border border-amber-300">
                <AlertTriangle size={16} />
                <span>اشتراك غير مفعل</span>
              </span>
            )}
          </div>
        </div>

        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-800">أقسام المنصة</h3>
            <span className="text-xs text-slate-400 font-semibold">بوابة التعليم التفاعلية</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <DashboardCard
              title="المواد الكيميائية"
              description="استعرض منهج الكيمياء المقسم بأسلوب شائق ومبسط."
              icon={<BookOpen size={24} />}
              accentColor="teal"
            />

            <DashboardCard
              title="المحاضرات والدروس"
              description="شاهد الشرح التفاعلي والملاحظات الدقيقة لكل درس."
              icon={<Video size={24} />}
              accentColor="blue"
            />

            <DashboardCard
              title="الاختبارات والتقييم"
              description="حل امتحانات الحصص والشهور وتتبع درجاتك فورياً."
              icon={<FileText size={24} />}
              accentColor="amber"
            />

            <DashboardCard
              title="سجل الحضور"
              description="تابع سجل حضورك وتفاعلك الميداني والمنزلي."
              icon={<CalendarCheck size={24} />}
              accentColor="purple"
            />
          </div>
        </div>

      </main>

      
      <Footer platformName="منصة الصادق في الكيمياء" />
    </div>
  );
};

export default StudentDashboard;
