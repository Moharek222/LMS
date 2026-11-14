import { useQuery } from '@tanstack/react-query';
import { getLessonVideo } from '../api/lessonVideoApi';
import { lessonQueryKeys } from '../constants/lessonQueryKeys';
import type { LessonVideoData } from '../types/lesson';

export const LESSON_VIDEO_QUERY_KEY = ['lesson-video'] as const;

export const useLessonVideo = (lessonId: string) => {
  return useQuery<LessonVideoData, Error>({
    queryKey: lessonQueryKeys.lessonVideo(lessonId),
    queryFn: () => {
      if (!lessonId) {
        throw new Error('Lesson ID is required');
      }
      return getLessonVideo(lessonId);
    },
    enabled: Boolean(lessonId),
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
};

export default useLessonVideo;
