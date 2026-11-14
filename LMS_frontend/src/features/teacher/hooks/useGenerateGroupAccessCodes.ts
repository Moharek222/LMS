import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateGroupAccessCodes } from '../api/teacherAccessCodesApi';
import type {
  GenerateGroupAccessCodesResult,
  GenerateGroupAccessCodesPayload,
} from '../types/groupManagement';
import { teacherQueryKeys } from '../constants/teacherQueryKeys';

export const useGenerateGroupAccessCodes = () => {
  const queryClient = useQueryClient();

  return useMutation<GenerateGroupAccessCodesResult, Error, GenerateGroupAccessCodesPayload>({
    mutationFn: (payload) => generateGroupAccessCodes(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teacherQueryKeys.accessCodesRoot(),
      });
    },
  });
};

export default useGenerateGroupAccessCodes;
