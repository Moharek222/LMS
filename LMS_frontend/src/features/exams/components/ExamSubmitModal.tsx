import React from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ExamSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSubmit: () => void;
  isSubmitting: boolean;
  answeredCount: number;
  totalQuestions: number;
}

export const ExamSubmitModal: React.FC<ExamSubmitModalProps> = ({
  isOpen,
  onClose,
  onConfirmSubmit,
  isSubmitting,
  answeredCount,
  totalQuestions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-xl space-y-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
          <Send size={28} />
        </div>

        <div className="space-y-1">
          <h4 className="text-lg font-black text-slate-800">تأكيد تسليم الامتحان</h4>
          <p className="text-xs text-slate-500 font-semibold">
            تمت الإجابة على {answeredCount} من أصل {totalQuestions} سؤالاً.
          </p>
        </div>

        {answeredCount === 0 ? (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
            تنبيه: يجب الإجابة على سؤال واحد على الأقل قبل تسليم الامتحان.
          </div>
        ) : answeredCount < totalQuestions ? (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            تنبيه: هناك {totalQuestions - answeredCount} أسئلة لم تقم بالإجابة عليها بعد!
          </div>
        ) : null}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirmSubmit}
            disabled={isSubmitting || answeredCount === 0}
            className="w-1/2 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            <span>تأكيد التسليم</span>
          </button>
        </div>
      </div>
    </div>
  );
};
