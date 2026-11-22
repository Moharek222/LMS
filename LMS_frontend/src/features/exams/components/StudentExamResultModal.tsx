import React from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  FileCheck,
  Award,
  MessageSquareQuote,
  Sparkles,
} from 'lucide-react';
import { useStudentExamResult } from '../hooks/useStudentExamResult';
import { toArabicErrorMessage } from '../../../utils/errorMessage';

interface StudentExamResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
  examId?: string;
  submissionId: string;
  examTitle?: string;
}

export const StudentExamResultModal: React.FC<StudentExamResultModalProps> = ({
  isOpen,
  onClose,
  courseId,
  examId,
  submissionId,
  examTitle,
}) => {
  const { data, isLoading, isError, error } = useStudentExamResult(
    courseId,
    examId,
    submissionId,
    isOpen
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-right"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
              <FileCheck size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800 line-clamp-1">
                {data?.examID?.title || examTitle || 'تفاصيل ورقة الامتحان والتصحيح'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                مراجعة الإجابات المسجلة والحلول النموذجية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer shrink-0"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 size={36} className="animate-spin text-[#0D8A82]" />
              <p className="text-xs font-bold text-slate-600">
                جاري تحميل تفاصيل ورقة الإجابة والتصحيح...
              </p>
            </div>
          ) : isError ? (
            <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
                <AlertTriangle size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-800">تعذر تحميل تفاصيل النتيجة</h4>
              <p className="text-xs text-slate-600 font-semibold max-w-md mx-auto">
                {toArabicErrorMessage(error, 'حدث خطأ أثناء جلب نتيجة الامتحان.')}
              </p>
            </div>
          ) : !data || data.resultsPublished === false || data.status === 'PENDING' ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-amber-50/60 border border-amber-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                <Clock size={32} />
              </div>
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-200/60 text-amber-900 border border-amber-300">
                  قيد المراجعة والاعتماد
                </span>
                <h4 className="text-base font-extrabold text-slate-800 pt-1">
                  النتيجة لم تُنشر بعد رسمياً
                </h4>
                <p className="text-xs text-slate-600 font-semibold max-w-md mx-auto leading-relaxed">
                  تم تسليم إجاباتك وحفظها بنجاح في النظام. سيتم إظهار تفاصيل ورقة الإجابة والحلول النموذجية فور قيام المعلم بنشر النتائج رسمياً.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Score Summary Box */}
              {(() => {
                const totalPoints = data.totalExamPoints || 1;
                const totalScore = data.totalScore ?? 0;
                const percentage = Math.round((totalScore / totalPoints) * 100);
                const isPassed = percentage >= 50;

                const correctCount = data.answers.filter((a) => a.isCorrect).length;
                const totalCount = data.answers.length;

                return (
                  <div className="bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-3xl p-5 sm:p-6 border border-slate-200 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <Award size={20} className="text-[#0D8A82]" />
                        <span className="text-xs font-black text-slate-700">بطاقة التقييم النهائي</span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                          isPassed
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        <span>{isPassed ? 'تم اجتياز الامتحان بنجاح 🏆' : 'لم يتم اجتياز الامتحان'}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-400 block">إجمالي الدرجة</span>
                        <span className="text-lg font-black text-slate-800">
                          {totalScore} / {totalPoints}
                        </span>
                      </div>

                      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-400 block">النسبة المئوية</span>
                        <span className="text-lg font-black text-[#0D8A82]">
                          {percentage}%
                        </span>
                      </div>

                      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-400 block">إجابات صحيحة</span>
                        <span className="text-lg font-black text-emerald-600">
                          {correctCount} من {totalCount}
                        </span>
                      </div>

                      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
                        <span className="text-[11px] font-bold text-slate-400 block">درجات الاختياري / المقالي</span>
                        <span className="text-xs font-extrabold text-slate-700 block mt-1">
                          اختياري: {data.mcqScore} | مقالي: {data.essayScore}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Questions Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 px-1">
                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Sparkles size={16} className="text-[#0D8A82]" />
                    <span>مراجعة الأسئلة والإجابات النموذجية</span>
                  </h4>
                  <span className="text-xs font-bold text-slate-500">
                    عدد الأسئلة: {data.answers.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {data.answers.map((answer, index) => {
                    const isMCQ = answer.type === 'MCQ';
                    const isCorrect = answer.isCorrect;

                    return (
                      <div
                        key={answer.questionID || index}
                        className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all ${
                          isCorrect
                            ? 'border-emerald-200/80 hover:border-emerald-300'
                            : 'border-rose-200/80 hover:border-rose-300'
                        } shadow-xs space-y-4`}
                      >
                        {/* Question Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-rose-600 text-white'
                              }`}
                            >
                              {index + 1}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                              {isMCQ ? 'اختيار من متعدد' : 'سؤال مقالي'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border ${
                                isCorrect
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {isCorrect ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                              <span>
                                {isCorrect ? 'إجابة صحيحة' : 'إجابة خاطئة'} ({answer.earnedScore} / {answer.points} درجة)
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Question Text */}
                        {answer.question && (
                          <h5 className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed">
                            {answer.question}
                          </h5>
                        )}

                        {/* Question Image (if exists) */}
                        {answer.questionImage && answer.questionImage.trim() && (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 flex items-center justify-center overflow-hidden">
                            <img
                              src={answer.questionImage.trim()}
                              alt={`صورة السؤال ${index + 1}`}
                              className="max-h-72 object-contain rounded-xl"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        {/* MCQ Options Rendering */}
                        {isMCQ && (
                          <div className="space-y-2.5 pt-1">
                            {(answer.options || []).map((optionText, optIdx) => {
                              const isStudentAnswer =
                                answer.studentAnswer &&
                                answer.studentAnswer.trim() === optionText.trim();
                              const isModelCorrect =
                                answer.correctAnswer &&
                                answer.correctAnswer.trim() === optionText.trim();

                              let optionStyle = 'bg-slate-50/50 border-slate-200 text-slate-700';
                              let badge = null;

                              if (isStudentAnswer && isCorrect) {
                                // Correct student answer: Green
                                optionStyle =
                                  'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold';
                                badge = (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-600 text-white shrink-0">
                                    <CheckCircle2 size={12} />
                                    <span>إجابتك (صحيحة)</span>
                                  </span>
                                );
                              } else if (isStudentAnswer && !isCorrect) {
                                // Incorrect student answer: Red
                                optionStyle =
                                  'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 text-rose-950 font-bold';
                                badge = (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-600 text-white shrink-0">
                                    <XCircle size={12} />
                                    <span>إجابتك (خاطئة)</span>
                                  </span>
                                );
                              } else if (isModelCorrect && !isCorrect) {
                                // Model correct answer when student answered wrong: Emerald
                                optionStyle =
                                  'bg-emerald-50/70 border-emerald-500 border-dashed text-emerald-900 font-bold';
                                badge = (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-600 text-white shrink-0">
                                    <CheckCircle2 size={12} />
                                    <span>الإجابة الصحيحة</span>
                                  </span>
                                );
                              }

                              return (
                                <div
                                  key={optIdx}
                                  className={`rounded-2xl p-3.5 border transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`w-7 h-7 rounded-lg font-extrabold text-xs flex items-center justify-center shrink-0 border ${
                                        isStudentAnswer && isCorrect
                                          ? 'bg-emerald-600 text-white border-emerald-600'
                                          : isStudentAnswer && !isCorrect
                                          ? 'bg-rose-600 text-white border-rose-600'
                                          : isModelCorrect && !isCorrect
                                          ? 'bg-emerald-600 text-white border-emerald-600'
                                          : 'bg-white text-slate-500 border-slate-200'
                                      }`}
                                    >
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span className="text-xs sm:text-sm font-semibold">
                                      {optionText}
                                    </span>
                                  </div>

                                  {badge}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Essay Answer Rendering */}
                        {!isMCQ && (
                          <div className="space-y-3 pt-1">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-500 block">
                                إجابتك المسجلة:
                              </span>
                              <p className="text-xs sm:text-sm font-semibold text-slate-800 whitespace-pre-wrap leading-relaxed">
                                {answer.studentAnswer || 'لم يتم كتابة إجابة'}
                              </p>
                            </div>

                            {answer.teacherFeedback && answer.teacherFeedback.trim() && (
                              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-1.5">
                                <span className="text-[11px] font-bold text-[#0D8A82] flex items-center gap-1.5">
                                  <MessageSquareQuote size={14} />
                                  <span>ملاحظات وتقييم المعلم:</span>
                                </span>
                                <p className="text-xs sm:text-sm font-semibold text-teal-950 whitespace-pre-wrap leading-relaxed">
                                  {answer.teacherFeedback}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition cursor-pointer shadow-xs"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentExamResultModal;

