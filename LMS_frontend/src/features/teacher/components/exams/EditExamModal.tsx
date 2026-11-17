import React, { useState } from 'react';
import { Edit, Loader2, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useTeacherExam } from '../../hooks/useTeacherExam';
import { useUpdateExam } from '../../hooks/useUpdateExam';
import type { TeacherExam } from '../../../exams/types/exam';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';
import { ExamQuestionsListEditor, type ExamQuestionDraft } from './ExamQuestionsListEditor';

interface EditExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourseId: string;
  editingExamId: string;
}

export const EditExamModal: React.FC<EditExamModalProps> = ({
  isOpen,
  onClose,
  selectedCourseId,
  editingExamId,
}) => {
  const {
    data: teacherExamData,
    isLoading: isLoadingTeacherExam,
    isError: isTeacherExamError,
    error: teacherExamError,
    refetch: refetchTeacherExam,
  } = useTeacherExam(selectedCourseId, editingExamId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
              <Edit size={22} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800">تعديل الامتحان الشامل</h3>
              <p className="text-xs text-slate-500 font-semibold">
                تعديل بيانات وأسئلة الامتحان الحالي (اختيار من متعدد ومقالي وصور الأسئلة)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {isLoadingTeacherExam ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 size={36} className="animate-spin text-[#0D8A82]" />
            <p className="text-xs font-bold text-slate-600">جاري تحميل بيانات الامتحان...</p>
          </div>
        ) : isTeacherExamError || !teacherExamData ? (
          <div className="p-6 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-center space-y-3">
            <AlertTriangle size={28} className="mx-auto text-rose-600" />
            <p className="text-xs font-bold">
              {toArabicErrorMessage(teacherExamError, 'تعذر تحميل بيانات الامتحان للتعديل')}
            </p>
            <button
              type="button"
              onClick={() => refetchTeacherExam()}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        ) : (
          <EditExamForm
            key={teacherExamData._id}
            teacherExamData={teacherExamData}
            selectedCourseId={selectedCourseId}
            editingExamId={editingExamId}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

const EditExamForm: React.FC<{
  teacherExamData: TeacherExam;
  selectedCourseId: string;
  editingExamId: string;
  onClose: () => void;
}> = ({ teacherExamData, selectedCourseId, editingExamId, onClose }) => {
  const toast = useToast();
  const updateExamMutation = useUpdateExam();

  const [editTitle, setEditTitle] = useState(teacherExamData.title || '');
  const [editDuration, setEditDuration] = useState<number>(teacherExamData.duration || 30);
  const [editIsPublished, setEditIsPublished] = useState<boolean>(
    teacherExamData.isPublished ?? teacherExamData.isActive ?? true
  );
  const [editQuestions, setEditQuestions] = useState<ExamQuestionDraft[]>(() =>
    teacherExamData.questions && teacherExamData.questions.length > 0
      ? teacherExamData.questions.map((q, idx) => ({
          id: q._id || `eq_${idx}`,
          type: q.type || 'MCQ',
          points: q.points || 1,
          question: q.question || '',
          questionImage: q.questionImage || '',
          options: q.options ? [...q.options] : ['', ''],
          answer: q.answer || '',
        }))
      : []
  );
  const [editValidationError, setEditValidationError] = useState('');

  const handleCloseModal = () => {
    if (updateExamMutation.isPending) return;
    onClose();
    setEditValidationError('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingExamId || !selectedCourseId) return;

    const triggerValidationError = (msg: string) => {
      setEditValidationError(msg);
      toast.error(msg);
    };

    if (!editTitle.trim() || editTitle.trim().length < 3) {
      triggerValidationError('عنوان الامتحان يجب أن يكون 3 أحرف على الأقل ⚠️');
      return;
    }

    const numDuration = Number(editDuration);
    if (isNaN(numDuration) || numDuration <= 0) {
      triggerValidationError('مدة الامتحان يجب أن تكون رقماً أكبر من صفر ⚠️');
      return;
    }

    if (editQuestions.length === 0) {
      triggerValidationError('الامتحان يجب أن يحتوي على سؤال واحد على الأقل ⚠️');
      return;
    }

    for (let i = 0; i < editQuestions.length; i++) {
      const q = editQuestions[i];
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

    setEditValidationError('');

    const formattedEditQuestions = editQuestions.map((q) => ({
      type: q.type,
      points: Number(q.points) || 1,
      question: q.question.trim(),
      questionImage: q.questionImage.trim() || undefined,
      options: q.type === 'MCQ' ? q.options.map((opt) => opt.trim()).filter((opt) => opt !== '') : undefined,
      answer: q.type === 'MCQ' ? q.answer.trim() : undefined,
    }));

    const payload = {
      title: editTitle.trim(),
      duration: numDuration,
      isPublished: editIsPublished,
      isActive: true,
      questions: formattedEditQuestions,
    };

    const payloadSize = JSON.stringify(payload).length;
    if (payloadSize > 95 * 1024) {
      triggerValidationError('حجم بيانات الامتحان وصوره كبير جداً بالنسبة لـ JSON الباك إند (أكبر من 95KB). يرجى إزالة بعض الصور الكبيرة أو تقليل أبعادها أو استخدام روابط صور بدلاً من الرفع المباشر.');
      return;
    }

    updateExamMutation.mutate(
      {
        courseId: selectedCourseId,
        examId: editingExamId,
        payload,
      },
      {
        onSuccess: (updatedExam) => {
          if (updatedExam && updatedExam._id) {
            try {
              const saved = localStorage.getItem('teacher_draft_exams');
              const draftMap = saved ? JSON.parse(saved) : {};
              if (updatedExam.isPublished === false) {
                draftMap[updatedExam._id] = updatedExam;
              } else {
                delete draftMap[updatedExam._id];
              }
              localStorage.setItem('teacher_draft_exams', JSON.stringify(draftMap));
            } catch {
              // Ignore storage errors
            }
          }
          onClose();
          toast.success('تم تحديث الامتحان بنجاح 🎓✨');
        },
        onError: (err) => {
          const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء تحديث الامتحان');
          setEditValidationError(msg);
          toast.error(msg);
        },
      }
    );
  };

  return (
    <form onSubmit={handleEditSubmit} className="space-y-6 overflow-y-auto flex-1 pr-1">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1">
          <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
            عنوان الامتحان الشامل *
          </label>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="عنوان الامتحان..."
            disabled={updateExamMutation.isPending}
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
            value={editDuration}
            onChange={(e) => setEditDuration(Number(e.target.value))}
            disabled={updateExamMutation.isPending}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0D8A82] focus:ring-2 focus:ring-teal-500/10 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
            حالة النشر للطلاب *
          </label>
          <select
            value={editIsPublished ? 'published' : 'draft'}
            onChange={(e) => setEditIsPublished(e.target.value === 'published')}
            disabled={updateExamMutation.isPending}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0D8A82] focus:ring-2 focus:ring-teal-500/10 transition cursor-pointer"
          >
            <option value="published">منشور ومتاح للطلاب 🟢</option>
            <option value="draft">حفظ كمسودة (غير منشور) 🟡</option>
          </select>
        </div>
      </div>

      <ExamQuestionsListEditor
        courseId={selectedCourseId}
        questions={editQuestions}
        onChangeQuestions={setEditQuestions}
        disabled={updateExamMutation.isPending}
      />

      {editValidationError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0 text-rose-600" />
          <span>{editValidationError}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
        <button
          type="button"
          onClick={handleCloseModal}
          disabled={updateExamMutation.isPending}
          className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={updateExamMutation.isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs disabled:opacity-50"
        >
          {updateExamMutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>جاري حفظ التعديلات...</span>
            </>
          ) : (
            <span>حفظ التعديلات</span>
          )}
        </button>
      </div>
    </form>
  );
};
