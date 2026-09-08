import { useMutation, useQueryClient } from '@tanstack/react-query';
import { moveStudent } from '../api/teacherGroupsApi';
import type { MoveStudentResult, MoveStudentPayload } from '../types/groupManagement';
import { GROUP_STUDENTS_QUERY_KEY } from './useGroupStudents';
import { TEACHER_GROUPS_QUERY_KEY } from './useTeacherGroups';

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
        queryKey: GROUP_STUDENTS_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: TEACHER_GROUPS_QUERY_KEY,
      });
    },
  });
};

export default useMoveStudent;
