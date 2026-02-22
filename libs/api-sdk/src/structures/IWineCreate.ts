export type IWineCreate = {
  name: string;
  color?: "red" | "rose" | "white" | "orange";
  description: string;
  imageUrl?: null | undefined | string;
  price: number;
  region: string;
  vintage: number;
  stock: number;
};
