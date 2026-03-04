import { IUser } from './user.interface';

export interface IGoogleLoginRequest {
  idToken: string;
}

export interface IAuthResponse {
  accessToken: string;
  user: IUser;
}
