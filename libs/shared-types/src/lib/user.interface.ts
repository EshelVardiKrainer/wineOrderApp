export type UserRole = 'CUSTOMER' | 'RETAIL' | 'ADMIN';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}
