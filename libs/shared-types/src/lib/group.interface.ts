import { IUser } from './user.interface';
import { IShippingSite, IShippingSiteCreate } from './shipping-site.interface';

export type GroupStatus = 'PENDING_APPROVAL' | 'ACTIVE';

export interface IGroup {
  id: string;
  name: string;
  shippingSiteId: string | null;
  shippingSite?: IShippingSite;
  status: GroupStatus;
  createdAt: string;
  updatedAt: string;
  members?: IGroupMember[];
}

export type GroupMemberRole = 'OWNER' | 'MANAGER' | 'MEMBER';
export type GroupMemberStatus = 'PENDING' | 'INVITED' | 'ACTIVE';

export interface IGroupMember {
  id: string;
  groupId: string;
  userId: string;
  user?: IUser;
  role: GroupMemberRole;
  status: GroupMemberStatus;
  joinedAt: string;
}

export interface IGroupCreateRequest {
  name: string;
  shippingSiteDetails: IShippingSiteCreate;
}
