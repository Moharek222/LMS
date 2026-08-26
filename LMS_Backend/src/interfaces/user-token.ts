import { Role } from "../user/user-model";
export interface UserToken {
  id: string;
  role: Role; 
  email?: string;
  phone?: string
  sessionId?: string;
}
