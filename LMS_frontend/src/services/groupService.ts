import apiClient from './apiClient';
import type { Group } from '../types/group';

/**
 * Fetches active groups directly from the backend API.
 */
export const getGroupsApi = async (): Promise<Group[]> => {
  try {
    const response = await apiClient.get<any>('/api/groups', {
      params: { page: 1, limit: 100 },
      headers: {
        'X-Skip-Auth-Redirect': 'true',
      },
    });

    const resData = response.data;
    let list: Group[] = [];

    if (resData) {
      if (Array.isArray(resData.data)) {
        list = resData.data;
      } else if (Array.isArray(resData.groups)) {
        list = resData.groups;
      } else if (Array.isArray(resData)) {
        list = resData;
      }
    }

    return list.filter((g) => g && g._id && g.name);
  } catch (error) {
    console.error('Failed to fetch groups:', error);
    return [];
  }
};

export const groupService = {
  getGroups: getGroupsApi,
};

export default groupService;
