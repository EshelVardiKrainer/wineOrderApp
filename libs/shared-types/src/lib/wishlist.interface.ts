import { IWine } from './wine.interface';

export interface IWishlistItem {
  id: string;
  userId: string;
  wineId: string;
  wine: IWine;
  createdAt: string;
}
