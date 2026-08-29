export interface Group {
  _id: string;
  name: string;
  level?: string;
  isActive?: boolean;
}

export interface GroupQuery {
  page?: number;
  limit?: number;
}

export interface GroupResponse {
  message: string;
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  data: Group[];
}
