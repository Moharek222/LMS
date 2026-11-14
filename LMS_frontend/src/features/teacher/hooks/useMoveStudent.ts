import { useMutation, useQueryClient } from '@tanstack/react-query';
import { moveStudent } from '../api/teacherGroupsApi';
import type { MoveStudentResult, MoveStudentPayload } from '../types/groupManagement';
import { teacherQueryKeys } from '../constants/teacherQueryKeys';

export interface MoveStudentVariables {
  studentId: string;
  payload: MoveStudentPayload;
}

export const useMoveStudent = () => {
  const queryClient = useQueryClient();

  return useMutation<MoveStudentResult, Error, MoveStudentVariables>({
    mutationFn: ({ studentId, payload }) => moveStudent(studentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teacherQueryKeys.groupStudentsRoot(),
      });
      queryClient.invalidateQueries({
        queryKey: teacherQueryKeys.groupsRoot(),
      });
    },
  });
};

export default useMoveStudent;
