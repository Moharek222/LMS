export interface PaginatedResponse<T> {
  message: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: T[];
}

export interface BaseQueryParams {
  page?: number;
  limit?: number;
}

export interface Group {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupStudent {
  _id: string;
  name: string;
  phone: string;
  parentPhone: string;
}

export type PaginatedGroupsResponse = PaginatedResponse<Group>;

export interface GroupResponse {
  message: string;
  data: Group;
}

export interface DeleteGroupResponse {
  message: string;
  data: {
    group: Group;
    affectedStudentsCount: number;
  };
}

export interface GroupStudentsResponse {
  message: string;
  data: GroupStudent[];
}

export interface MoveStudentResult {
  studentID: string;
  name: string;
  newGroupID: string;
  newGroupName: string;
}

export interface MoveStudentResponse {
  message: string;
  data: MoveStudentResult;
}

export interface AccessCodeStudent {
  name: string;
  phone: string;
}

export interface AccessCode {
  _id: string;
  studentID: AccessCodeStudent | string;
  code: string;
  startAt: string;
  expiresAt: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PaginatedAccessCodesResponse = PaginatedResponse<AccessCode>;

export interface GeneratedAccessCodeResult {
  code: string;
  expiresAt: string;
}

export interface GenerateAccessCodeResponse {
  message: string;
  data: GeneratedAccessCodeResult;
}

export interface CreateGroupPayload {
  name: string;
}

export interface UpdateGroupPayload {
  name?: string;
  isActive?: boolean;
}

export interface MoveStudentPayload {
  newGroupID: string;
}

export interface GenerateAccessCodePayload {
  studentID: string;
}

export type GroupQueryParams = BaseQueryParams;
export type AccessCodeQueryParams = BaseQueryParams;
