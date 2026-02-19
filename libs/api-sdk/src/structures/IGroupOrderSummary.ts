import type { IShippingSite } from "./IShippingSite";
import type { IWineAggregation } from "./IWineAggregation";

export type IGroupOrderSummary = {
  groupOrderId: string;
  shippingSite: IShippingSite;
  status: "open" | "closed" | "submitted" | "shipped";
  totalParticipants: number;
  totalBottles: number;
  totalPrice: number;
  wineAggregation: IWineAggregation[];
};
