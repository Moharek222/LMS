import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateGroupAccessCodes } from '../api/teacherAccessCodesApi';
import type {
  GenerateGroupAccessCodesResult,
  GenerateGroupAccessCodesPayload,
} from '../types/groupManagement';
import { TEACHER_ACCESS_CODES_QUERY_KEY } from './useTeacherAccessCodes';

export const useGenerateGroupAccessCodes = () => {
  const queryClient = useQueryClient();

  return useMutation<GenerateGroupAccessCodesResult, Error, GenerateGroupAccessCodesPayload>({
    mutationFn: (payload) => generateGroupAccessCodes(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEACHER_ACCESS_CODES_QUERY_KEY,
      });
    },
  });
};

export default useGenerateGroupAccessCodes;
