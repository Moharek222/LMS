import apiClient from '../../../services/apiClient';
import type {
  Group,
  GroupStudent,
  PaginatedGroupsResponse,
  GroupResponse,
  DeleteGroupResponse,
  GroupStudentsResponse,
  MoveStudentResult,
  MoveStudentResponse,
  CreateGroupPayload,
  UpdateGroupPayload,
  MoveStudentPayload,
  GroupQueryParams,
} from '../types/groupManagement';

export const getTeacherGroups = async (
  params?: GroupQueryParams
): Promise<PaginatedGroupsResponse> => {
  const response = await apiClient.get<PaginatedGroupsResponse>('/api/groups/', { params });
  return response.data;
};

export const getGroupStudents = async (groupId: string): Promise<GroupStudent[]> => {
  const response = await apiClient.get<GroupStudentsResponse>(`/api/groups/${groupId}/students`);
  return response.data.data;
};

export const createGroup = async (payload: CreateGroupPayload): Promise<Group> => {
  const response = await apiClient.post<GroupResponse>('/api/groups/', payload);
  return response.data.data;
};

export const updateGroup = async (
  groupId: string,
  payload: UpdateGroupPayload
): Promise<Group> => {
  const response = await apiClient.put<GroupResponse>(`/api/groups/${groupId}`, payload);
  return response.data.data;
};

export const deleteGroup = async (groupId: string): Promise<DeleteGroupResponse['data']> => {
  const response = await apiClient.delete<DeleteGroupResponse>(`/api/groups/${groupId}`);
  return response.data.data;
};

export const moveStudent = async (
  studentId: string,
  payload: MoveStudentPayload
): Promise<MoveStudentResult> => {
  const response = await apiClient.put<MoveStudentResponse>(
    `/api/groups/move-student/${studentId}`,
    payload
  );
  return response.data.data;
};

export const teacherGroupsApi = {
  getTeacherGroups,
  getGroupStudents,
  createGroup,
  updateGroup,
  deleteGroup,
  moveStudent,
};

export default teacherGroupsApi;
