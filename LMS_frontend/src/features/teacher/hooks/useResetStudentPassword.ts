import { useMutation } from '@tanstack/react-query';
import { resetStudentPassword } from '../api/teacherGroupsApi';

interface ResetStudentPasswordVariables {
  studentId: string;
  password: string;
}

export const useResetStudentPassword = () => {
  return useMutation<{ message: string }, Error, ResetStudentPasswordVariables>({
    mutationFn: ({ studentId, password }) => resetStudentPassword(studentId, password),
  });
};

export default useResetStudentPassword;
