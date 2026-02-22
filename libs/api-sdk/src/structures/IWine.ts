export type IWine = {
  id: string;
  name: string;
  color: "red" | "rose" | "white" | "orange";
  description: string;
  imageUrl: null | string;
  price: number;
  region: string;
  vintage: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
};
