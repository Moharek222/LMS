import React from 'react';
import { Award, BookOpen, CheckCircle2, XCircle, TrendingUp, Loader2, FileCheck } from 'lucide-react';
import { useStudentQuizHistory } from '../hooks/useStudentQuizHistory';
import { useStudentExamHistory } from '../hooks/useStudentExamHistory';

export const StudentGradebookCard: React.FC = () => {
  const { data: quizData, isLoading: isLoadingQuizzes } = useStudentQuizHistory({ page: 1, limit: 20 });
  const { data: examData, isLoading: isLoadingExams } = useStudentExamHistory({ page: 1, limit: 20 });

  const quizzes = quizData?.data || [];
  const exams = examData?.data || [];

  const isLoading = isLoadingQuizzes || isLoadingExams;

  const totalQuizzes = quizzes.length;
  const passedQuizzes = quizzes.filter((q) => q.isPassed).length;
  const avgQuizScore =
    totalQuizzes > 0
      ? Math.round(quizzes.reduce((acc, q) => acc + (q.score || 0), 0) / totalQuizzes)
      : 0;

  const totalExams = exams.length;
  const passedExams = exams.filter((e) => e.isPassed).length;
  const avgExamScore =
    totalExams > 0
      ? Math.round(exams.reduce((acc, e) => acc + (e.score || 0), 0) / totalExams)
      : 0;

  const totalAssessments = totalQuizzes + totalExams;
  const totalPassed = passedQuizzes + passedExams;
  const overallPassRate = totalAssessments > 0 ? Math.round((totalPassed / totalAssessments) * 100) : 0;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100">
            <Award size={24} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800">السجل الأكاديمي للدرجات 🎓</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              ملخص الأداء التراكمي في جميع الاختبارات والامتحانات الشاملة
            </p>
          </div>
        </div>

        {totalAssessments > 0 && (
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold flex items-center gap-1.5">
            <TrendingUp size={15} />
            <span>نسبة النجاح العامة: {overallPassRate}%</span>
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
          <Loader2 size={32} className="animate-spin text-[#0D8A82]" />
          <p className="text-xs font-bold text-slate-600">جاري تحميل سجل درجات الطالب...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Exam KPI */}
            <div className="bg-teal-50/60 rounded-2xl p-4 border border-teal-100 space-y-1">
              <div className="flex items-center justify-between text-[#0D8A82]">
                <span className="text-[11px] font-bold">الامتحانات الشاملة</span>
                <FileCheck size={18} />
              </div>
              <div className="text-2xl font-black text-[#0D8A82]">{totalExams}</div>
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 pt-1 border-t border-teal-100/60">
                <span>المحاولات الناجحة: {passedExams}</span>
                <span>المتوسط: {avgExamScore} درجة</span>
              </div>
            </div>

            {/* Quiz KPI */}
            <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-100 space-y-1">
              <div className="flex items-center justify-between text-amber-700">
                <span className="text-[11px] font-bold">الكويزات القصيرة</span>
                <BookOpen size={18} />
              </div>
              <div className="text-2xl font-black text-amber-800">{totalQuizzes}</div>
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 pt-1 border-t border-amber-100/60">
                <span>المكتملة بنجاح: {passedQuizzes}</span>
                <span>المتوسط: {avgQuizScore} درجة</span>
              </div>
            </div>

            {/* Overall Aggregate */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px] font-bold">إجمالي التقييمات المسجلة</span>
                <Award size={18} />
              </div>
              <div className="text-2xl font-black text-slate-800">{totalAssessments}</div>
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-200/60">
                <span>عدد الناجحة: {totalPassed}</span>
                <span>نسبة الأداء: {overallPassRate}%</span>
              </div>
            </div>
          </div>

          {/* Recent Exam Submissions List */}
          {exams.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                <FileCheck size={15} className="text-[#0D8A82]" />
                <span>آخر نتائج الامتحانات الشاملة:</span>
              </h4>
              <div className="space-y-2">
                {exams.slice(0, 5).map((ex) => (
                  <div
                    key={ex._id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs font-semibold gap-2"
                  >
                    <div>
                      <span className="font-extrabold text-slate-800 block">
                        {ex.examID?.title || 'امتحان شامل'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        الدرجة المحصلة: {ex.score}
                      </span>
                    </div>

                    {ex.isPassed ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        <span>اجتاز الامتحان</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1">
                        <XCircle size={13} />
                        <span>لم يجتز الامتحان</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalAssessments === 0 && (
            <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center space-y-1">
              <BookOpen size={28} className="text-slate-300 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-600">
                لم تقم بحل وتأدية أية امتحانات أو كويزات بعد.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentGradebookCard;
