import React, { useState } from 'react';
import {
  X,
  Award,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Save,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import {
  useTeacherExamSubmissionDetails,
  useGradeEssayQuestions,
} from '../../../exams/hooks/useTeacherExamSubmissions';
import { useToast } from '../../../../context/ToastContext';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import type { GradeInputItem } from '../../../exams/types/examSubmission';

interface GradeSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  examId: string;
  submissionId: string | null;
}

export const GradeSubmissionModal: React.FC<GradeSubmissionModalProps> = ({
  isOpen,
  onClose,
  courseId,
  examId,
  submissionId,
}) => {
  const toast = useToast();

  const { data, isLoading, isError, error } = useTeacherExamSubmissionDetails(
    courseId,
    examId,
    submissionId
  );

  const gradeEssayMutation = useGradeEssayQuestions();

  const submission = data?.data;

  const [essayGrades, setEssayGrades] = useState<Record<string, { score: number; feedback: string }>>({});

  if (!isOpen || !submissionId) return null;

  const getEffectiveGrade = (qId: string, defaultScore = 0, defaultFeedback = '') => {
    return essayGrades[qId] ?? { score: defaultScore, feedback: defaultFeedback };
  };

  const handleScoreChange = (qId: string, val: number, defaultFeedback = '') => {
    setEssayGrades((prev) => ({
      ...prev,
      [qId]: {
        feedback: prev[qId]?.feedback ?? defaultFeedback,
        score: val,
      },
    }));
  };

  const handleFeedbackChange = (qId: string, val: string, defaultScore = 0) => {
    setEssayGrades((prev) => ({
      ...prev,
      [qId]: {
        score: prev[qId]?.score ?? defaultScore,
        feedback: val,
      },
    }));
  };

  const handleSubmitGrades = () => {
    if (!submission) return;

    const essayList = submission.answers?.filter((a) => a.type === 'ESSAY') || [];
    const gradesPayload: GradeInputItem[] = essayList.map((ans) => {
      const item = getEffectiveGrade(ans.questionID, ans.score || 0, ans.teacherFeedback || '');
      return {
        questionID: ans.questionID,
        score: item.score,
        teacherFeedback: item.feedback,
      };
    });

    gradeEssayMutation.mutate(
      {
        courseId,
        examId,
        submissionId,
        payload: { grades: gradesPayload },
      },
      {
        onSuccess: () => {
          toast.success('تم تصحيح وحفظ درجات الأسئلة المقالية بنجاح.');
          onClose();
        },
        onError: (err) => {
          toast.error(toArabicErrorMessage(err, 'حدث خطأ أثناء حفظ درجات التصحيح'));
        },
      }
    );
  };

  const essayAnswers = submission?.answers?.filter((a) => a.type === 'ESSAY') || [];
  const mcqAnswers = submission?.answers?.filter((a) => a.type === 'MCQ') || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100">
              <Award size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">تفاصيل وتصحيح امتحان الطالب</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                مراجعة إجابات الطالب ورصد درجات الأسئلة المقالية
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 space-y-6 pr-1">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 size={36} className="animate-spin text-[#0D8A82]" />
              <p className="text-xs font-bold text-slate-600">جاري تحميل تفاصيل تسليم الطالب...</p>
            </div>
          ) : isError ? (
            <div className="p-6 rounded-2xl border border-red-200 bg-red-50/50 text-center space-y-2">
              <AlertTriangle size={32} className="text-red-500 mx-auto" />
              <p className="text-xs font-bold text-slate-800">
                {toArabicErrorMessage(error, 'تعذر تحميل بيانات التسليم حالياً')}
              </p>
            </div>
          ) : !submission ? (
            <div className="p-6 text-center text-xs font-bold text-slate-500">
              بيانات التسليم غير متوفرة
            </div>
          ) : (
            <>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-[#0D8A82] flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
                    <User size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold block">الطالب</span>
                    <span className="text-xs font-extrabold text-slate-800">
                      {submission.studentID?.name || 'غير متوفر'}
                    </span>
                    {submission.studentID?.phone && (
                      <span className="text-[11px] text-slate-500 font-semibold dir-ltr block text-right mt-0.5">
                        {submission.studentID.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-[#0D8A82] flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
                    <Award size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold block">مجموع الدرجات الحالي</span>
                    <span className="text-xs font-extrabold text-slate-800">
                      {submission.totalScore} من {submission.totalExamPoints}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold block">حالة التصحيح</span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border mt-0.5 ${
                        submission.status === 'GRADED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {submission.status === 'GRADED' ? 'تم التصحيح بالكامل' : 'بحاجة لتصحيح المقالي'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <MessageSquare size={18} className="text-[#0D8A82]" />
                  <span>الأسئلة المقالية ({essayAnswers.length})</span>
                </h4>

                {essayAnswers.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-xs font-bold text-slate-500 border border-slate-200/60">
                    لا توجد أسئلة مقالية في هذا الامتحان
                  </div>
                ) : (
                  <div className="space-y-4">
                    {essayAnswers.map((ans, idx) => {
                      const currentGrade = getEffectiveGrade(
                        ans.questionID,
                        ans.score || 0,
                        ans.teacherFeedback || ''
                      );

                      return (
                        <div
                          key={ans.questionID || idx}
                          className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/70 space-y-3"
                        >
                          <div className="flex items-center justify-between text-xs font-extrabold text-amber-900">
                            <span>السؤال المقالي #{idx + 1}</span>
                            {ans.maxScore !== undefined && (
                              <span className="text-xs font-bold text-amber-700">
                                الدرجة العظمى: {ans.maxScore}
                              </span>
                            )}
                          </div>

                          {ans.questionText && (
                            <p className="text-xs font-bold text-slate-800 bg-white p-3 rounded-xl border border-slate-200/80">
                              {ans.questionText}
                            </p>
                          )}

                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 block">إجابة الطالب النصية:</span>
                            <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-800 whitespace-pre-wrap leading-relaxed">
                              {ans.studentAnswer || ans.essayAnswerText || ans.selectedAnswer || 'لم يقدم الطالب إجابة نصية'}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                رصد الدرجة المستحقة *
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={ans.maxScore || 100}
                                value={currentGrade.score}
                                onChange={(e) => {
                                  const raw = Number(e.target.value);
                                  const safeVal = isNaN(raw) ? 0 : raw;
                                  const clamped =
                                    ans.maxScore !== undefined
                                      ? Math.min(Math.max(0, safeVal), ans.maxScore)
                                      : Math.max(0, safeVal);
                                  handleScoreChange(
                                    ans.questionID,
                                    clamped,
                                    ans.teacherFeedback || ''
                                  );
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:border-[#0D8A82]"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                ملاحظات المعلم للطالب (اختياري)
                              </label>
                              <input
                                type="text"
                                placeholder="اكتب ملاحظة أو توجيه للطالب..."
                                value={currentGrade.feedback}
                                onChange={(e) =>
                                  handleFeedbackChange(ans.questionID, e.target.value, ans.score || 0)
                                }
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-[#0D8A82]"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {mcqAnswers.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <HelpCircle size={18} className="text-[#0D8A82]" />
                    <span>ملخص أسئلة الاختيارات التلقائية ({mcqAnswers.length})</span>
                  </h4>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {mcqAnswers.map((ans, idx) => {
                      const studentAnsText = ans.studentAnswer || ans.selectedAnswer || 'بدون إجابة';
                      return (
                        <div
                          key={ans.questionID || idx}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            {ans.score > 0 || ans.isCorrect ? (
                              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle size={16} className="text-rose-500 shrink-0" />
                            )}
                            <span className="font-bold text-slate-800">
                              سؤال اختيار #{idx + 1}: {studentAnsText}
                            </span>
                          </div>
                          <span className="font-extrabold text-slate-700">
                            الدرجة: {ans.score}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
          >
            إغلاق
          </button>

          {essayAnswers.length > 0 && (
            <button
              type="button"
              onClick={handleSubmitGrades}
              disabled={gradeEssayMutation.isPending || isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {gradeEssayMutation.isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>جاري حفظ الدرجات...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>حفظ واعتماد تصحيح المقالي</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeSubmissionModal;
