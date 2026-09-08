import React, { useState } from 'react';
import {
  User,
  Phone,
  Users,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  ShieldCheck,
  KeyRound,
  Edit3,
} from 'lucide-react';
import { useAuth } from '../../../context/useAuth';
import { StudentQRCode } from './StudentQRCode';
import { StudentGradebookCard } from './StudentGradebookCard';
import { RedeemAccessCodeModal } from './RedeemAccessCodeModal';
import { EditStudentProfileModal } from './EditStudentProfileModal';

export const StudentProfileCard: React.FC = () => {
  const { user } = useAuth();
  const [isRedeemCodeOpen, setIsRedeemCodeOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const name = user?.name || 'غير متوفر';
  const phone = user?.phone || 'غير متوفر';
  const groupId = user?.groupId || 'غير متوفر';
  const hasActiveSubscription = user?.hasActiveSubscription ?? false;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pb-6 border-b border-slate-100 text-center sm:text-right">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-teal-50 text-[#0D8A82] flex items-center justify-center shrink-0 border border-teal-100 shadow-sm">
              <GraduationCap size={40} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                <h3 className="text-xl font-black text-slate-800">{name}</h3>
                <span className="px-3 py-1 rounded-xl bg-teal-50 text-[#0D8A82] text-xs font-bold border border-teal-100 flex items-center gap-1">
                  <User size={14} />
                  <span>طالب في المنصة</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold">
                بيانات الحساب والاشتراك في منصة الصادق للتعليم التفاعلي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            <button
              type="button"
              onClick={() => setIsRedeemCodeOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <KeyRound size={15} />
              <span>تفعيل كود الوصول 🔑</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Edit3 size={15} />
              <span>تعديل البيانات ✏️</span>
            </button>
          </div>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white text-[#0D8A82] flex items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs">
              <User size={20} />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">الاسم الكامل</span>
              <span className="text-sm font-extrabold text-slate-800">{name}</span>
            </div>
          </div>

          
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white text-[#0D8A82] flex items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs">
              <Phone size={20} />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">رقم الهاتف المسجل</span>
              <span className="text-sm font-extrabold text-slate-800 dir-ltr text-right">{phone}</span>
            </div>
          </div>

          
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white text-[#0D8A82] flex items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs">
              <Users size={20} />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">المجموعة / الشعبة</span>
              <span className="text-sm font-extrabold text-slate-800">{groupId}</span>
            </div>
          </div>

          
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${
                hasActiveSubscription
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-amber-50 text-amber-600 border-amber-200'
              }`}
            >
              {hasActiveSubscription ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-bold block">حالة الاشتراك في المنصة</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                    hasActiveSubscription
                      ? 'bg-emerald-100/80 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100/80 text-amber-800 border-amber-300'
                  }`}
                >
                  {hasActiveSubscription ? 'اشتراكك نشط ومفعل' : 'الاشتراك غير مفعل'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Student QR Code Section */}
        <StudentQRCode />

        
        <div className="bg-teal-50/60 rounded-2xl p-4 border border-teal-100/80 flex items-center gap-3 text-slate-600">
          <ShieldCheck size={20} className="text-[#0D8A82] shrink-0" />
          <p className="text-xs font-semibold leading-relaxed">
            بيانات الحساب المعروضة هنا مرتبطة بحسابك الرسمي على المنصة ومحمية بواسطة إدارة النظام.
          </p>
        </div>
      </div>

      {/* Cumulative Student Gradebook Card */}
      <StudentGradebookCard />

      {/* Redeem Access Code Modal */}
      <RedeemAccessCodeModal
        isOpen={isRedeemCodeOpen}
        onClose={() => setIsRedeemCodeOpen(false)}
      />

      {/* Edit Profile Modal */}
      <EditStudentProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentName={name}
      />
    </div>
  );
};

export default StudentProfileCard;

