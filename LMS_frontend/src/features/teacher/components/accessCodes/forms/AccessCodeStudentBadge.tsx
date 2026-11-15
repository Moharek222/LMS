import React from 'react';
import { Grade } from '../../../../../types/grade';
import { AcademicTrack } from '../../../../../types/academicTrack';
import type { PlatformStudentItem } from '../../../api/teacherAccessCodesApi';

interface AccessCodeStudentBadgeProps {
  student: Pick<PlatformStudentItem, 'grade' | 'academicTrack'>;
}

export const AccessCodeStudentBadge: React.FC<AccessCodeStudentBadgeProps> = ({ student }) => {
  const g = student.grade;
  const t = student.academicTrack;

  if (g === Grade.SecondSecondary || g === 'second_secondary') {
    if (t === AcademicTrack.General || t === 'general') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200">
          تانية ثانوي • عام 
        </span>
      );
    }
    if (t === AcademicTrack.Baccalaureate || t === 'baccalaureate') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-fuchsia-50 text-fuchsia-700 text-[11px] font-bold border border-fuchsia-200">
          تانية ثانوي • بكالوريا 
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200">
        تانية ثانوي
      </span>
    );
  }

  if (g === Grade.FirstSecondary || g === 'first_secondary') {
    return (
      <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-200">
        أولى ثانوي
      </span>
    );
  }

  if (g === Grade.ThirdSecondary || g === 'third_secondary') {
    return (
      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-200">
        تالتة ثانوي
      </span>
    );
  }

  return null;
};

export default AccessCodeStudentBadge;
