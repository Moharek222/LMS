import { useMutation } from '@tanstack/react-query';
import { activateStudent } from '../api/teacherGroupsApi';

export const useActivateStudent = () => {
  return useMutation({
    mutationFn: (studentId: string) => activateStudent(studentId),
  });
};

export default useActivateStudent;
