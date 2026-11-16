import { Grade, getGradeShortLabel } from '../../../types/grade';
import { AcademicTrack } from '../../../types/academicTrack';
import type { Course } from '../types/course';

/**
 * Returns a readable Arabic label describing both grade and track for a course.
 * e.g.:
 * - 'تانية ثانوي • مسار عام'
 * - 'تانية ثانوي • مسار بكالوريا'
 * - 'أولى ثانوي'
 * - 'تالتة ثانوي'
 */
export const getCourseGradeTrackLabel = (
  course?: Pick<Course, 'grade' | 'academicTrack'> | null
): string => {
  if (!course || !course.grade) return '';

  if (course.grade === Grade.SecondSecondary) {
    if (course.academicTrack === AcademicTrack.General) {
      return 'تانية ثانوي • مسار عام';
    }
    if (course.academicTrack === AcademicTrack.Baccalaureate) {
      return 'تانية ثانوي • مسار بكالوريا';
    }
    return 'تانية ثانوي';
  }

  return getGradeShortLabel(course.grade);
};

/**
 * Returns badge styling details for an academic track or course.
 */
export const getCourseTrackBadgeStyle = (academicTrack?: AcademicTrack | string | null) => {
  if (academicTrack === AcademicTrack.Baccalaureate) {
    return {
      bg: 'bg-indigo-50/90',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
      label: 'مسار بكالوريا',
    };
  }
  if (academicTrack === AcademicTrack.General) {
    return {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      label: 'مسار عام',
    };
  }
  return null;
};
