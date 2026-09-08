import React from 'react';
import { FileCheck, AlertTriangle, Loader2, RefreshCw, BookOpen } from 'lucide-react';
import { useCourseExams } from '../hooks/useCourseExams';
import { ExamCard } from './ExamCard';
import type { ExamListItem } from '../types/exam';
import { toArabicErrorMessage } from '../../../utils/errorMessage';

interface ExamListProps {
  courseId?: string;
  onSelectExam?: (exam: ExamListItem) => void;
}

export const ExamList: React.FC<ExamListProps> = ({ courseId, onSelectExam }) => {
  const { data: exams, isLoading, isError, error, refetch } = useCourseExams(courseId);

  if (!courseId) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <BookOpen size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-800">يرجى اختيار كورس دراسي أولاً</h4>
        <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
          اختر الكورس المطلوب من قسم الكورسات للتعرف على الامتحانات الشاملة المتاحة لهذا الكورس.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3 min-h-65">
        <Loader2 size={36} className="animate-spin text-[#0D8A82]" />
        <p className="text-xs font-bold text-slate-600">جاري تحميل امتحانات الكورس...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl p-8 border border-red-200 bg-red-50/40 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center border border-red-200">
          <AlertTriangle size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-800">حدث خطأ أثناء تحميل الامتحانات</h4>
        <p className="text-xs text-slate-600 font-semibold max-w-md">
          {toArabicErrorMessage(error, 'تعذر تحميل امتحانات الكورس حالياً.')}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs mt-2"
        >
          <RefreshCw size={14} />
          <span>إعادة المحاولة</span>
        </button>
      </div>
    );
  }

  if (!exams || exams.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xs text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center mx-auto border border-teal-100">
          <FileCheck size={28} />
        </div>
        <h4 className="text-base font-bold text-slate-800">لا توجد امتحانات مضافة لهذا الكورس حالياً</h4>
        <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto">
          سيتم إضافة الامتحانات الشاملة وتحديد مواعيدها تلقائياً من قبل المدرس.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
          <FileCheck size={18} className="text-[#0D8A82]" />
          <span>الامتحانات الشاملة الكورس المSelected</span>
        </h4>
        <span className="text-xs font-bold text-slate-400">
          عدد الامتحانات: {exams.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {exams.map((exam) => (
          <ExamCard key={exam._id} exam={exam} onStart={onSelectExam} />
        ))}
      </div>
    </div>
  );
};

export default ExamList;
