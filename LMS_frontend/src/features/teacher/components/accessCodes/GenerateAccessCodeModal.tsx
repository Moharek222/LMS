import React, { useState, useMemo } from 'react';
import { KeyRound, X, AlertTriangle, Users, User, Globe } from 'lucide-react';
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
  Group,
} from '../../types/groupManagement';
import { toArabicErrorMessage } from '../../../../utils/errorMessage';
import { useToast } from '../../../../context/ToastContext';
import { PrintAccessCodesModal } from './PrintAccessCodesModal';
import { AccessCodeResultViews } from './AccessCodeResultViews';
import { AccessCodeGenerationForms } from './AccessCodeGenerationForms';

export type GenerationMode = 'single' | 'group' | 'all';

interface GenerateAccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: GenerationMode;
}

class ModalErrorBoundary extends React.Component<
  { children: React.ReactNode; onClose: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onClose: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
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

  const [singleResult, setSingleResult] = useState<GeneratedAccessCodeResult | null>(null);
  const [groupResult, setGroupResult] = useState<GenerateGroupAccessCodesResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPrintResultOpen, setIsPrintResultOpen] = useState<boolean>(false);

  const {
    data: groupsData,
    isLoading: isLoadingGroups,
    isError: isErrorGroups,
    error: errorGroups,
    refetch: refetchGroups,
  } = useTeacherGroups({ limit: 100 });

  const activeGroups = useMemo<Group[]>(() => {
    const list: Group[] = Array.isArray(groupsData?.data) ? groupsData.data : [];
    return list.filter((g) => Boolean(g && g._id && g.isActive !== false));
  }, [groupsData]);

  const {
    data: groupStudents,
    isLoading: isLoadingStudents,
    isError: isErrorStudents,
    error: errorStudents,
    refetch: refetchStudents,
  } = useGroupStudents(selectedGroupId);

  const safeGroupStudents: GroupStudent[] = useMemo(() => {
    return Array.isArray(groupStudents) ? groupStudents : [];
  }, [groupStudents]);

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

  const safeAllStudents = useMemo(() => {
    return Array.isArray(allStudents) ? allStudents : [];
  }, [allStudents]);

  const studentMap = useMemo(() => {
    const map = new Map<string, { name: string; phone?: string }>();
    safeAllStudents.forEach((s) => {
      if (s && s._id) {
        map.set(String(s._id), { name: s.name || 'طالب مسجل', phone: s.phone || '' });
      }
    });
    safeGroupStudents.forEach((s) => {
      if (s && s._id) {
        map.set(String(s._id), { name: s.name || 'طالب مسجل', phone: s.phone || '' });
      }
    });
    return map;
  }, [safeAllStudents, safeGroupStudents]);

  const printableNewCodes: AccessCode[] = useMemo(() => {
    if (!groupResult || !Array.isArray(groupResult.generated)) return [];
    return groupResult.generated.map((g, index) => {
      const s = studentMap.get(String(g.studentID)) || { name: 'طالب مسجل', phone: '' };
      return {
        _id: String(g.code || `generated-${index}`),
        studentID: { name: s.name, phone: s.phone || '' },
        code: g.code,
        startAt: g.expiresAt || '',
        expiresAt: g.expiresAt || '',
        status: 'active',
      };
    });
  }, [groupResult, studentMap]);

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
    setSelectedGroupId(e.target.value);
    setSelectedStudentId('');
    setValidationError('');
    setApiError('');
  };

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

  const handleGroupBulkSubmit = () => {
    setValidationError('');
    setApiError('');

    if (!selectedGroupId) {
      setValidationError('يرجى اختيار المجموعة أولاً');
      return;
    }
    const studentIDs = safeGroupStudents.filter((s) => Boolean(s?._id)).map((s) => String(s._id));
    if (studentIDs.length === 0) {
      setValidationError('لا يوجد طلاب في هذه المجموعة لتوليد أكواد لهم');
      return;
    }

    generateGroupMutation.mutate(
      { studentIDs },
      {
        onSuccess: (res) => {
          const genCount = Array.isArray(res?.generated) ? res.generated.length : 0;
          toast.success(`تم إنشاء ${genCount} كود تفعيل بنجاح! 🎉`);
          setGroupResult(res);
        },
        onError: (err: unknown) => {
          const msg = toArabicErrorMessage(err, 'حدث خطأ أثناء توليد الأكواد للمجموعة');
          setApiError(msg);
          toast.error(msg);
        },
      }
    );
  };

  const handleAllStudentsBulkSubmit = () => {
    setValidationError('');
    setApiError('');

    const studentIDs = safeAllStudents.filter((s) => Boolean(s?._id)).map((s) => String(s._id));
    if (studentIDs.length === 0) {
      setValidationError('لا يوجد طلاب مسجلين بالمنصة لتوليد أكواد لهم');
      return;
    }

    generateGroupMutation.mutate(
      { studentIDs },
      {
        onSuccess: (res) => {
          const genCount = Array.isArray(res?.generated) ? res.generated.length : 0;
          toast.success(`تم إنشاء ${genCount} كود لطلاب المنصة بنجاح! 🎉`);
          setGroupResult(res);
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
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('تم نسخ الكود 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('تعذر نسخ الكود');
    }
  };

  const handleCopyAllGenerated = async () => {
    if (!groupResult?.generated?.length) return;
    const fullText = groupResult.generated
      .map((item) => `${studentMap.get(item.studentID)?.name || 'طالب'}: ${item.code}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(fullText);
      toast.success(`تم نسخ ${groupResult.generated.length} كود بنجاح 📋`);
    } catch {
      toast.error('تعذر نسخ الأكواد');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <ModalErrorBoundary onClose={handleClose}>
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

          <div className="overflow-y-auto flex-1 space-y-5 pr-1">
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
                    mode === 'single' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
                    mode === 'group' ? 'bg-white text-[#0D8A82] shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
                    mode === 'all' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe size={15} />
                  <span>جميع الطلاب</span>
                </button>
              </div>
            )}

            <AccessCodeResultViews
              singleResult={singleResult}
              groupResult={groupResult}
              studentMap={studentMap}
              copied={copied}
              onCopyCode={handleCopyCode}
              onCopyAllGenerated={handleCopyAllGenerated}
              onOpenPrintModal={() => setIsPrintResultOpen(true)}
              onClose={handleClose}
            />

            {!singleResult && !groupResult && (
              <AccessCodeGenerationForms
                mode={mode}
                selectedGroupId={selectedGroupId}
                selectedStudentId={selectedStudentId}
                activeGroups={activeGroups}
                safeGroupStudents={safeGroupStudents}
                safeAllStudents={safeAllStudents}
                isLoadingGroups={isLoadingGroups}
                isErrorGroups={isErrorGroups}
                errorGroups={errorGroups}
                refetchGroups={refetchGroups}
                isLoadingStudents={isLoadingStudents}
                isErrorStudents={isErrorStudents}
                errorStudents={errorStudents}
                refetchStudents={refetchStudents}
                isLoadingAllStudents={isLoadingAllStudents}
                isErrorAllStudents={isErrorAllStudents}
                errorAllStudents={errorAllStudents}
                refetchAllStudents={refetchAllStudents}
                validationError={validationError}
                apiError={apiError}
                isPending={isPending}
                isGeneratingSingle={generateMutation.isPending}
                isGeneratingGroup={generateGroupMutation.isPending}
                onGroupChange={handleGroupChange}
                onStudentChange={(id) => {
                  setSelectedStudentId(id);
                  setValidationError('');
                  setApiError('');
                }}
                onSingleSubmit={handleSingleSubmit}
                onGroupBulkSubmit={handleGroupBulkSubmit}
                onAllStudentsBulkSubmit={handleAllStudentsBulkSubmit}
                onClose={handleClose}
              />
            )}
          </div>
        </ModalErrorBoundary>
      </div>

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
