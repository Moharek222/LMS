import React from 'react';
import { Footer } from './Footer';
import { ShieldCheck } from 'lucide-react';

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  securityText?: string;
}

export const AuthSplitLayout: React.FC<AuthSplitLayoutProps> = ({
  children,
  securityText = 'منصة آمنة ومحمية',
}) => {
  return (
    <div
      dir="rtl"
      className="min-h-screen lg:h-screen w-full flex flex-col lg:grid lg:grid-cols-5 font-sans bg-[#091523] lg:bg-slate-50 overflow-y-auto lg:overflow-hidden"
    >
      {/* Mobile Header Image Banner */}
      <div className="lg:hidden relative w-full h-64 sm:h-72 bg-[#091523] shrink-0 overflow-hidden">
        <img
          src="/newmobile.png"
          alt="منصة الصادق في الكيمياء"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#091523]/20 to-[#091523]/80 pointer-events-none" />
      </div>

      {/* Form Card Container */}
      <div className="lg:col-span-2 flex flex-col justify-center items-center px-6 py-8 sm:px-10 lg:px-12 bg-[#FAFBFC] rounded-t-[2.5rem] lg:rounded-none -mt-10 lg:mt-0 relative z-20 shadow-2xl lg:shadow-lg min-h-[calc(100vh-13rem)] lg:min-h-full lg:overflow-y-auto">
        <div className="w-full max-w-md my-auto py-2">
          {children}

          <div className="flex flex-col items-center justify-center gap-1 mt-5 text-slate-400">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-semibold">{securityText}</span>
              <ShieldCheck size={16} />
            </div>
            <Footer variant="card" />
          </div>
        </div>
      </div>

      {/* Desktop Banner Image Column */}
      <div className="hidden lg:block lg:col-span-3 relative h-full w-full overflow-hidden select-none bg-[#091523]">
        <img
          src="/slogan8k3.png"
          alt="منصة الصادق - تعلم الكيمياء بفهم وتطبيق وثقة"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
};

