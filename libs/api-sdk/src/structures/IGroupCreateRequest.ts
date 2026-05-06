import type { IShippingSiteCreate } from "./IShippingSiteCreate";

export type IGroupCreateRequest = {
  name: string;
  shippingSiteDetails: IShippingSiteCreate;
};
