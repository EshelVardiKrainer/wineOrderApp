import { IUser } from './user.interface';
import { IWine } from './wine.interface';
import { IShippingSite } from './shipping-site.interface';

export type GroupOrderStatus = 'open' | 'closed' | 'submitted' | 'shipped';

export interface IGroupOrder {
  id: string;
  shippingSiteId: string;
  shippingSite: IShippingSite;
  status: GroupOrderStatus;
  createdAt: string;
  closedAt: string | null;
  participants: IGroupOrderParticipant[];
}

export interface IGroupOrderCreate {
  shippingSiteId: string;
}

export interface IGroupOrderParticipant {
  id: string;
  groupOrderId: string;
  userId: string;
  user: IUser;
  enrolledAt: string;
  orderItems: IOrderItem[];
}

export interface IOrderItem {
  id: string;
  participantId: string;
  wineId: string;
  wine: IWine;
  quantity: number;
  unitPrice: number;
}

export interface IOrderItemAdd {
  wineId: string;
  quantity: number;
}

export interface IOrderItemUpdate {
  quantity: number;
}

export interface IGroupOrderSummary {
  groupOrderId: string;
  shippingSite: IShippingSite;
  status: GroupOrderStatus;
  totalParticipants: number;
  totalBottles: number;
  totalPrice: number;
  wineAggregation: IWineAggregation[];
}

export interface IWineAggregation {
  wineId: string;
  wineName: string;
  totalQuantity: number;
  totalPrice: number;
}
