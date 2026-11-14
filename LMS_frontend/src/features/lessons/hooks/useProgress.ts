import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  markLessonAsWatched,
  getStudentWatchHistory,
  type MarkLessonWatchedPayload,
} from '../api/progressApi';
import { lessonQueryKeys } from '../constants/lessonQueryKeys';

export const useMarkLessonAsWatched = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MarkLessonWatchedPayload) => markLessonAsWatched(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: lessonQueryKeys.watchHistory(variables.courseID),
      });
      queryClient.invalidateQueries({
        queryKey: lessonQueryKeys.studentLessons(),
      });
    },
  });
};

export const useStudentWatchHistory = (studentID?: string) => {
  return useQuery({
    queryKey: lessonQueryKeys.studentWatchHistory(studentID),
    queryFn: () => {
      if (!studentID) {
        throw new Error('Student ID is required');
      }
      return getStudentWatchHistory(studentID);
    },
    enabled: Boolean(studentID),
    staleTime: 2 * 60 * 1000,
  });
};
