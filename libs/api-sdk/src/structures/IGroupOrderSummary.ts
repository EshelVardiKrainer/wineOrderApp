import type { IShippingSite } from "./IShippingSite";
import type { IWineAggregation } from "./IWineAggregation";

export type IGroupOrderSummary = {
  groupOrderId: string;
  shippingSite: IShippingSite;
  status: "open" | "closed" | "submitted" | "shipped";
  minimumAmount: number;
  minimumReached: boolean;
  totalParticipants: number;
  totalBottles: number;
  totalPrice: number;
  wineAggregation: IWineAggregation[];
};
