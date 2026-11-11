import apiClient from './apiClient';
import type { Group, GroupResponse } from '../types/group';

/**
 * Fetches active groups directly from the backend API.
 */
export const getGroupsApi = async (): Promise<Group[]> => {
  const response = await apiClient.get<GroupResponse | { groups?: Group[] } | Group[]>('/api/groups', {
    params: { page: 1, limit: 100 },
  });

  const resData = response.data;
  let list: Group[] = [];

  if (resData) {
    if (Array.isArray(resData)) {
      list = resData;
    } else if ('data' in resData && Array.isArray(resData.data)) {
      list = resData.data;
    } else if ('groups' in resData && Array.isArray(resData.groups)) {
      list = resData.groups;
    }
  }

  return list.filter((g) => Boolean(g && g._id && g.name));
};

export const groupService = {
  getGroups: getGroupsApi,
};

export default groupService;
