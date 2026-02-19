import { IWine } from './wine.interface';

export interface ICartItem {
  id: string;
  wineId: string;
  wine: IWine;
  quantity: number;
}

export interface ICart {
  items: ICartItem[];
  totalPrice: number;
}

export interface ICartItemAdd {
  wineId: string;
  quantity: number;
}

export interface ICartItemUpdate {
  quantity: number;
}
