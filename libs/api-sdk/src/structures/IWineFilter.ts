export type IWineFilter = {
  color?: "red" | "rose" | "white" | "orange";
  region?: undefined | string;
  minVintage?: undefined | number;
  maxVintage?: undefined | number;
  minPrice?: undefined | number;
  maxPrice?: undefined | number;
  search?: undefined | string;
  page?: undefined | number;
  limit?: undefined | number;
};
