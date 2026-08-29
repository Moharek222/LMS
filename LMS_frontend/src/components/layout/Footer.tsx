import React from 'react';

interface FooterProps {
  platformName?: string;
  variant?: 'page' | 'card';
}

export const Footer: React.FC<FooterProps> = ({
  platformName = 'منصة الصادق في الكيمياء',
  variant = 'page',
}) => {
  const credits = (
    <span>
      Made by{' '}
      <a
        href="https://www.facebook.com/mahmoud.azaab.376/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold text-[#0D8A82] hover:underline"
      >
        AZB
      </a>{' '}
      & <span className="font-bold text-[#0D8A82]">ma7arek</span>
    </span>
  );

  if (variant === 'card') {
    return (
      <p className="text-[11px] text-slate-400 font-medium mt-1">
        {credits}
      </p>
    );
  }

  return (
    <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs font-semibold text-slate-500 mt-auto flex flex-col sm:flex-row items-center justify-center gap-2">
      <span>{platformName} &copy; {new Date().getFullYear()}</span>
      <span className="hidden sm:inline text-slate-300">|</span>
      {credits}
    </footer>
  );
};

export default Footer;
