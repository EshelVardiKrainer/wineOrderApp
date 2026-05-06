import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ShippingSite } from '../../shipping-sites/shipping-site.entity';
import { GroupMember } from './group-member.entity';
import { GroupOrder } from '../../group-orders/entities/group-order.entity';
import { GroupStatus } from '@wine-order-app/shared-types';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  shippingSiteId!: string | null;

  @ManyToOne(() => ShippingSite, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'shippingSiteId' })
  shippingSite?: ShippingSite;

  @Column({ type: 'varchar', default: 'PENDING_APPROVAL' })
  status!: GroupStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => GroupMember, (member) => member.group)
  members!: GroupMember[];

  @OneToMany(() => GroupOrder, (order) => order.group)
  orders!: GroupOrder[];
}