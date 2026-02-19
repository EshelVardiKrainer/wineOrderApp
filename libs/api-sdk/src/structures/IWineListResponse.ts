import type { IWine } from "./IWine";

export type IWineListResponse = {
  items: IWine[];
  total: number;
  page: number;
  limit: number;
};
