import React, { useState } from 'react';
import { Sidebar, defaultNavItems, type NavItem } from './Sidebar';
import { Topbar } from './Topbar';
import { Footer } from '../layout/Footer';
import { useAuth } from '../../context/useAuth';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onSelectTab: (id: string) => void;
  navItems?: NavItem[];
  subtitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  onSelectTab,
  navItems = defaultNavItems,
  subtitle,
}) => {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const displayRole =
    user?.role === 'student'
      ? 'طالب منصة الصادق'
      : user?.role === 'teacher'
      ? 'مدرس الكيمياء'
      : 'مدير النظام';

  return (
    <div dir="rtl" className="min-h-screen bg-[#F7F9FC] font-sans flex text-slate-800 antialiased">
      
      
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        onLogout={logout}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        navItems={navItems}
      />

     
      <div className="flex-1 flex flex-col min-w-0 lg:mr-64 transition-all duration-300">
        
        
        <Topbar
          userName={user?.name || 'الأستاذ الصادق'}
          userRole={displayRole}
          subtitle={subtitle}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />

       
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {children}
        </main>

        
        <Footer platformName="منصة الصادق في الكيمياء" />
      </div>

    </div>
  );
};

export default DashboardLayout;
