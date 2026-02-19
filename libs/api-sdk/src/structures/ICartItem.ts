import type { IWine } from "./IWine";

export type ICartItem = {
  id: string;
  wineId: string;
  wine: IWine;
  quantity: number;
};
