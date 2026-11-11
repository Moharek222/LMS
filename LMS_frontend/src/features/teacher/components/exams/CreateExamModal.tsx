import React, { useState } from 'react';
import { Award, Loader2, AlertTriangle, X } from 'lucide-react';
import { useCreateExam } from '../../hooks/useCreateExam';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';
import type { TeacherExam } from '../../../exams/types/exam';
import { ExamQuestionsListEditor, type ExamQuestionDraft } from './ExamQuestionsListEditor';

interface CreateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourseId: string;
  onExamCreated?: (exam: TeacherExam) => void;
}

export const CreateExamModal: React.FC<CreateExamModalProps> = ({
  isOpen,
  onClose,
  selectedCourseId,
  onExamCreated,
}) => {
  const toast = useToast();
  const createExamMutation = useCreateExam();

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [startAt, setStartAt] = useState<string>('');
  const [questions, setQuestions] = useState<ExamQuestionDraft[]>([
    {
      id: 'q_1',
      type: 'MCQ',
      points: 1,
      question: '',
      questionImage: '',
      options: ['', ''],
      answer: '',
    },
  ]);
  const [validationError, setValidationError] = useState('');

  const resetForm = () => {
    setTitle('');
    setDuration(30);
    setStartAt('');
    setQuestions([
      {
        id: `q_${Date.now()}`,
        type: 'MCQ',
        points: 1,
        question: '',
        questionImage: '',
        options: ['', ''],
        answer: '',
      },
    ]);
    setValidationError('');
  };

  const handleCloseModal = () => {
    if (createExamMutation.isPending) return;
    resetForm();
    onClose();
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const triggerValidationError = (msg: string) => {
      setValidationError(msg);
      toast.error(msg);
    };

    if (!selectedCourseId) {
      triggerValidationError('يرجى اختيار الكورس أولاً');
      return;
    }

    if (!title.trim() || title.trim().length < 3) {
      triggerValidationError('عنوان الامتحان يجب أن يكون 3 أحرف على الأقل ⚠️');
      return;
    }

    const numDuration = Number(duration);
    if (isNaN(numDuration) || numDuration <= 0) {
      triggerValidationError('مدة الامتحان يجب أن تكون رقماً أكبر من صفر ⚠️');
      return;
    }

    if (questions.length === 0) {
      triggerValidationError('الامتحان يجب أن يحتوي على سؤال واحد على الأقل ⚠️');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim() || q.question.trim().length < 3) {
        triggerValidationError(`السؤال رقم ${i + 1} يجب أن يتكون من 3 أحرف على الأقل ⚠️`);
        return;
      }

      if (q.type === 'MCQ') {
        const validOptions = q.options.map((opt) => opt.trim()).filter((opt) => opt !== '');
        if (validOptions.length < 2) {
          triggerValidationError(`سؤال الاختيارات رقم ${i + 1} يجب أن يحتوي على اختيارين غير فارغين على الأقل ⚠️`);
          return;
        }

        if (!q.answer.trim() || !validOptions.includes(q.answer.trim())) {
          triggerValidationError(`يرجى تحديد إجابة صحيحة تطابق أحد الاختيارات في السؤال رقم ${i + 1} ⚠️`);
          return;
        }
      }
    }

    setValidationError('');

    const formattedQuestions = questions.map((q) => ({
      type: q.type,
      points: Number(q.points) || 1,
      question: q.question.trim(),
      questionImage: q.questionImage.trim() || undefined,
      options: q.type === 'MCQ' ? q.options.map((opt) => opt.trim()).filter((opt) => opt !== '') : undefined,
      answer: q.type === 'MCQ' ? q.answer.trim() : undefined,
    }));

    const payload = {
      title: title.trim(),
      duration: numDuration,
      startAt: startAt ? new Date(startAt).toISOString() : undefined,
      questions: formattedQuestions,
    };

    const payloadSize = JSON.stringify(payload).length;
    if (payloadSize > 95 * 1024) {
      triggerValidationError('حجم بيانات الامتحان وصوره كبير جداً بالنسبة لـ JSON الباك إند (أكبر من 95KB). يرجى إزالة بعض الصور الكبيرة أو تقليل أبعادها أو استخدام روابط صور بدلاً من الرفع المباشر.');
      return;
    }

    createExamMutation.mutate(
      {
        courseId: selectedCourseId,
        payload,
      },
      {
        onSuccess: (createdExam) => {
          if (createdExam && createdExam._id) {
            onExamCreated?.(createdExam);
            if (createdExam.isPublished === false) {
              try {
                const saved = localStorage.getItem('teacher_draft_exams');
                const draftMap = saved ? JSON.parse(saved) : {};
                draftMap[createdExam._id] = createdExam;
                localStorage.setItem('teacher_draft_exams', JSON.stringify(draftMap));
              } catch {
                // Ignore storage errors
              }
            }
          }
          onClose();
          resetForm();
          toast.success('تم إنشاء الامتحان الشامل بنجاح 🎓✨');
        },
        onError: (err) => {
          const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء إنشاء الامتحان، يرجى المحاولة مرة أخرى.');
          setValidationError(msg);
          toast.error(msg);
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
              <Award size={22} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800">إضافة امتحان شامل جديد</h3>
              <p className="text-xs text-slate-500 font-semibold">
                إضافة امتحان جديد وتحديد المدة والأسئلة وموعد البدء المجدول (اختياري)
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            disabled={createExamMutation.isPending}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleCreateSubmit} className="space-y-6 overflow-y-auto flex-1 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                عنوان الامتحان الشامل *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: امتحان الباب الأول - الكيمياء العامة"
                disabled={createExamMutation.isPending}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0D8A82] focus:ring-2 focus:ring-teal-500/10 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                المدة الزمنية (بالدقائق) *
              </label>
              <input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={createExamMutation.isPending}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0D8A82] focus:ring-2 focus:ring-teal-500/10 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                موعد البدء (اختياري / جدول للامتحان)
              </label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                disabled={createExamMutation.isPending}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0D8A82] focus:ring-2 focus:ring-teal-500/10 transition"
              />
            </div>
          </div>

          <ExamQuestionsListEditor
            courseId={selectedCourseId}
            questions={questions}
            onChangeQuestions={setQuestions}
            disabled={createExamMutation.isPending}
          />

          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={createExamMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={createExamMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              {createExamMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري إنشاء الامتحان...</span>
                </>
              ) : (
                <span>إنشاء الامتحان</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExamModal;
