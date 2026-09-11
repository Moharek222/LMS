import { useMutation, useQueryClient } from '@tanstack/react-query';
import { verifyAccessCode, type VerifyAccessCodeResponse } from '../api/studentAccessCodeApi';

export const useVerifyAccessCode = () => {
  const queryClient = useQueryClient();

  return useMutation<VerifyAccessCodeResponse, Error, string>({
    mutationFn: (code: string) => verifyAccessCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      queryClient.invalidateQueries({ queryKey: ['student-courses'] });
      queryClient.invalidateQueries({ queryKey: ['student-groups'] });
    },
  });
};

export default useVerifyAccessCode;
