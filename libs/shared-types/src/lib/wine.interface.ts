export type WineColor = 'red' | 'rose' | 'white' | 'orange';

export interface IWine {
  id: string;
  name: string;
  color: WineColor;
  description: string;
  imageUrl: string | null;
  price: number;
  region: string;
  vintage: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface IWineCreate {
  name: string;
  color?: WineColor;
  description: string;
  imageUrl?: string | null;
  price: number;
  region: string;
  vintage: number;
  stock: number;
}

export interface IWineUpdate {
  name?: string;
  color?: WineColor;
  description?: string;
  imageUrl?: string | null;
  price?: number;
  region?: string;
  vintage?: number;
  stock?: number;
}

export interface IWineFilter {
  color?: WineColor;
  region?: string;
  minVintage?: number;
  maxVintage?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IWineListResponse {
  items: IWine[];
  total: number;
  page: number;
  limit: number;
}
