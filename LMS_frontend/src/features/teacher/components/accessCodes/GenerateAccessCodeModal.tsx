import React, { useState, useEffect, useMemo } from 'react';
import {
  KeyRound,
  Loader2,
  X,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  CheckCircle,
  Users,
  User,
  Globe,
  Sparkles,
  Printer,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTeacherGroups } from '../../hooks/useTeacherGroups';
import { useGroupStudents } from '../../hooks/useGroupStudents';
import { useGenerateAccessCode } from '../../hooks/useGenerateAccessCode';
import { useGenerateGroupAccessCodes } from '../../hooks/useGenerateGroupAccessCodes';
import { getAllStudentsApi } from '../../api/teacherAccessCodesApi';
import type {
  GeneratedAccessCodeResult,
  GenerateGroupAccessCodesResult,
  AccessCode,
  GroupStudent,
} from '../../types/groupManagement';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';
import { PrintAccessCodesModal } from './PrintAccessCodesModal';

export type GenerationMode = 'single' | 'group' | 'all';

interface GenerateAccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: GenerationMode;
}

interface ModalErrorBoundaryProps {
  children: React.ReactNode;
  onClose: () => void;
}

interface ModalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ModalErrorBoundary extends React.Component<
  ModalErrorBoundaryProps,
  ModalErrorBoundaryState
