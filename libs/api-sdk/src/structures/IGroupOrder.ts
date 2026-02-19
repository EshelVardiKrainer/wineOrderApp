import type { IGroupOrderParticipant } from "./IGroupOrderParticipant";
import type { IShippingSite } from "./IShippingSite";

export type IGroupOrder = {
  id: string;
  shippingSiteId: string;
  shippingSite: IShippingSite;
  status: "open" | "closed" | "submitted" | "shipped";
  createdAt: string;
  closedAt: null | string;
  participants: IGroupOrderParticipant[];
};
