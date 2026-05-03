import { UserRole } from './user.interface';

export type RoleRequestStatus = 'PENDING' | 'APPROVED' | 'DENIED';

export interface IRoleRequest {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string | null;
  };
  requestedRole: 'ADMIN' | 'RETAIL';
  status: RoleRequestStatus;
  reason?: string | null;
  reviewedById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IRoleRequestCreate {
  requestedRole: 'ADMIN' | 'RETAIL';
  reason?: string;
}

export interface IRoleRequestReview {
  status: 'APPROVED' | 'DENIED';
}

export interface IUpdateUserRole {
  role: UserRole;
}
