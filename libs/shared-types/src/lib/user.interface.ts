export type UserRole = 'CUSTOMER' | 'RETAIL' | 'ADMIN';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface IUserCreate {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
