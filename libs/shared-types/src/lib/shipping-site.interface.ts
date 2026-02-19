export interface IShippingSite {
  id: string;
  name: string;
  address: string;
  city: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IShippingSiteCreate {
  name: string;
  address: string;
  city: string;
  isActive?: boolean;
}

export interface IShippingSiteUpdate {
  name?: string;
  address?: string;
  city?: string;
  isActive?: boolean;
}
