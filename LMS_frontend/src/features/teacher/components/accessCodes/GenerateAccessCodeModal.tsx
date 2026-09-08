import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Loader2,
  X,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { useTeacherGroups } from '../../hooks/useTeacherGroups';
import { useGroupStudents } from '../../hooks/useGroupStudents';
import { useGenerateAccessCode } from '../../hooks/useGenerateAccessCode';
import type { GeneratedAccessCodeResult } from '../../types/groupManagement';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';

interface GenerateAccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GenerateAccessCodeModal: React.FC<GenerateAccessCodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const toast = useToast();
  const generateMutation = useGenerateAccessCode();

  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [apiError, setApiError] = useState<string>('');
  const [generatedResult, setGeneratedResult] = useState<GeneratedAccessCodeResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Step 1: Load active groups
  const {
    data: groupsData,
    isLoading: isLoadingGroups,
    isError: isErrorGroups,
    error: errorGroups,
    refetch: refetchGroups,
  } = useTeacherGroups({ limit: 100 });

  const activeGroups = (groupsData?.data || []).filter((g) => g.isActive !== false);

  // Step 2: Load students for selected group
  const {
    data: students,
    isLoading: isLoadingStudents,
    isError: isErrorStudents,
    error: errorStudents,
    refetch: refetchStudents,
  } = useGroupStudents(selectedGroupId);

  useEffect(() => {
    if (isOpen) {
      setSelectedGroupId('');
      setSelectedStudentId('');
      setValidationError('');
      setApiError('');
      setGeneratedResult(null);
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    setSelectedGroupId(groupId);
    setSelectedStudentId('');
    setValidationError('');
    setApiError('');
  };

  const handleClose = () => {
    if (generateMutation.isPending) return;
    setSelectedGroupId('');
    setSelectedStudentId('');
    setValidationError('');
    setApiError('');
    setGeneratedResult(null);
    setCopied(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setApiError('');

    if (!selectedGroupId) {
      setValidationError('يرجى اختيار المجموعة أولاً');
      return;
    }

    if (!selectedStudentId) {
      setValidationError('يرجى اختيار الطالب لتوليد كود تفعيل له');
      return;
    }

    generateMutation.mutate(
      { studentID: selectedStudentId },
      {
        onSuccess: (result) => {
          toast.success('تم إنشاء كود التفعيل بنجاح.');
          setGeneratedResult(result);
          setValidationError('');
          setApiError('');
        },
        onError: (err: unknown) => {
          let msg = toArabicErrorMessage(err, 'حدث خطأ أثناء إنشاء كود التفعيل');
          
          // Check for 400 active code constraint error from backend
          const errorObj = err as { response?: { status?: number; data?: { message?: string } } };
          if (errorObj?.response?.status === 400) {
            msg = errorObj?.response?.data?.message || 'الطالب لديه كود تفعيل نشط بالفعل ولا يمكن إنشاء كود جديد له حالياً.';
          }

          setApiError(msg);
          toast.error(msg);
        },
      }
    );
  };

  const handleCopyCode = async () => {
    if (!generatedResult?.code) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(generatedResult.code);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = generatedResult.code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success('تم نسخ كود التفعيل 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('تعذر نسخ كود التفعيل');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100">
              <KeyRound size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">إنشاء كود تفعيل جديد</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                توليد كود تفعيل مخصص لطالب بالمنصة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={generateMutation.isPending}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success View after Code Generation */}
        {generatedResult ? (
          <div className="space-y-5 text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle size={32} />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-800">تم إنشاء الكود بنجاح</h4>
              <p className="text-xs text-slate-500 font-medium">
                تاريخ انتهاء الصلاحية: <span className="font-bold text-slate-700">{formatDate(generatedResult.expiresAt)}</span>
              </p>
            </div>

            {/* Generated Code Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="font-mono text-xl font-black tracking-widest text-[#0D8A82] dir-ltr">
                {generatedResult.code}
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    <span>تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>نسخ الكود</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        ) : (
          /* Step-by-Step Form View */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Select Group */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                المجموعة الدراسية <span className="text-rose-500">*</span>
              </label>

              {isLoadingGroups ? (
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-500">
                  <Loader2 size={16} className="animate-spin text-[#0D8A82]" />
                  <span>جاري تحميل المجموعات...</span>
                </div>
              ) : isErrorGroups ? (
                <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-700 flex items-center justify-between gap-2">
                  <span>{toArabicErrorMessage(errorGroups, 'فشل تحميل المجموعات')}</span>
                  <button
                    type="button"
                    onClick={() => refetchGroups()}
                    className="inline-flex items-center gap-1 text-[11px] underline cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>إعادة المحاولة</span>
                  </button>
                </div>
              ) : activeGroups.length === 0 ? (
                <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-xs font-bold text-amber-800">
                  لا توجد مجموعات نشطة متاحة حالياً.
                </div>
              ) : (
                <select
                  dir="rtl"
                  value={selectedGroupId}
                  onChange={handleGroupChange}
                  disabled={generateMutation.isPending}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-right text-sm font-medium focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] transition outline-none disabled:bg-slate-50"
                >
                  <option value="">اختر المجموعة الدراسية</option>
                  {activeGroups.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Step 2: Select Student */}
            {selectedGroupId && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  الطالب <span className="text-rose-500">*</span>
                </label>

                {isLoadingStudents ? (
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Loader2 size={16} className="animate-spin text-[#0D8A82]" />
                    <span>جاري تحميل طلاب المجموعة...</span>
                  </div>
                ) : isErrorStudents ? (
                  <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-700 flex items-center justify-between gap-2">
                    <span>{toArabicErrorMessage(errorStudents, 'فشل تحميل الطلاب')}</span>
                    <button
                      type="button"
                      onClick={() => refetchStudents()}
                      className="inline-flex items-center gap-1 text-[11px] underline cursor-pointer"
                    >
                      <RefreshCw size={12} />
                      <span>إعادة المحاولة</span>
                    </button>
                  </div>
                ) : !students || students.length === 0 ? (
                  <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-xs font-bold text-amber-800">
                    لا يوجد طلاب نشطون في هذه المجموعة.
                  </div>
                ) : (
                  <select
                    dir="rtl"
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(e.target.value);
                      setValidationError('');
                      setApiError('');
                    }}
                    disabled={generateMutation.isPending}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-right text-sm font-medium focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] transition outline-none disabled:bg-slate-50"
                  >
                    <option value="">اختر الطالب</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name} {student.phone ? `(${student.phone})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {validationError && (
              <p className="text-xs font-bold text-rose-600 mt-1">{validationError}</p>
            )}

            {apiError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
                <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                disabled={generateMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={
                  generateMutation.isPending ||
                  !selectedGroupId ||
                  !selectedStudentId ||
                  isLoadingStudents
                }
                className="px-6 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>جاري إنشاء الكود...</span>
                  </>
                ) : (
                  <span>إنشاء كود التفعيل</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default GenerateAccessCodeModal;
