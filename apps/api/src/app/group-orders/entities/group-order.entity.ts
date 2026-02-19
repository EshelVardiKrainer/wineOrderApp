import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ShippingSite } from '../../shipping-sites/shipping-site.entity';
import { GroupOrderParticipant } from './group-order-participant.entity';

export type GroupOrderStatus = 'open' | 'closed' | 'submitted' | 'shipped';

@Entity('group_orders')
export class GroupOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  shippingSiteId!: string;

  @ManyToOne(() => ShippingSite, (site) => site.groupOrders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shippingSiteId' })
  shippingSite!: ShippingSite;

  @Column({ type: 'varchar', default: 'open' })
  status!: GroupOrderStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt!: Date | null;

  @OneToMany(() => GroupOrderParticipant, (p) => p.groupOrder)
  participants!: GroupOrderParticipant[];
}
