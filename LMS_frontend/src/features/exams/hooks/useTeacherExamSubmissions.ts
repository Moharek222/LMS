import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTeacherExamSubmissions,
  getTeacherExamSubmissionDetails,
  gradeEssayQuestions,
} from '../api/teacherExamSubmissionsApi';
import type { GradeEssayPayload } from '../types/examSubmission';

export const useTeacherExamSubmissions = (
  courseId: string,
  examId: string,
  page: number = 1,
  limit: number = 10,
  status?: string
) => {
  return useQuery({
    queryKey: ['teacher-exam-submissions', courseId, examId, page, limit, status],
    queryFn: () => getTeacherExamSubmissions(courseId, examId, page, limit, status),
    enabled: Boolean(courseId && examId),
  });
};

export const useTeacherExamSubmissionDetails = (
  courseId: string,
  examId: string,
  submissionId: string | null
) => {
  return useQuery({
    queryKey: ['teacher-exam-submission-details', courseId, examId, submissionId],
    queryFn: () => getTeacherExamSubmissionDetails(courseId, examId, submissionId!),
    enabled: Boolean(courseId && examId && submissionId),
  });
};

export interface GradeEssayVariables {
  courseId: string;
  examId: string;
  submissionId: string;
  payload: GradeEssayPayload;
}

export const useGradeEssayQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, examId, submissionId, payload }: GradeEssayVariables) =>
      gradeEssayQuestions(courseId, examId, submissionId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['teacher-exam-submissions', variables.courseId, variables.examId],
      });
      queryClient.invalidateQueries({
        queryKey: ['teacher-exam-submission-details', variables.courseId, variables.examId, variables.submissionId],
      });
    },
  });
};
