import React from 'react';
import { AlertTriangle, ArrowRight, ArrowLeft, Send, Loader2 } from 'lucide-react';
import type { StudentExamQuestion } from '../types/exam';

interface ExamQuestionCardProps {
  currentQuestion: StudentExamQuestion;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentAnswer: string;
  submitErrorMessage: string | null;
  setSubmitErrorMessage: (msg: string | null) => void;
  isDisabled: boolean;
  isSubmitting: boolean;
  onSelectOption: (questionId: string, answer: string) => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  onOpenConfirmModal: () => void;
}

export const ExamQuestionCard: React.FC<ExamQuestionCardProps> = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  currentAnswer,
  submitErrorMessage,
  setSubmitErrorMessage,
  isDisabled,
  isSubmitting,
  onSelectOption,
  onPrevQuestion,
  onNextQuestion,
  onOpenConfirmModal,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {submitErrorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="shrink-0 text-rose-600" />
            <span>{submitErrorMessage}</span>
          </div>
          <button
            onClick={() => setSubmitErrorMessage(null)}
            className="text-rose-600 hover:text-rose-800 text-xs font-black cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      
      <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
        <span className="w-9 h-9 rounded-xl bg-[#0D8A82] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
          {currentQuestionIndex + 1}
        </span>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-teal-50 text-[#0D8A82] border border-teal-200">
              {currentQuestion.type === 'ESSAY' ? 'سؤال مقالي' : 'اختيار من متعدد'}
            </span>
            {typeof currentQuestion.points === 'number' && (
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                {currentQuestion.points} {currentQuestion.points === 1 ? 'درجة' : 'درجات'}
              </span>
            )}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
            {currentQuestion.question}
          </h2>
        </div>
      </div>

     
      {currentQuestion.questionImage?.trim() && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 flex items-center justify-center overflow-hidden">
          <img
            src={currentQuestion.questionImage.trim()}
            alt="صورة السؤال"
            className="max-h-72 object-contain rounded-xl"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      
      {currentQuestion.type === 'ESSAY' ? (
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            اكتب إجابتك المقالية بالتفصيل:
          </label>
          <textarea
            rows={5}
            value={currentAnswer}
            onChange={(e) => onSelectOption(currentQuestion._id, e.target.value)}
            placeholder="اكتب الإجابة المقالية هنا..."
            disabled={isDisabled}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-semibold bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0D8A82] transition"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {(currentQuestion.options || []).map((optionText: string, optIdx: number) => {
            const isSelected = currentAnswer === optionText;
            return (
              <div
                key={optIdx}
                onClick={() => onSelectOption(currentQuestion._id, optionText)}
                className={`rounded-2xl p-4 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-teal-50/80 border-[#0D8A82] ring-2 ring-[#0D8A82]/20 shadow-2xs'
                    : 'bg-slate-50/50 border-slate-200/90 hover:bg-slate-50 hover:border-teal-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg font-extrabold text-xs flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-[#0D8A82] text-white border-[#0D8A82]'
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-[#0D8A82]' : 'text-slate-700'}`}>
                    {optionText}
                  </span>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-[#0D8A82] bg-[#0D8A82]' : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

     
      <div className="flex items-center justify-between gap-3 pt-6 border-t border-slate-100 flex-wrap">
        <button
          onClick={onPrevQuestion}
          disabled={currentQuestionIndex === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition enabled:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowRight size={16} />
          <span>السابق</span>
        </button>

        <div className="flex items-center gap-2">
          {currentQuestionIndex < totalQuestions - 1 ? (
            <button
              onClick={onNextQuestion}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition cursor-pointer shadow-xs"
            >
              <span>التالي</span>
              <ArrowLeft size={16} />
            </button>
          ) : null}

          <button
            onClick={onOpenConfirmModal}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            <span>تسليم الامتحان</span>
          </button>
        </div>
      </div>
    </div>
  );
};
