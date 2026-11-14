import React from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import type { AdminUserItem } from '../api/adminUserApi';

interface DeleteAdminModalProps {
  admin: AdminUserItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteAdminModal: React.FC<DeleteAdminModalProps> = ({
  admin,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!admin) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-admin-title"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h4 id="delete-admin-title" className="text-base font-extrabold text-slate-800">
              تأكيد حذف حساب المدير
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              هذا الإجراء نهائي ولا يمكن التراجع عنه
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          هل أنت متأكد من حذف حساب المدير{' '}
          <strong className="text-slate-900 font-bold">({admin.name})</strong> المسجل بالبريد{' '}
          <span dir="ltr" className="font-bold text-slate-800">
            {admin.email}
          </span>
          ؟ لن يتمكن هذا الحساب من الدخول للوحة الإدارة بعد الحذف.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>جاري الحذف...</span>
              </>
            ) : (
              <>
                <Trash2 size={15} />
                <span>تأكيد الحذف</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

