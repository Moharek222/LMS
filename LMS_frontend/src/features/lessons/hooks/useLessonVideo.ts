import { useQuery } from '@tanstack/react-query';
import { getLessonVideo } from '../api/lessonVideoApi';
import type { LessonVideoData } from '../types/lesson';

export const LESSON_VIDEO_QUERY_KEY = ['lesson-video'] as const;

export const useLessonVideo = (lessonId: string) => {
  return useQuery<LessonVideoData, Error>({
    queryKey: [...LESSON_VIDEO_QUERY_KEY, lessonId],
    queryFn: () => getLessonVideo(lessonId),
    enabled: Boolean(lessonId),
  });
};

export default useLessonVideo;
