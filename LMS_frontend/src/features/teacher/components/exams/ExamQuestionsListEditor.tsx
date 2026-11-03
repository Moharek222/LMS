import React from 'react';
import { Plus, HelpCircle } from 'lucide-react';
import { useToast } from '../../../../context/ToastContext';
import { compressImageFile } from '../../../../utils/imageCompressor';
import { QuestionFormItem } from '../questions/QuestionFormItem';
import { uploadExamQuestionImage } from '../../api/teacherExamsApi';

export interface ExamQuestionDraft {
  id: string;
  type: 'MCQ' | 'ESSAY';
  points: number;
  question: string;
  questionImage: string;
  options: string[];
  answer: string;
}

interface ExamQuestionsListEditorProps {
  courseId: string;
  questions: ExamQuestionDraft[];
  onChangeQuestions: React.Dispatch<React.SetStateAction<ExamQuestionDraft[]>>;
  disabled?: boolean;
}

export const ExamQuestionsListEditor: React.FC<ExamQuestionsListEditorProps> = ({
  courseId,
  questions,
  onChangeQuestions,
  disabled = false,
}) => {
  const toast = useToast();

  const handleAddQuestion = () => {
    onChangeQuestions((prev) => [
      ...prev,
      {
        id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: 'MCQ',
        points: 1,
        question: '',
        questionImage: '',
        options: ['', ''],
        answer: '',
      },
    ]);
  };

  const handleRemoveQuestion = (qId: string) => {
    if (questions.length <= 1) {
      toast.warning('يجب أن يحتوي الامتحان على سؤال واحد على الأقل');
      return;
    }
    onChangeQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  const handleQuestionTypeChange = (qId: string, type: 'MCQ' | 'ESSAY') => {
    onChangeQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, type } : q))
    );
  };

  const handleQuestionPointsChange = (qId: string, points: number) => {
    onChangeQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, points: Math.max(1, points) } : q))
    );
  };

  const handleQuestionImageChange = (qId: string, imageUrl: string) => {
    onChangeQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, questionImage: imageUrl } : q))
    );
  };

  const handleImageFileSelect = async (qId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP)');
      return;
    }

    try {
      toast.info('جاري رفع الصورة للسيرفر... ⏳');
      const res = await uploadExamQuestionImage(courseId, file);
      if (res?.imageUrl) {
        handleQuestionImageChange(qId, res.imageUrl);
        toast.success('تم رفع الصورة بنجاح 🖼️');
        return;
      }
    } catch {
      // Fallback to compressed base64 if upload endpoint fails
    }

    try {
      toast.info('جاري ضغط وتحسين الصورة لتناسب المنصة... ⏳');
      const compressedDataUrl = await compressImageFile(file, 800, 800, 0.65);
      handleQuestionImageChange(qId, compressedDataUrl);
      toast.success('تم تحميل وضغـط الصورة بنجاح 🖼️');
    } catch {
      toast.error('حدث خطأ أثناء معالجة الصورة، يرجى المحاولة مرة أخرى');
    }
  };

  const handleQuestionTextChange = (qId: string, text: string) => {
    onChangeQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, question: text } : q))
    );
  };

  const handleAddOption = (qId: string) => {
    onChangeQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, options: [...q.options, ''] } : q))
    );
  };

  const handleRemoveOption = (qId: string, optIndex: number) => {
    onChangeQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          if (q.options.length <= 2) return q;
          const removedOpt = q.options[optIndex];
          const newOptions = q.options.filter((_, idx) => idx !== optIndex);
          const newAnswer = q.answer === removedOpt ? '' : q.answer;
          return { ...q, options: newOptions, answer: newAnswer };
        }
        return q;
      })
    );
  };

  const handleOptionTextChange = (qId: string, optIndex: number, text: string) => {
    onChangeQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          const oldOptText = q.options[optIndex];
          const newOptions = [...q.options];
          newOptions[optIndex] = text;
          const newAnswer = q.answer === oldOptText ? text : q.answer;
          return { ...q, options: newOptions, answer: newAnswer };
        }
        return q;
      })
    );
  };

  const handleSetAnswer = (qId: string, selectedAnswer: string) => {
    onChangeQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, answer: selectedAnswer } : q))
    );
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
          <HelpCircle size={16} className="text-[#0D8A82]" />
          <span>أسئلة الامتحان الشامل ({questions.length})</span>
        </h4>
        <button
          type="button"
          onClick={handleAddQuestion}
          disabled={disabled}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 text-[#0D8A82] border border-teal-100 text-xs font-bold hover:bg-teal-100 transition cursor-pointer"
        >
          <Plus size={14} />
          <span>إضافة سؤال آخر</span>
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((q, qIndex) => (
          <QuestionFormItem
            key={q.id}
            question={q}
            qIndex={qIndex}
            totalQuestions={questions.length}
            isDisabled={disabled}
            onTypeChange={handleQuestionTypeChange}
            onPointsChange={handleQuestionPointsChange}
            onTextChange={handleQuestionTextChange}
            onImageChange={handleQuestionImageChange}
            onImageFileSelect={handleImageFileSelect}
            onRemoveQuestion={handleRemoveQuestion}
            onOptionTextChange={handleOptionTextChange}
            onAddOption={handleAddOption}
            onRemoveOption={handleRemoveOption}
            onSetAnswer={handleSetAnswer}
          />
        ))}
      </div>
    </div>
  );
};

