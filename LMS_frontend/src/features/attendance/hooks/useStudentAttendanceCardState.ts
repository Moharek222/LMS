import { useMemo } from 'react';
import { useAuth } from '../../../context/useAuth';
import { useMyAttendanceStats } from './useStudentAttendance';
import { Grade } from '../../../types/grade';

export interface AttendanceSessionSlot {
  sessionNumber: number;
  title: string;
  status: 'present' | 'absent' | 'upcoming';
  label: string;
}

export const useStudentAttendanceCardState = () => {
  const { user } = useAuth();
  const studentId = user?.id || '';
  const groupId = user?.groupId || '';
  const grade = user?.grade;

  const isSecondSecondary = grade === Grade.SecondSecondary;
  const hasNoGroup = !isSecondSecondary && !groupId;

  const {
    data: statsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyAttendanceStats(isSecondSecondary ? undefined : groupId);

  const totalSessions = statsData?.totalSessions ?? 0;
  const attendedSessions = statsData?.attendedSessions ?? 0;
  const absentSessions = Math.max(0, totalSessions - attendedSessions);
  const attendancePercentage = statsData?.attendancePercentage ?? (totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 100);

  // Construct 8 standardized session slots for the educational month
  const sessionSlots = useMemo<AttendanceSessionSlot[]>(() => {
    const slots: AttendanceSessionSlot[] = [];
    const maxSlots = Math.max(8, totalSessions);

    for (let i = 1; i <= maxSlots; i++) {
      let status: 'present' | 'absent' | 'upcoming' = 'upcoming';
      let label = 'قادمة ⚪';

      if (i <= totalSessions) {
        if (i <= attendedSessions) {
          status = 'present';
          label = 'حاضر ✅';
        } else {
          status = 'absent';
          label = 'غياب ❌';
        }
      }

      slots.push({
        sessionNumber: i,
        title: `الحصة ${i}`,
        status,
        label,
      });
    }

    return slots;
  }, [totalSessions, attendedSessions]);

  return {
    studentId,
    groupId,
    grade,
    isSecondSecondary,
    hasNoGroup,
    totalSessions,
    attendedSessions,
    absentSessions,
    attendancePercentage,
    sessionSlots,
    isLoading,
    isError,
    error,
    refetch,
  };
};

