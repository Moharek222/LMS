import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitExam } from '../api/examSubmissionApi';
import type { SubmitExamPayload, ExamSubmissionResult } from '../types/examSubmission';
import { STUDENT_EXAM_HISTORY_QUERY_KEY } from '../../student/hooks/useStudentExamHistory';

export interface SubmitExamVariables {
  courseId: string;
  examId: string;
  payload: SubmitExamPayload;
}

export const useSubmitExam = () => {
  const queryClient = useQueryClient();

  return useMutation<ExamSubmissionResult, Error, SubmitExamVariables>({
    mutationFn: ({ courseId, examId, payload }) =>
      submitExam(courseId, examId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_EXAM_HISTORY_QUERY_KEY,
      });
    },
  });
};

export default useSubmitExam;
