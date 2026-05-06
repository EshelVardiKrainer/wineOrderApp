import type { IUser } from "./IUser";

export type IGroupMember = {
  id: string;
  groupId: string;
  userId: string;
  user?: IUser;
  role: "OWNER" | "MANAGER" | "MEMBER";
  status: "PENDING" | "INVITED" | "ACTIVE";
  joinedAt: string;
};
