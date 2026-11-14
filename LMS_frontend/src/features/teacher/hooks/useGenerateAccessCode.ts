import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateAccessCode } from '../api/teacherAccessCodesApi';
import type { GeneratedAccessCodeResult, GenerateAccessCodePayload } from '../types/groupManagement';
import { teacherQueryKeys } from '../constants/teacherQueryKeys';

export const useGenerateAccessCode = () => {
  const queryClient = useQueryClient();

  return useMutation<GeneratedAccessCodeResult, Error, GenerateAccessCodePayload>({
    mutationFn: (payload) => generateAccessCode(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: teacherQueryKeys.accessCodesRoot(),
      });
      if (variables?.studentID) {
        queryClient.invalidateQueries({
          queryKey: teacherQueryKeys.studentAccessCodes(variables.studentID),
        });
      }
    },
  });
};

export default useGenerateAccessCode;
