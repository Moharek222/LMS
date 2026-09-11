import React, { useState, useEffect } from 'react';
import { Edit, Plus, Loader2, AlertTriangle, RefreshCw, X, Trash2, HelpCircle, Check, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { useTeacherExam } from '../../hooks/useTeacherExam';
import { useUpdateExam } from '../../hooks/useUpdateExam';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';
import { compressImageFile } from '../../../../utils/imageCompressor';

interface QuestionDraft {
  id: string;
  type: 'MCQ' | 'ESSAY';
  points: number;
  question: string;
  questionImage: string;
  options: string[];
  answer: string;
}

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
  const toast = useToast();
  const updateExamMutation = useUpdateExam();

  const [editTitle, setEditTitle] = useState('');
  const [editDuration, setEditDuration] = useState<number>(30);
  const [editQuestions, setEditQuestions] = useState<QuestionDraft[]>([]);
  const [editValidationError, setEditValidationError] = useState('');

  const {
    data: teacherExamData,
    isLoading: isLoadingTeacherExam,
    isError: isTeacherExamError,
    error: teacherExamError,
    refetch: refetchTeacherExam,
  } = useTeacherExam(selectedCourseId, editingExamId);

  useEffect(() => {
    if (teacherExamData && editingExamId && isOpen) {
      setEditTitle(teacherExamData.title || '');
      setEditDuration(teacherExamData.duration || 30);
      if (teacherExamData.questions && teacherExamData.questions.length > 0) {
        setEditQuestions(
          teacherExamData.questions.map((q, idx) => ({
            id: q._id || `eq_${idx}_${Date.now()}`,
            type: q.type || 'MCQ',
            points: q.points || 1,
            question: q.question || '',
            questionImage: q.questionImage || '',
            options: q.options ? [...q.options] : ['', ''],
            answer: q.answer || '',
          }))
        );
      }
    }
  }, [teacherExamData, editingExamId, isOpen]);

  const handleCloseModal = () => {
    if (updateExamMutation.isPending) return;
    onClose();
    setEditValidationError('');
  };

  const handleEditAddQuestion = () => {
    setEditQuestions((prev) => [
      ...prev,
      {
        id: `eq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: 'MCQ',
        points: 1,
        question: '',
        questionImage: '',
        options: ['', ''],
        answer: '',
      },
    ]);
  };

  const handleEditRemoveQuestion = (qId: string) => {
    if (editQuestions.length <= 1) {
      toast.warning('الامتحان يجب أن يحتوي على سؤال واحد على الأقل');
      return;
    }
    setEditQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  const handleEditQuestionTypeChange = (qId: string, type: 'MCQ' | 'ESSAY') => {
    setEditQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, type } : q))
    );
  };

  const handleEditQuestionPointsChange = (qId: string, points: number) => {
    setEditQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, points: Math.max(1, points) } : q))
    );
  };

  const handleEditQuestionImageChange = (qId: string, image: string) => {
    setEditQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, questionImage: image } : q))
    );
  };

  const handleEditQuestionTextChange = (qId: string, text: string) => {
    setEditQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, question: text } : q))
    );
  };

  const handleEditAddOption = (qId: string) => {
    setEditQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, options: [...q.options, ''] } : q))
    );
  };

  const handleEditRemoveOption = (qId: string, optIndex: number) => {
    setEditQuestions((prev) =>
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

  const handleEditOptionTextChange = (qId: string, optIndex: number, text: string) => {
    setEditQuestions((prev) =>
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

  const handleEditAnswerSelect = (qId: string, answerText: string) => {
    setEditQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, answer: answerText } : q))
    );
  };

  const handleImageFileSelect = async (qId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP)');
      return;
    }

    try {
      toast.info('جاري ضغط وتحسين الصورة لتناسب المنصة... ⏳');
      const compressedDataUrl = await compressImageFile(file, 800, 800, 0.65);
      handleEditQuestionImageChange(qId, compressedDataUrl);
      toast.success('تم تحميل وضغط الصورة بنجاح 🖼️');
    } catch {
      toast.error('حدث خطأ أثناء معالجة الصورة، يرجى المحاولة مرة أخرى');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingExamId || !selectedCourseId) return;

    if (!editTitle.trim() || editTitle.trim().length < 3) {
      setEditValidationError('عنوان الامتحان يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    const numDuration = Number(editDuration);
    if (isNaN(numDuration) || numDuration <= 0) {
      setEditValidationError('مدة الامتحان يجب أن تكون رقماً أكبر من صفر');
      return;
    }

    if (editQuestions.length === 0) {
      setEditValidationError('الامتحان يجب أن يحتوي على سؤال واحد على الأقل');
      return;
    }

    for (let i = 0; i < editQuestions.length; i++) {
      const q = editQuestions[i];
      if (!q.question.trim() || q.question.trim().length < 3) {
        setEditValidationError(`السؤال رقم ${i + 1} يجب أن يتكون من 3 أحرف على الأقل`);
        return;
      }

      if (q.type === 'MCQ') {
        const validOptions = q.options.map((opt) => opt.trim()).filter((opt) => opt !== '');
        if (validOptions.length < 2) {
          setEditValidationError(`سؤال الاختيارات رقم ${i + 1} يجب أن يحتوي على اختيارين غير فارغين على الأقل`);
          return;
        }

        if (!q.answer.trim() || !validOptions.includes(q.answer.trim())) {
          setEditValidationError(`يرجى تحديد إجابة صحيحة تطابق أحد الاختيارات في السؤال رقم ${i + 1}`);
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
      questions: formattedEditQuestions,
    };

    const payloadSize = JSON.stringify(payload).length;
    if (payloadSize > 95 * 1024) {
      setEditValidationError('حجم بيانات الامتحان وصوره كبير جداً بالنسبة لـ JSON الباك إند (أكبر من 95KB). يرجى إزالة بعض الصور الكبيرة أو تقليل أبعادها أو استخدام روابط صور بدلاً من الرفع المباشر.');
      return;
    }

    updateExamMutation.mutate(
      {
        courseId: selectedCourseId,
        examId: editingExamId,
        payload,
      },
      {
        onSuccess: () => {
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
            onClick={handleCloseModal}
            disabled={updateExamMutation.isPending}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {isLoadingTeacherExam ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 size={36} className="animate-spin text-[#0D8A82]" />
            <p className="text-xs font-bold text-slate-600">جاري تحميل بيانات الامتحان...</p>
          </div>
        ) : isTeacherExamError ? (
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
          <form onSubmit={handleEditSubmit} className="space-y-6 overflow-y-auto flex-1 pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
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
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <HelpCircle size={16} className="text-[#0D8A82]" />
                  <span>أسئلة الامتحان الشامل ({editQuestions.length})</span>
                </h4>
                <button
                  type="button"
                  onClick={handleEditAddQuestion}
                  disabled={updateExamMutation.isPending}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 text-[#0D8A82] border border-teal-100 text-xs font-bold hover:bg-teal-100 transition cursor-pointer"
                >
                  <Plus size={14} />
                  <span>إضافة سؤال آخر</span>
                </button>
              </div>

              <div className="space-y-4">
                {editQuestions.map((q, qIndex) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-[#0D8A82] text-white text-[11px] font-extrabold">
                          السؤال {qIndex + 1}
                        </span>
                        <select
                          value={q.type}
                          onChange={(e) => handleEditQuestionTypeChange(q.id, e.target.value as 'MCQ' | 'ESSAY')}
                          disabled={updateExamMutation.isPending}
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
                            onChange={(e) => handleEditQuestionPointsChange(q.id, Number(e.target.value))}
                            disabled={updateExamMutation.isPending}
                            className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold bg-white text-center"
                          />
                        </div>

                        {editQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleEditRemoveQuestion(q.id)}
                            disabled={updateExamMutation.isPending}
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
                          onChange={(e) => handleEditQuestionTextChange(q.id, e.target.value)}
                          placeholder={`نص السؤال رقم ${qIndex + 1}...`}
                          disabled={updateExamMutation.isPending}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white focus:outline-none focus:border-[#0D8A82]"
                        />
                      </div>

                      {/* Image Upload or URL field */}
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
                              disabled={updateExamMutation.isPending}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageFileSelect(q.id, file);
                              }}
                            />
                          </label>
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={q.questionImage}
                              onChange={(e) => handleEditQuestionImageChange(q.id, e.target.value)}
                              placeholder="أو ألصق رابط الصورة هنا..."
                              disabled={updateExamMutation.isPending}
                              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-[#0D8A82]"
                            />
                            {q.questionImage && (
                              <button
                                type="button"
                                onClick={() => handleEditQuestionImageChange(q.id, '')}
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

                    {/* MCQ Options rendering */}
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
                                  if (opt.trim()) handleEditAnswerSelect(q.id, opt);
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
                                onChange={(e) => handleEditOptionTextChange(q.id, optIndex, e.target.value)}
                                placeholder={`اختيار ${optIndex + 1}...`}
                                disabled={updateExamMutation.isPending}
                                className={`flex-1 px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white focus:outline-none ${
                                  isCorrect
                                    ? 'border-emerald-500 ring-2 ring-emerald-500/10'
                                    : 'border-slate-200 focus:border-[#0D8A82]'
                                }`}
                              />

                              {q.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleEditRemoveOption(q.id, optIndex)}
                                  disabled={updateExamMutation.isPending}
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
                          onClick={() => handleEditAddOption(q.id)}
                          disabled={updateExamMutation.isPending}
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
                ))}
              </div>
            </div>

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
        )}
      </div>
    </div>
  );
};

export default EditExamModal;

