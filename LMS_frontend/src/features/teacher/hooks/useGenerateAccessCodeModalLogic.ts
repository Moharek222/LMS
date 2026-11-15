import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTeacherGroups } from './useTeacherGroups';
import { useGroupStudents } from './useGroupStudents';
import { useGenerateAccessCode } from './useGenerateAccessCode';
import { useGenerateGroupAccessCodes } from './useGenerateGroupAccessCodes';
import { getAllStudentsApi } from '../api/teacherAccessCodesApi';
import type {
  GeneratedAccessCodeResult,
  GenerateGroupAccessCodesResult,
  AccessCode,
  GroupStudent,
  Group,
} from '../types/groupManagement';
import { Grade } from '../../../types/grade';
import { AcademicTrack } from '../../../types/academicTrack';
import { toArabicErrorMessage } from '../../../utils/errorMessage';
import { useToast } from '../../../context/ToastContext';

export type GenerationMode = 'single' | 'group' | 'all';

interface UseGenerateAccessCodeModalLogicParams {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: GenerationMode;
}

export const useGenerateAccessCodeModalLogic = ({
  isOpen,
  onClose,
  initialMode = 'single',
}: UseGenerateAccessCodeModalLogicParams) => {
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

  // Load all students whenever modal is open so instant search and 2nd sec cohorts work seamlessly
  const {
    data: allStudents,
    isLoading: isLoadingAllStudents,
    isError: isErrorAllStudents,
    error: errorAllStudents,
    refetch: refetchAllStudents,
  } = useQuery({
    queryKey: ['all-active-students-list'],
    queryFn: () => getAllStudentsApi(),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const safeAllStudents = useMemo(() => {
    return Array.isArray(allStudents) ? allStudents : [];
  }, [allStudents]);

  const studentMap = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        phone?: string;
        grade?: Grade | string;
        academicTrack?: AcademicTrack | string;
        groupName?: string;
      }
    >();

    safeAllStudents.forEach((s) => {
      if (s && s._id) {
        let groupName = '';
        if (s.groupID && typeof s.groupID === 'object' && 'name' in s.groupID) {
          groupName = s.groupID.name;
        }
        map.set(String(s._id), {
          name: s.name || 'طالب مسجل',
          phone: s.phone || '',
          grade: s.grade,
          academicTrack: s.academicTrack,
          groupName,
        });
      }
    });

    safeGroupStudents.forEach((s) => {
      if (s && s._id && !map.has(String(s._id))) {
        map.set(String(s._id), {
          name: s.name || 'طالب مسجل',
          phone: s.phone || '',
          grade: s.grade,
        });
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
        enrichedStudent: {
          _id: String(g.studentID),
          name: s.name,
          phone: s.phone,
          grade: s.grade,
          academicTrack: s.academicTrack,
          groupName: s.groupName,
        },
      };
    });
  }, [groupResult, studentMap]);

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

    if (!selectedStudentId) {
      setValidationError('يرجى تحديد أو اختيار الطالب لتوليد كود تفعيل له');
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
            msg =
              errorObj?.response?.data?.message ||
              'الطالب لديه كود تفعيل نشط بالفعل ولا يمكن إنشاء كود جديد له حالياً.';
          }
          setApiError(msg);
          toast.error(msg);
        },
      }
    );
  };

  const handleBatchSubmit = (studentIDs: string[], cohortName: string) => {
    setValidationError('');
    setApiError('');

    if (!studentIDs || studentIDs.length === 0) {
      setValidationError(`لا يوجد طلاب في ${cohortName} لتوليد أكواد لهم`);
      return;
    }

    generateGroupMutation.mutate(
      { studentIDs },
      {
        onSuccess: (res) => {
          const genCount = Array.isArray(res?.generated) ? res.generated.length : 0;
          toast.success(`تم إنشاء ${genCount} كود لـ ${cohortName} بنجاح! 🎉`);
          setGroupResult(res);
        },
        onError: (err: unknown) => {
          const msg = toArabicErrorMessage(err, `حدث خطأ أثناء توليد الأكواد لـ ${cohortName}`);
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

    const groupName = activeGroups.find((g) => g._id === selectedGroupId)?.name || 'المجموعة';
    handleBatchSubmit(studentIDs, `مجموعة ${groupName}`);
  };

  const handleAllStudentsBulkSubmit = () => {
    setValidationError('');
    setApiError('');

    const studentIDs = safeAllStudents.filter((s) => Boolean(s?._id)).map((s) => String(s._id));
    if (studentIDs.length === 0) {
      setValidationError('لا يوجد طلاب مسجلين بالمنصة لتوليد أكواد لهم');
      return;
    }

    handleBatchSubmit(studentIDs, 'جميع طلاب المنصة');
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

  return {
    mode,
    setMode,
    selectedGroupId,
    selectedStudentId,
    setSelectedStudentId,
    validationError,
    setValidationError,
    apiError,
    setApiError,
    singleResult,
    groupResult,
    copied,
    isPrintResultOpen,
    setIsPrintResultOpen,
    activeGroups,
    safeGroupStudents,
    safeAllStudents,
    studentMap,
    printableNewCodes,
    isLoadingGroups,
    isErrorGroups,
    errorGroups,
    refetchGroups,
    isLoadingStudents,
    isErrorStudents,
    errorStudents,
    refetchStudents,
    isLoadingAllStudents,
    isErrorAllStudents,
    errorAllStudents,
    refetchAllStudents,
    isPending,
    isGeneratingSingle: generateMutation.isPending,
    isGeneratingGroup: generateGroupMutation.isPending,
    handleClose,
    handleGroupChange,
    handleSingleSubmit,
    handleBatchSubmit,
    handleGroupBulkSubmit,
    handleAllStudentsBulkSubmit,
    handleCopyCode,
    handleCopyAllGenerated,
  };
};

export default useGenerateAccessCodeModalLogic;

