import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { GroupOrder } from '../group-orders/entities/group-order.entity';
import { Group } from '../groups/entities/group.entity';

@Entity('shipping_sites')
export class ShippingSite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  address!: string;

  @Column()
  city!: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Group, (group) => group.shippingSite)
  groups!: Group[];

  @OneToMany(() => GroupOrder, (go) => go.shippingSite)
  groupOrders!: GroupOrder[];
}
