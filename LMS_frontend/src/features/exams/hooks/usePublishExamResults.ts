import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  publishExamResults,
  type PublishExamResultsResponse,
} from '../api/teacherExamSubmissionsApi';
import { examQueryKeys } from '../constants/examQueryKeys';

export interface PublishExamResultsVariables {
  courseId: string;
  examId: string;
}

export const usePublishExamResults = () => {
  const queryClient = useQueryClient();

  return useMutation<PublishExamResultsResponse, Error, PublishExamResultsVariables>({
    mutationFn: ({ courseId, examId }: PublishExamResultsVariables) =>
      publishExamResults(courseId, examId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: examQueryKeys.teacherExam(variables.courseId, variables.examId),
      });
      queryClient.invalidateQueries({
        queryKey: examQueryKeys.courseExams(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: examQueryKeys.statistics(variables.courseId, variables.examId),
      });
      queryClient.invalidateQueries({
        queryKey: examQueryKeys.teacherSubmissions(variables.courseId, variables.examId),
      });
      queryClient.invalidateQueries({
        queryKey: ['teacher-exams'],
      });
      queryClient.invalidateQueries({
        queryKey: ['course-exams'],
      });
    },
  });
};

export default usePublishExamResults;

