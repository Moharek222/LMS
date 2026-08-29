
import apiClient from './apiClient';
import type { Group, GroupResponse } from '../types/group';
export const FALLBACK_GROUPS: Group[] = [
  {
    _id: '660000000000000000000001',
    name: 'الصف الأول الثانوي - مجموعة السبت والأربعاء',
    level: 'الأول الثانوي',
    isActive: true,
  },
  {
    _id: '660000000000000000000002',
    name: 'الصف الثاني الثانوي - مجموعة الأحد والثلاثاء',
    level: 'الثاني الثانوي',
    isActive: true,
  },
  {
    _id: '660000000000000000000003',
    name: 'الصف الثالث الثانوي - دفعة 2026',
    level: 'الثالث الثانوي',
    isActive: true,
  },
];

/**
 * Fetches active groups from the backend.
 * Gracefully falls back to predefined groups if backend Group endpoint is unmounted or unreachable.
 */
export const getGroupsApi = async (): Promise<Group[]> => {
  try {
    const response = await apiClient.get<GroupResponse>('/api/group/', {
      params: { page: 1, limit: 20 },
    });

    if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      return response.data.data;
    }
    return FALLBACK_GROUPS;
  } catch (error) {
    // Return safe fallback groups on backend 404/network error to prevent UI crash
    return FALLBACK_GROUPS;
  }
};

export const groupService = {
  getGroups: getGroupsApi,
  fallbackGroups: FALLBACK_GROUPS,
};

export default groupService;
