import React from 'react';
import {
  Home,
  BookOpen,
  Video,
  FileText,
  Users,
  FileCheck,
  BarChart3,
  FolderKanban,
  User,
  Settings,
  LogOut,
  X,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const defaultNavItems: NavItem[] = [
  { id: 'home', label: 'الرئيسية', icon: <Home size={20} /> },
  { id: 'courses', label: 'المقررات', icon: <BookOpen size={20} /> },
  { id: 'lessons', label: 'الدروس', icon: <Video size={20} /> },
  { id: 'quizzes', label: 'الاختبارات', icon: <FileText size={20} /> },
  { id: 'students', label: 'الطلاب', icon: <Users size={20} /> },
  { id: 'assignments', label: 'الواجبات', icon: <FileCheck size={20} /> },
  { id: 'analytics', label: 'التقارير والتحليلات', icon: <BarChart3 size={20} /> },
  { id: 'groups', label: 'المجموعات', icon: <FolderKanban size={20} /> },
  { id: 'profile', label: 'الملف الشخصي', icon: <User size={20} /> },
  { id: 'settings', label: 'الإعدادات', icon: <Settings size={20} /> },
];

interface SidebarProps {
  activeTab: string;
  onSelectTab: (id: string) => void;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  navItems?: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
  navItems = defaultNavItems,
}) => {
  return (
    <>
      
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

     
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-[#091523] text-white z-50 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out border-l border-slate-800 ${
          isMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
         
          <div className="px-3 pt-5 pb-2 flex items-center justify-center relative">
            <img
              src="/logo.png"
              alt="منصة الصادق في الكيمياء"
              className="h-32 sm:h-36 w-full max-w-[240px] object-contain mx-auto"
            />

            
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden absolute left-3 top-6 text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X size={20} />
              </button>
            )}
          </div>

          
          <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#0D8A82] text-white shadow-lg shadow-teal-900/40'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          
          <div className="px-3 py-1">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition cursor-pointer"
            >
              <LogOut size={20} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>

        
        <div className="p-3 pb-4 flex flex-col items-center justify-center text-center space-y-1.5">
          <img
            src="/bottomSideBar.png"
            alt="منصة الصادق"
            className="w-full max-w-[130px] h-auto object-contain rounded-xl"
          />
          <p className="text-[11px] text-slate-400 font-medium">
            Made by{' '}
            <a
              href="https://www.facebook.com/mahmoud.azaab.376/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#0D8A82] hover:underline"
            >
              azb
            </a>{' '}
            & <span className="font-bold text-[#0D8A82]">ma7arek</span>
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
