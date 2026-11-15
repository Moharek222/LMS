import { useState, useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { registerStudentApi } from '../../services/authService';
import { getGroupsApi } from '../../services/groupService';
import { toArabicErrorMessage } from '../../utils/errorMessage';
import type { Group } from '../../types/group';
import { Grade } from '../../types/grade';
import { registerSchema, type RegisterInputs } from './registerSchema';

export const useRegisterLogic = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: groups = [],
    isLoading: isGroupsLoading,
    isError: isGroupsError,
    error: rawGroupsError,
    refetch: refetchGroups,
  } = useQuery<Group[], Error>({
    queryKey: ['register-groups'],
    queryFn: getGroupsApi,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const groupsError = isGroupsError
    ? toArabicErrorMessage(rawGroupsError, 'تعذر تحميل المجموعات الدراسية حالياً.')
    : null;

  const form = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const { control, setValue } = form;
  const selectedGrade = useWatch({ control, name: 'grade' });
  const selectedAcademicTrack = useWatch({ control, name: 'academicTrack' });

  const filteredGroups = useMemo(() => {
    if (!selectedGrade || selectedGrade === Grade.SecondSecondary) return [];
    return groups.filter((g) => g.grade === selectedGrade);
  }, [groups, selectedGrade]);

  // Synchronize conditional fields based on grade selection
  useEffect(() => {
    if (selectedGrade === Grade.SecondSecondary) {
      setValue('groupId', '');
    } else {
      setValue('academicTrack', undefined);
    }
  }, [selectedGrade, setValue]);

  const onSubmit = async (data: RegisterInputs) => {
    setServerError(null);
    setIsLoading(true);

    try {
      await registerStudentApi({
        name: data.name,
        phone: data.phone,
        parentPhone: data.parentPhone,
        grade: data.grade,
        groupId: data.grade === Grade.SecondSecondary ? undefined : data.groupId,
        academicTrack: data.grade === Grade.SecondSecondary ? data.academicTrack : undefined,
        password: data.password,
      });

      setIsSuccess(true);
    } catch (error: unknown) {
      setServerError(toArabicErrorMessage(error, 'حدث خطأ في السيرفر أثناء إنشاء الحساب.'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    serverError,
    isSuccess,
    isLoading,
    selectedGrade,
    selectedAcademicTrack,
    filteredGroups,
    isGroupsLoading,
    groupsError,
    refetchGroups,
    onSubmit,
  };
};

export default useRegisterLogic;

