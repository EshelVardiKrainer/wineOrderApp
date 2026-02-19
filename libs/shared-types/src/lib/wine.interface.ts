export interface IWine {
  id: string;
  name: string;
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
  description: string;
  imageUrl?: string | null;
  price: number;
  region: string;
  vintage: number;
  stock: number;
}

export interface IWineUpdate {
  name?: string;
  description?: string;
  imageUrl?: string | null;
  price?: number;
  region?: string;
  vintage?: number;
  stock?: number;
}

export interface IWineFilter {
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
