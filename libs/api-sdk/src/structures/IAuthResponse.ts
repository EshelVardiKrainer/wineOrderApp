import type { IUser } from "./IUser";

export type IAuthResponse = {
  accessToken: string;
  user: IUser;
};
