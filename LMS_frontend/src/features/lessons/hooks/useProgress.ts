import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { markLessonAsWatched, getStudentWatchHistory, type MarkLessonWatchedPayload } from '../api/progressApi';

export const useMarkLessonAsWatched = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MarkLessonWatchedPayload) => markLessonAsWatched(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['watch-history', variables.courseID] });
      queryClient.invalidateQueries({ queryKey: ['student-lessons'] });
    },
  });
};

export const useStudentWatchHistory = (studentID?: string) => {
  return useQuery({
    queryKey: ['student-watch-history', studentID],
    queryFn: () => getStudentWatchHistory(studentID!),
    enabled: Boolean(studentID),
  });
};
