import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateStudentProfile, type UpdateStudentProfilePayload } from '../api/studentProfileApi';

export const useUpdateStudentProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateStudentProfilePayload) => updateStudentProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
    },
  });
};

export default useUpdateStudentProfile;