> {
  constructor(props: ModalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ModalErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ModalErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto border border-red-200">
            <AlertTriangle size={28} />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-800">حدث خطأ أثناء تحميل النافذة</h4>
            <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto">
              تعذر تحميل بعض البيانات الخاصة بالطلاب أو المجموعات حالياً. يرجى إغلاق النافذة والمحاولة مرة أخرى.
            </p>
          </div>
          <button
            type="button"
            onClick={this.props.onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition cursor-pointer shadow-xs"
          >
            إغلاق النافذة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const GenerateAccessCodeModal: React.FC<GenerateAccessCodeModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'single',
}) => {
  const toast = useToast();
  const generateMutation = useGenerateAccessCode();
  const generateGroupMutation = useGenerateGroupAccessCodes();

  const [mode, setMode] = useState<GenerationMode>(initialMode);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [apiError, setApiError] = useState<string>('');

  // Results
  const [singleResult, setSingleResult] = useState<GeneratedAccessCodeResult | null>(null);
  const [groupResult, setGroupResult] = useState<GenerateGroupAccessCodesResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPrintResultOpen, setIsPrintResultOpen] = useState<boolean>(false);

  // Groups
  const {
    data: groupsData,
    isLoading: isLoadingGroups,
    isError: isErrorGroups,
    error: errorGroups,
    refetch: refetchGroups,
  } = useTeacherGroups({ limit: 100 });

  const activeGroups = useMemo(() => {
    let list: any[] = [];
    if (Array.isArray(groupsData?.data)) {
      list = groupsData.data;
    } else if (Array.isArray((groupsData as any)?.groups)) {
      list = (groupsData as any).groups;
    } else if (Array.isArray(groupsData)) {
      list = groupsData as any;
    }
    return list.filter((g) => g && g._id && g.isActive !== false);
  }, [groupsData]);

  // Students for selected group
  const {
    data: groupStudents,
    isLoading: isLoadingStudents,
    isError: isErrorStudents,
    error: errorStudents,
    refetch: refetchStudents,
  } = useGroupStudents(selectedGroupId);

  const safeGroupStudents: GroupStudent[] = useMemo(() => {
    if (Array.isArray(groupStudents)) return groupStudents;
    if (Array.isArray((groupStudents as any)?.data)) return (groupStudents as any).data;
    return [];
  }, [groupStudents]);

  // All students for "All Students" mode
  const {
    data: allStudents,
    isLoading: isLoadingAllStudents,
    isError: isErrorAllStudents,
    error: errorAllStudents,
    refetch: refetchAllStudents,
  } = useQuery({
    queryKey: ['all-active-students-list'],
    queryFn: () => getAllStudentsApi(),
    enabled: isOpen && mode === 'all',
  });

  const safeAllStudents: Array<{ _id: string; name: string; phone?: string }> = useMemo(() => {
    if (Array.isArray(allStudents)) return allStudents;
    if (Array.isArray((allStudents as any)?.data)) return (allStudents as any).data;
    return [];
  }, [allStudents]);

  // Map of student IDs to names for quick lookup in results
  const studentMap = useMemo(() => {
    const map = new Map<string, { name: string; phone?: string }>();
    safeAllStudents.forEach((s: { _id: string; name: string; phone?: string }) => {
      if (s && s._id) {
        map.set(String(s._id), { name: s.name || 'طالب مسجل', phone: s.phone || '' });
      }
    });
    safeGroupStudents.forEach((s: GroupStudent) => {
      if (s && s._id) {
        map.set(String(s._id), { name: s.name || 'طالب مسجل', phone: s.phone || '' });
      }
    });
    return map;
  }, [safeAllStudents, safeGroupStudents]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSelectedGroupId('');
      setSelectedStudentId('');
      setValidationError('');
      setApiError('');
      setSingleResult(null);
      setGroupResult(null);
      setCopied(false);
      setIsPrintResultOpen(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const isPending = generateMutation.isPending || generateGroupMutation.isPending;

  const handleClose = () => {
    if (isPending) return;
    setSelectedGroupId('');
    setSelectedStudentId('');
    setValidationError('');
    setApiError('');
    setSingleResult(null);
    setGroupResult(null);
    setCopied(false);
    setIsPrintResultOpen(false);
    onClose();
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    setSelectedGroupId(groupId);
    setSelectedStudentId('');
    setValidationError('');
    setApiError('');
  };

  // Submit Single Student Code
  const handleSingleSubmit = (e: React.FormEvent) => {
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
          setSingleResult(result);
          setValidationError('');
          setApiError('');
        },
        onError: (err: unknown) => {
          let msg = toArabicErrorMessage(err, 'حدث خطأ أثناء إنشاء كود التفعيل');
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

  // Submit Full Group Bulk Generation
  const handleGroupBulkSubmit = () => {
    setValidationError('');
    setApiError('');

    if (!selectedGroupId) {
      setValidationError('يرجى اختيار المجموعة أولاً');
      return;
    }

    if (!safeGroupStudents || safeGroupStudents.length === 0) {
      setValidationError('لا يوجد طلاب في هذه المجموعة لتوليد أكواد لهم');
      return;
    }

    const studentIDs = safeGroupStudents
      .filter((s: GroupStudent) => Boolean(s && s._id))
      .map((s: GroupStudent) => String(s._id));

    if (studentIDs.length === 0) {
      setValidationError('تعذر استخراج بيانات الطلاب للمجموعة المحددة');
      return;
    }

    generateGroupMutation.mutate(
      { studentIDs },
      {
        onSuccess: (res) => {
          const genCount = Array.isArray(res?.generated) ? res.generated.length : 0;
          toast.success(`تم إنشاء ${genCount} كود تفعيل بنجاح! 🎉`);
          setGroupResult(res);
          setValidationError('');
          setApiError('');
        },
        onError: (err: unknown) => {
          const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء توليد الأكواد للمجموعة');
          setApiError(msg);
          toast.error(msg);
        },
      }
    );
  };

  // Submit All Students Bulk Generation
  const handleAllStudentsBulkSubmit = () => {
    setValidationError('');
    setApiError('');

    if (!safeAllStudents || safeAllStudents.length === 0) {
      setValidationError('لا يوجد طلاب مسجلين بالمنصة لتوليد أكواد لهم');
      return;
    }

    const studentIDs = safeAllStudents
      .filter((s: { _id: string; name: string; phone?: string }) => Boolean(s && s._id))
      .map((s: { _id: string; name: string; phone?: string }) => String(s._id));

    if (studentIDs.length === 0) {
      setValidationError('تعذر استخراج بيانات الطلاب من المنصة');
      return;
    }

    generateGroupMutation.mutate(
      { studentIDs },
      {
        onSuccess: (res) => {
          const genCount = Array.isArray(res?.generated) ? res.generated.length : 0;
          toast.success(`تم إنشاء ${genCount} كود لطلاب المنصة بنجاح! 🎉`);
          setGroupResult(res);
          setValidationError('');
          setApiError('');
        },
        onError: (err: unknown) => {
          const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء توليد الأكواد لجميع الطلاب');
          setApiError(msg);
          toast.error(msg);
        },
      }
    );
  };

  const handleCopyCode = async (code: string) => {
    if (!code) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success('تم نسخ الكود 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('تعذر نسخ الكود');
    }
  };

  const handleCopyAllGenerated = async () => {
    if (!groupResult?.generated?.length) return;
    const lines = groupResult.generated.map((item) => {
      const studentInfo = studentMap.get(item.studentID);
      const studentName = studentInfo?.name || 'طالب';
      return `${studentName}: ${item.code}`;
    });
    const fullText = lines.join('\n');

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = fullText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      toast.success(`تم نسخ ${groupResult.generated.length} كود بنجاح 📋`);
    } catch {
      toast.error('تعذر نسخ الأكواد');
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

  // Convert newly generated codes to printable AccessCode items
  const printableNewCodes: AccessCode[] = useMemo(() => {
    if (!groupResult || !Array.isArray(groupResult.generated)) return [];
    return groupResult.generated.map((g) => {
      const s = studentMap.get(String(g.studentID)) || { name: 'طالب مسجل', phone: '' };
      return {
        _id: String(g.code || Math.random()),
        studentID: { name: s.name, phone: s.phone || '' },
        code: g.code,
        startAt: new Date().toISOString(),
        expiresAt: g.expiresAt || new Date().toISOString(),
        status: 'active',
      };
    });
  }, [groupResult, studentMap]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <ModalErrorBoundary onClose={handleClose}>
          {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-[#0D8A82] flex items-center justify-center border border-teal-100 shrink-0">
              <KeyRound size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">توليد أكواد التفعيل</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                توليد كود لطالب محدد، أو توليد جماعي لمجموعة كاملة أو كل الطلاب
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 space-y-5 pr-1">
          {/* Mode Selector Tabs (Hidden when result is shown) */}
          {!singleResult && !groupResult && (
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setMode('single');
                  setValidationError('');
                  setApiError('');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'single'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User size={15} />
                <span>طالب واحد</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('group');
                  setValidationError('');
                  setApiError('');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'group'
                    ? 'bg-white text-[#0D8A82] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users size={15} />
                <span>مجموعة كاملة</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('all');
                  setValidationError('');
                  setApiError('');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'all'
                    ? 'bg-white text-amber-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe size={15} />
                <span>جميع الطلاب </span>
              </button>
            </div>
          )}

          {/* 1. Single Result View */}
          {singleResult && (
            <div className="space-y-5 text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle size={32} />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-800">تم إنشاء الكود بنجاح</h4>
                <p className="text-xs text-slate-500 font-medium">
                  تاريخ انتهاء الصلاحية:{' '}
                  <span className="font-bold text-slate-700">{formatDate(singleResult.expiresAt)}</span>
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-teal-50/90 border-2 border-teal-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <KeyRound size={26} className="text-[#0D8A82] shrink-0" />
                  <div className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-[#0D8A82] dir-ltr select-all">
                    {singleResult.code}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyCode(singleResult.code)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer shadow-xs"
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
                  إغلاق النافذة
                </button>
              </div>
            </div>
          )}

          {/* 2. Bulk Group / All Result View */}
          {groupResult && (
            <div className="space-y-5 py-2">
              <div className="text-center space-y-1">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 mb-2">
                  <Sparkles size={30} className="text-emerald-600" />
                </div>
                <h4 className="text-base font-black text-slate-900">
                  تمت عملية التوليد الجماعي بنجاح! 🎉
                </h4>
                <p className="text-xs text-slate-500 font-semibold">
                  تم فحص حالة الطلاب وإنشاء الأكواد وتخطي الاشتراكات السارية تلقائياً
                </p>
              </div>

              {/* Stats Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-center space-y-1">
                  <span className="text-2xl font-black text-emerald-700 block">
                    {Array.isArray(groupResult.generated) ? groupResult.generated.length : 0}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 block">
                    كود جديد تم إنشاؤه ✅
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-center space-y-1">
                  <span className="text-2xl font-black text-amber-700 block">
                    {Array.isArray(groupResult.skipped) ? groupResult.skipped.length : 0}
                  </span>
                  <span className="text-xs font-bold text-amber-800 block">
                    طالب تم تخطيهم (اشتراكهم نشط) ℹ️
                  </span>
                </div>
              </div>

              {/* Action Buttons for Results */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {Array.isArray(groupResult.generated) && groupResult.generated.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsPrintResultOpen(true)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#0D8A82] text-white text-xs font-bold hover:bg-teal-700 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Printer size={16} />
                      <span>طباعة الأكواد الجديدة ({groupResult.generated.length}) 🖨️</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyAllGenerated}
                      className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Copy size={16} />
                      <span>نسخ الكل</span>
                    </button>
                  </>
                )}
              </div>

              {/* Generated Codes List Preview */}
              {Array.isArray(groupResult.generated) && groupResult.generated.length > 0 ? (
                <div className="space-y-2">
                  <h5 className="text-xs font-extrabold text-slate-700">قائمة الأكواد المولدة:</h5>
                  <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 rounded-2xl p-2 bg-slate-50/60 divide-y divide-slate-100">
                    {groupResult.generated.map((item, idx) => {
                      const st = studentMap.get(String(item.studentID));
                      return (
                        <div
                          key={item.code || idx}
                          className="pt-2 first:pt-0 flex items-center justify-between text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-slate-800 block">
                              {st?.name || 'طالب مسجل'}
                            </span>
                            {st?.phone && (
                              <span className="text-[11px] text-slate-400 font-mono block">
                                {st.phone}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm tracking-wider text-[#0D8A82] bg-white px-3 py-1 rounded-lg border border-teal-200 select-all">
                              {item.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(item.code)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition"
                              title="نسخ"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs font-bold text-slate-600">
                  جميع الطلاب المحددين لديهم اشتراكات نشطة سارية بالفعل، لم يتم إنشاء أكواد جديدة.
                </div>
              )}

              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          )}

          {/* 3. Forms (when no result is showing) */}
          {!singleResult && !groupResult && (
            <div className="space-y-4">
              {/* MODE: Single Student */}
              {mode === 'single' && (
                <form onSubmit={handleSingleSubmit} className="space-y-4">
                  {/* Select Group */}
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
                    ) : (
                      <select
                        dir="rtl"
                        value={selectedGroupId}
                        onChange={handleGroupChange}
                        disabled={isPending}
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

                  {/* Select Student */}
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
                      ) : !safeGroupStudents || safeGroupStudents.length === 0 ? (
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
                          disabled={isPending}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-right text-sm font-medium focus:border-[#0D8A82] focus:ring-1 focus:ring-[#0D8A82] transition outline-none disabled:bg-slate-50"
                        >
                          <option value="">اختر الطالب</option>
                          {safeGroupStudents.map((student: GroupStudent) => (
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

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isPending}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isPending || !selectedGroupId || !selectedStudentId || isLoadingStudents}
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

              {/* MODE: Full Group Bulk */}
              {mode === 'group' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      اختر المجموعة المراد توليد أكواد لجميع طلابها <span className="text-rose-500">*</span>
                    </label>

                    {isLoadingGroups ? (
                      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Loader2 size={16} className="animate-spin text-[#0D8A82]" />
                        <span>جاري تحميل المجموعات...</span>
                      </div>
                    ) : (
                      <select
                        dir="rtl"
                        value={selectedGroupId}
                        onChange={handleGroupChange}
                        disabled={isPending}
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

                  {/* Group Info Box */}
                  {selectedGroupId && (
                    <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200/90 space-y-2">
                      <div className="flex items-center justify-between text-xs font-extrabold text-[#0D8A82]">
                        <span className="flex items-center gap-1.5">
                          <Users size={16} />
                          <span>حالة طلاب المجموعة</span>
                        </span>
                        {isLoadingStudents ? (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Loader2 size={14} className="animate-spin" />
                            جاري الحساب...
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-teal-300 text-xs font-black">
                            {safeGroupStudents.length} طالب
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                        سيقوم النظام بتوليد أكواد لجميع الطلاب في هذه المجموعة دفعة واحدة، مع تخطي أي طالب لديه كود سارٍ حالياً تلقائياً لحمايته.
                      </p>
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

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isPending}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={handleGroupBulkSubmit}
                      disabled={
                        isPending ||
                        !selectedGroupId ||
                        isLoadingStudents ||
                        !safeGroupStudents ||
                        safeGroupStudents.length === 0
                      }
                      className="px-6 py-2.5 rounded-xl bg-[#0D8A82] text-white text-xs font-black hover:bg-teal-700 transition cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generateGroupMutation.isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>جاري توليد الأكواد لطلاب المجموعة...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          <span>
                            توليد أكواد المجموعة ({safeGroupStudents.length} طالب) 🚀
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* MODE: All Platform Students Bulk */}
              {mode === 'all' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-3">
                    <div className="flex items-center justify-between text-xs font-extrabold text-amber-900">
                      <span className="flex items-center gap-1.5">
                        <Globe size={18} className="text-amber-600" />
                        <span>توليد أكواد لجميع طلاب المنصة دفعة واحدة</span>
                      </span>
                      {isLoadingAllStudents ? (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Loader2 size={14} className="animate-spin" />
                          جاري الفحص...
                        </span>
                      ) : isErrorAllStudents ? (
                        <button
                          type="button"
                          onClick={() => refetchAllStudents()}
                          className="px-2.5 py-1 rounded-xl bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw size={12} />
                          <span>إعادة المحاولة</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1 rounded-xl bg-white border border-amber-300 text-xs font-black text-amber-900 shadow-2xs">
                          {safeAllStudents.length} طالب مسجل
                        </span>
                      )}
                    </div>

                    {isErrorAllStudents && (
                      <p className="text-xs font-bold text-rose-600 bg-white/80 p-2 rounded-lg">
                        {toArabicErrorMessage(errorAllStudents, 'فشل تحميل بيانات طلاب المنصة')}
                      </p>
                    )}

                    <div className="text-xs text-slate-700 font-semibold space-y-1.5 leading-relaxed bg-white/70 p-3.5 rounded-xl border border-amber-200/60">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                        <CheckCircle size={14} className="text-emerald-600" />
                        <span>سيتم إنشاء أكواد لجميع الطلاب الذين انتهت اشتراكاتهم أو ليس لديهم كود.</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                        <AlertTriangle size={14} className="text-amber-600" />
                        <span>الطلاب الذين ما زالت اشتراكاتهم سارية سيتم تخطيهم تلقائياً لمنع أي تكرار.</span>
                      </div>
                    </div>
                  </div>

                  {validationError && (
                    <p className="text-xs font-bold text-rose-600 mt-1">{validationError}</p>
                  )}

                  {apiError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
                      <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                      <span>{apiError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isPending}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={handleAllStudentsBulkSubmit}
                      disabled={
                        isPending ||
                        isLoadingAllStudents ||
                        !safeAllStudents ||
                        safeAllStudents.length === 0
                      }
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generateGroupMutation.isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>جاري توليد الأكواد لجميع الطلاب...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          <span>توليد أكواد لجميع طلاب المنصة ({safeAllStudents.length} طالب) ⚡</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        </ModalErrorBoundary>
      </div>

      {/* Print sheet modal for newly generated codes */}
      {isPrintResultOpen && (
        <PrintAccessCodesModal
          isOpen={isPrintResultOpen}
          onClose={() => setIsPrintResultOpen(false)}
          accessCodes={printableNewCodes}
        />
      )}
    </div>
  );
};

export default GenerateAccessCodeModal;
