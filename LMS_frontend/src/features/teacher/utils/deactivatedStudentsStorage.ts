export interface DeactivatedStudentItem {
  _id: string;
  name: string;
  phone: string;
  parentPhone: string;
  groupId?: string;
  groupName?: string;
  deactivatedAt: string;
}

const STORAGE_KEY = 'lms_deactivated_students';

export const getDeactivatedStudents = (): DeactivatedStudentItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addDeactivatedStudent = (item: DeactivatedStudentItem) => {
  const current = getDeactivatedStudents();
  const existsIndex = current.findIndex((s) => s._id === item._id);
  let updated: DeactivatedStudentItem[];
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = { ...updated[existsIndex], ...item };
  } else {
    updated = [item, ...current];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const removeDeactivatedStudent = (studentId: string) => {
  const current = getDeactivatedStudents();
  const updated = current.filter((s) => s._id !== studentId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
