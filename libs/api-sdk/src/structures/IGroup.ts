import type { IShippingSite } from "./IShippingSite";
import type { IGroupMember } from "./IGroupMember";

export type IGroup = {
  id: string;
  name: string;
  shippingSiteId: string | null;
  shippingSite?: IShippingSite;
  status: "PENDING_APPROVAL" | "ACTIVE";
  createdAt: string;
  updatedAt: string;
  members?: IGroupMember[];
};
