import type { IWine } from "./IWine";

export type IOrderItem = {
  id: string;
  participantId: string;
  wineId: string;
  wine: IWine;
  quantity: number;
  unitPrice: number;
};
