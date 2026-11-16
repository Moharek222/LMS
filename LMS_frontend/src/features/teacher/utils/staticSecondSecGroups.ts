import { Grade } from '../../../types/grade';
import { AcademicTrack } from '../../../types/academicTrack';
import type { Group } from '../types/groupManagement';

export const STATIC_GROUP_GENERAL_ID = 'static-second-sec-general';
export const STATIC_GROUP_BAC_ID = 'static-second-sec-baccalaureate';

export const STATIC_SECOND_SEC_GENERAL_GROUP: Group = {
  _id: STATIC_GROUP_GENERAL_ID,
  name: 'تانية ثانوي — المسار العام',
  grade: Grade.SecondSecondary,
  academicTrack: AcademicTrack.General,
  isStatic: true,
  isActive: true,
};

export const STATIC_SECOND_SEC_BAC_GROUP: Group = {
  _id: STATIC_GROUP_BAC_ID,
  name: 'تانية ثانوي — مسار البكالوريا',
  grade: Grade.SecondSecondary,
  academicTrack: AcademicTrack.Baccalaureate,
  isStatic: true,
  isActive: true,
};

export const STATIC_SECOND_SEC_GROUPS: Group[] = [
  STATIC_SECOND_SEC_GENERAL_GROUP,
  STATIC_SECOND_SEC_BAC_GROUP,
];

export const isStaticSecondSecGroup = (groupId?: string | null): boolean => {
  if (!groupId) return false;
  return groupId === STATIC_GROUP_GENERAL_ID || groupId === STATIC_GROUP_BAC_ID;
};

export const getStaticTrackFromGroupId = (groupId?: string | null): AcademicTrack | null => {
  if (groupId === STATIC_GROUP_GENERAL_ID) return AcademicTrack.General;
  if (groupId === STATIC_GROUP_BAC_ID) return AcademicTrack.Baccalaureate;
  return null;
};

