import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTeacherExamSubmissions,
  getTeacherExamSubmissionDetails,
  gradeEssayQuestions,
  deleteExamSubmission,
} from '../api/teacherExamSubmissionsApi';
import { examQueryKeys } from '../constants/examQueryKeys';
import type { GradeEssayPayload } from '../types/examSubmission';

export const useTeacherExamSubmissions = (
  courseId: string,
  examId: string,
  page: number = 1,
  limit: number = 10,
  status?: string
) => {
  return useQuery({
    queryKey: examQueryKeys.teacherSubmissions(courseId, examId, page, limit, status),
    queryFn: () => getTeacherExamSubmissions(courseId, examId, page, limit, status),
    enabled: Boolean(courseId && examId),
    staleTime: 60 * 1000,
  });
};

export const useTeacherExamSubmissionDetails = (
  courseId: string,
  examId: string,
  submissionId: string | null
) => {
  return useQuery({
    queryKey: examQueryKeys.teacherSubmissionDetails(courseId, examId, submissionId),
    queryFn: () => {
      if (!submissionId) {
        throw new Error('Submission ID is required');
      }
      return getTeacherExamSubmissionDetails(courseId, examId, submissionId);
    },
    enabled: Boolean(courseId && examId && submissionId),
    staleTime: 60 * 1000,
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
        queryKey: examQueryKeys.teacherSubmissions(variables.courseId, variables.examId),
      });
      queryClient.invalidateQueries({
        queryKey: examQueryKeys.teacherSubmissionDetails(
          variables.courseId,
          variables.examId,
          variables.submissionId
        ),
      });
    },
  });
};

export interface DeleteExamSubmissionVariables {
  courseId: string;
  examId: string;
  submissionId: string;
}

export const useDeleteExamSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, examId, submissionId }: DeleteExamSubmissionVariables) =>
      deleteExamSubmission(courseId, examId, submissionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: examQueryKeys.teacherSubmissions(variables.courseId, variables.examId),
      });
      queryClient.invalidateQueries({
        queryKey: examQueryKeys.studentHistory(),
      });
    },
  });
};
