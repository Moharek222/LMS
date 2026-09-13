import React from 'react';
import { Trash2, Image as ImageIcon, UploadCloud, Check, X, Plus } from 'lucide-react';

export interface QuestionFormData {
  id: string;
  question: string;
  type: 'MCQ' | 'ESSAY';
  options: string[];
  answer: string;
  points: number;
  questionImage?: string;
}

interface QuestionFormItemProps {
  question: QuestionFormData;
  qIndex: number;
  totalQuestions: number;
  isDisabled?: boolean;
  onTypeChange: (id: string, type: 'MCQ' | 'ESSAY') => void;
  onPointsChange: (id: string, points: number) => void;
  onTextChange: (id: string, text: string) => void;
  onImageChange: (id: string, image: string) => void;
  onImageFileSelect: (id: string, file: File) => void;
  onRemoveQuestion: (id: string) => void;
  onOptionTextChange: (id: string, optIndex: number, text: string) => void;
  onAddOption: (id: string) => void;
  onRemoveOption: (id: string, optIndex: number) => void;
  onSetAnswer: (id: string, answer: string) => void;
}

export const QuestionFormItem: React.FC<QuestionFormItemProps> = ({
  question: q,
  qIndex,
  totalQuestions,
  isDisabled = false,
  onTypeChange,
  onPointsChange,
  onTextChange,
  onImageChange,
  onImageFileSelect,
  onRemoveQuestion,
  onOptionTextChange,
  onAddOption,
  onRemoveOption,
  onSetAnswer,
}) => {
  return (
    <div className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-4 relative">
     
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-[#0D8A82] text-white text-[11px] font-extrabold">
            السؤال {qIndex + 1}
          </span>
          <select
            value={q.type}
            onChange={(e) => onTypeChange(q.id, e.target.value as 'MCQ' | 'ESSAY')}
            disabled={isDisabled}
            className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-bold bg-white text-slate-800 focus:outline-none focus:border-[#0D8A82]"
          >
            <option value="MCQ">اختيار من متعدد (MCQ)</option>
            <option value="ESSAY">سؤال مقالي (ESSAY)</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <label className="text-[11px] font-bold text-slate-600">الدرجة:</label>
            <input
              type="number"
              min={1}
              value={q.points}
              onChange={(e) => onPointsChange(q.id, Number(e.target.value))}
              disabled={isDisabled}
              className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold bg-white text-center"
            />
          </div>

          {totalQuestions > 1 && (
            <button
              type="button"
              onClick={() => onRemoveQuestion(q.id)}
              disabled={isDisabled}
              className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={14} />
              <span>حذف</span>
            </button>
          )}
        </div>
      </div>

      
      <div className="space-y-3">
        <div>
          <input
            type="text"
            value={q.question}
            onChange={(e) => onTextChange(q.id, e.target.value)}
            placeholder={`نص السؤال رقم ${qIndex + 1}...`}
            disabled={isDisabled}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-[#0D8A82]"
          />
        </div>

        
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500 flex items-center gap-1">
            <ImageIcon size={14} className="text-[#0D8A82]" />
            <span>صورة توضيحية للسؤال (اختياري):</span>
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <label className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-teal-50 text-[#0D8A82] border border-teal-200 text-xs font-bold hover:bg-teal-100 transition cursor-pointer shrink-0">
              <UploadCloud size={16} />
              <span>اختر صورة من الموبايل / الجهاز 📱</span>
              <input
                type="file"
                accept="image/*"
                disabled={isDisabled}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onImageFileSelect(q.id, file);
                }}
              />
            </label>
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={q.questionImage || ''}
                onChange={(e) => onImageChange(q.id, e.target.value)}
                placeholder="أو ألصق رابط الصورة هنا..."
                disabled={isDisabled}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-[#0D8A82]"
              />
              {q.questionImage && (
                <button
                  type="button"
                  onClick={() => onImageChange(q.id, '')}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition cursor-pointer shrink-0"
                  title="حذف الصورة"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {q.questionImage && (
            <div className="p-2 bg-white rounded-xl border border-slate-200 w-fit max-w-xs relative mt-2">
              <img
                src={q.questionImage}
                alt={`معاينة صورة السؤال ${qIndex + 1}`}
                className="max-h-36 object-contain rounded-lg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>

      
      {q.type === 'MCQ' ? (
        <div className="space-y-2.5 pr-2 pt-1">
          <label className="block text-[11px] font-bold text-slate-500">
            الاختيارات المتاحة (انقر على الاختيار لتحديده كإجابة صحيحة):
          </label>
          {q.options.map((opt, optIndex) => {
            const isCorrect = q.answer !== '' && q.answer === opt;
            return (
              <div key={optIndex} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (opt.trim()) onSetAnswer(q.id, opt);
                  }}
                  title={isCorrect ? 'الإجابة الصحيحة المحددة' : 'تحديد كإجابة صحيحة'}
                  className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border transition ${
                    isCorrect
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-400 border-slate-200 hover:border-teal-400'
                  }`}
                >
                  {isCorrect ? <Check size={14} /> : String.fromCharCode(65 + optIndex)}
                </button>

                <input
                  type="text"
                  value={opt}
                  onChange={(e) => onOptionTextChange(q.id, optIndex, e.target.value)}
                  placeholder={`اختيار ${optIndex + 1}...`}
                  disabled={isDisabled}
                  className={`flex-1 px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white focus:outline-none ${
                    isCorrect
                      ? 'border-emerald-500 ring-2 ring-emerald-500/10'
                      : 'border-slate-200 focus:border-[#0D8A82]'
                  }`}
                />

                {q.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => onRemoveOption(q.id, optIndex)}
                    disabled={isDisabled}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => onAddOption(q.id)}
            disabled={isDisabled}
            className="text-[11px] text-[#0D8A82] font-bold hover:underline flex items-center gap-1 pt-1 cursor-pointer"
          >
            <Plus size={12} />
            <span>إضافة اختيار آخر</span>
          </button>
        </div>
      ) : (
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs font-bold text-amber-800">
          هذا السؤال مقالي. سيقوم الطالب بكتابة إجابته النصية بحرية أثناء الحل، وسيتاح لك تصحيحها ورصد الدرجة لاحقاً.
        </div>
      )}
    </div>
  );
};
