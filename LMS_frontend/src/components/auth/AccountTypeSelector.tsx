import React from 'react';
import { GraduationCap, User, CheckCircle2 } from 'lucide-react';
import type { AccountType } from './useLoginLogic';

interface AccountTypeSelectorProps {
  accountType: AccountType;
  onSelectType: (type: AccountType) => void;
}

export const AccountTypeSelector: React.FC<AccountTypeSelectorProps> = ({
  accountType,
  onSelectType,
}) => {
  return (
    <>
      {/* Account Type Selector Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => onSelectType('student')}
            className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
              accountType === 'student'
                ? 'bg-[#0D8A82] text-white shadow-md shadow-teal-700/25 hover:bg-[#0B766F] hover:shadow-lg hover:-translate-y-0.5'
                : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-[#0D8A82]/50 hover:text-[#0D8A82] hover:shadow-sm hover:-translate-y-0.5'
            }`}
          >
            <GraduationCap size={20} />
            <span>طالب</span>
            {accountType === 'student' && (
              <CheckCircle2 size={18} className="text-white fill-white/20" />
            )}
          </button>
          <div
            className={`h-1 w-12 rounded-full mt-2 transition-all duration-300 ${
              accountType === 'student' ? 'bg-[#0D8A82]' : 'bg-transparent'
            }`}
          />
        </div>

        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => onSelectType('teacher')}
            className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
              accountType === 'teacher'
                ? 'bg-[#0D8A82] text-white shadow-md shadow-teal-700/25 hover:bg-[#0B766F] hover:shadow-lg hover:-translate-y-0.5'
                : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-[#0D8A82]/50 hover:text-[#0D8A82] hover:shadow-sm hover:-translate-y-0.5'
            }`}
          >
            <User size={20} />
            <span>مدرس</span>
            {accountType === 'teacher' && (
              <CheckCircle2 size={18} className="text-white fill-white/20" />
            )}
          </button>
          <div
            className={`h-1 w-12 rounded-full mt-2 transition-all duration-300 ${
              accountType === 'teacher' ? 'bg-[#0D8A82]' : 'bg-transparent'
            }`}
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6 mt-2">
        <span className="text-base font-bold text-slate-800">
          {accountType === 'teacher' ? 'تسجيل دخول المدرس' : 'تسجيل دخول الطالب'}
        </span>
        {accountType === 'teacher' ? (
          <User size={20} className="text-[#0D8A82]" />
        ) : (
          <GraduationCap size={20} className="text-[#0D8A82]" />
        )}
      </div>
    </>
  );
};

export default AccountTypeSelector;

