import type { IGroupOrderParticipant } from "./IGroupOrderParticipant";
import type { IShippingSite } from "./IShippingSite";

export type IGroupOrder = {
  id: string;
  groupId: string;
  shippingSiteId: string;
  shippingSite: IShippingSite;
  status: "open" | "closed" | "submitted" | "shipped";
  minimumAmount: number;
  createdAt: string;
  closedAt: null | string;
  participants: IGroupOrderParticipant[];
};
