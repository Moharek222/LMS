import React from 'react';
import { Menu } from 'lucide-react';

interface TopbarProps {
  userName?: string;
  userRole?: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  userName = 'مؤمن محمد الصادق',
  userRole = 'مدرس الكيمياء',
  subtitle = 'المرحلة الثانوية',
  onOpenMobileMenu,
}) => {
  const currentHour = new Date().getHours();
  const timeGreeting = currentHour >= 5 && currentHour < 12 ? 'صباح الخير ☀️' : 'مساء الخير 🌙';

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        
        {/* User Info with Logo on Right Side */}
        <div className="flex items-center gap-3">
          <img
            src="/favicon8k.png"
            alt="لوجو منصة الصادق"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-contain shrink-0 border border-slate-100 bg-teal-50/40 p-0.5 shadow-2xs"
          />
          <div className="text-right">
            <h1 className="text-base sm:text-lg font-black text-slate-800 tracking-tight flex items-center gap-1.5">
              <span>{timeGreeting}، {userName}</span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {userRole} {subtitle ? `- ${subtitle}` : ''}
            </p>
          </div>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2.5 rounded-2xl bg-slate-100 text-slate-700 hover:bg-teal-50 transition cursor-pointer"
          aria-label="القائمة الجانبية"
        >
          <Menu size={20} />
        </button>

      </div>
    </header>
  );
};

export default Topbar;
