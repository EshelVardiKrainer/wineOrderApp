import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { GroupOrder } from './group-order.entity';
import { User } from '../../users/user.entity';
import { OrderItem } from './order-item.entity';

@Entity('group_order_participants')
@Unique(['groupOrderId', 'userId'])
export class GroupOrderParticipant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  groupOrderId!: string;

  @ManyToOne(() => GroupOrder, (go) => go.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'groupOrderId' })
  groupOrder!: GroupOrder;

  @Column()
  userId!: string;

  @ManyToOne(() => User, (user) => user.groupOrderParticipations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @CreateDateColumn()
  enrolledAt!: Date;

  @OneToMany(() => OrderItem, (item) => item.participant)
  orderItems!: OrderItem[];
}
