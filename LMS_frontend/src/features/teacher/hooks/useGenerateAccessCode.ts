import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateAccessCode } from '../api/teacherAccessCodesApi';
import type { GeneratedAccessCodeResult, GenerateAccessCodePayload } from '../types/groupManagement';
import { TEACHER_ACCESS_CODES_QUERY_KEY, STUDENT_ACCESS_CODES_QUERY_KEY } from './useTeacherAccessCodes';

export const useGenerateAccessCode = () => {
  const queryClient = useQueryClient();

  return useMutation<GeneratedAccessCodeResult, Error, GenerateAccessCodePayload>({
    mutationFn: (payload) => generateAccessCode(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_ACCESS_CODES_QUERY_KEY,
      });
      if (variables?.studentID) {
        queryClient.invalidateQueries({
          queryKey: [...STUDENT_ACCESS_CODES_QUERY_KEY, variables.studentID],
        });
      }
    },
  });
};

export default useGenerateAccessCode;
