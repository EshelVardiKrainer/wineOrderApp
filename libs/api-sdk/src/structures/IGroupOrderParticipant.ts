import type { IOrderItem } from "./IOrderItem";
import type { IUser } from "./IUser";

export type IGroupOrderParticipant = {
  id: string;
  groupOrderId: string;
  userId: string;
  user: IUser;
  enrolledAt: string;
  orderItems: IOrderItem[];
};
