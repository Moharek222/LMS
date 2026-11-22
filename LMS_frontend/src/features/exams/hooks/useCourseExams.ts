import { useQuery } from '@tanstack/react-query';
import { getCourseExams, getStudentCourseExams } from '../api/examsApi';
import { examQueryKeys } from '../constants/examQueryKeys';
import type { ExamListItem } from '../types/exam';
import { useAuth } from '../../../context/useAuth';

export const useCourseExams = (courseId?: string) => {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  return useQuery<ExamListItem[], Error>({
    queryKey: isStudent
      ? examQueryKeys.studentCourseExams(courseId)
      : examQueryKeys.teacherCourseExams(courseId),
    queryFn: () => {
      if (!courseId) {
        throw new Error('Course ID is required');
      }
      return isStudent ? getStudentCourseExams(courseId) : getCourseExams(courseId);
    },
    enabled: Boolean(courseId),
    staleTime: 2 * 60 * 1000,
  });
};

export const useStudentCourseExams = (courseId?: string) => {
  return useQuery<ExamListItem[], Error>({
    queryKey: examQueryKeys.studentCourseExams(courseId),
    queryFn: () => {
      if (!courseId) {
        throw new Error('Course ID is required');
      }
      return getStudentCourseExams(courseId);
    },
    enabled: Boolean(courseId),
    staleTime: 2 * 60 * 1000,
  });
};

export const useTeacherCourseExams = (courseId?: string) => {
  return useQuery<ExamListItem[], Error>({
    queryKey: examQueryKeys.teacherCourseExams(courseId),
    queryFn: () => {
      if (!courseId) {
        throw new Error('Course ID is required');
      }
      return getCourseExams(courseId);
    },
    enabled: Boolean(courseId),
    staleTime: 2 * 60 * 1000,
  });
};

export default useCourseExams;
