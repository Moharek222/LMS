export const AcademicTrack = {
  General: 'general',
  Baccalaureate: 'baccalaureate',
} as const;

export type AcademicTrack = (typeof AcademicTrack)[keyof typeof AcademicTrack];

export interface AcademicTrackOption {
  value: AcademicTrack;
  label: string;
  description: string;
}

export const ACADEMIC_TRACK_OPTIONS: AcademicTrackOption[] = [
  {
    value: AcademicTrack.General,
    label: ' عام',
    description: 'المسار العام  ',
  },
  {
    value: AcademicTrack.Baccalaureate,
    label: ' بكالوريا ',
    description: 'مسار البكالوريا',
  },
];

export const getAcademicTrackLabel = (track?: AcademicTrack | string | null): string => {
  if (!track) return 'غير محدد';
  if (track === AcademicTrack.General || track === 'general') return 'عام';
  if (track === AcademicTrack.Baccalaureate || track === 'baccalaureate') return 'بكالوريا ';
  return String(track);
};
