import { IUser } from './user.interface';

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'RETAIL';
}

export interface IAuthResponse {
  accessToken: string;
  user: IUser;
}
