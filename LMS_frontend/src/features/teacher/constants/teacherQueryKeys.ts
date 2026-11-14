export const teacherQueryKeys = {
  // Groups
  groupsRoot: () => ['teacher-groups'] as const,
  groupsList: (page?: number, limit?: number) => ['teacher-groups', page, limit] as const,
  groupStudentsRoot: () => ['group-students'] as const,
  groupStudents: (groupId?: string) => ['group-students', groupId] as const,

  // Deactivated Students
  deactivatedStudentsRoot: () => ['deactivated-students'] as const,
  deactivatedStudents: (page?: number, limit?: number) =>
    ['deactivated-students', page, limit] as const,

  // Access Codes
  accessCodesRoot: () => ['teacher-access-codes'] as const,
  accessCodes: (page?: number, limit?: number) =>
    ['teacher-access-codes', page, limit] as const,
  studentAccessCodesRoot: () => ['student-access-codes'] as const,
  studentAccessCodes: (studentId?: string, page?: number, limit?: number) =>
    ['student-access-codes', studentId, page, limit] as const,
};

// Aliases for backward compatibility
export const TEACHER_GROUPS_QUERY_KEY = teacherQueryKeys.groupsRoot();
export const GROUP_STUDENTS_QUERY_KEY = teacherQueryKeys.groupStudentsRoot();
export const DEACTIVATED_STUDENTS_QUERY_KEY = teacherQueryKeys.deactivatedStudentsRoot();
export const TEACHER_ACCESS_CODES_QUERY_KEY = teacherQueryKeys.accessCodesRoot();
export const STUDENT_ACCESS_CODES_QUERY_KEY = teacherQueryKeys.studentAccessCodesRoot();

