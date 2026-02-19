import type { ICartItem } from "./ICartItem";

export type ICart = {
  items: ICartItem[];
  totalPrice: number;
};
