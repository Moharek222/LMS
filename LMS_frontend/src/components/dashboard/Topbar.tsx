import React from 'react';
import { Menu } from 'lucide-react';

interface TopbarProps {
  userName?: string;
  userRole?: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  userName = 'أحمد محمد',
  userRole = 'مدرس الكيمياء',
  subtitle = 'المرحلة الثانوية',
  onOpenMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        
        
        <div className="text-right">
          <h1 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
            مرحباً، {userName}
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {userRole} {subtitle ? `- ${subtitle}` : ''}
          </p>
        </div>

        
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2.5 rounded-2xl bg-slate-100 text-slate-700 hover:bg-teal-50 transition cursor-pointer"
        >
          <Menu size={20} />
        </button>

      </div>
    </header>
  );
};

export default Topbar;
