import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GroupOrderParticipant } from './group-order-participant.entity';
import { Wine } from '../../wines/wine.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  participantId!: string;

  @ManyToOne(() => GroupOrderParticipant, (p) => p.orderItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'participantId' })
  participant!: GroupOrderParticipant;

  @Column()
  wineId!: string;

  @ManyToOne(() => Wine, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wineId' })
  wine!: Wine;

  @Column('int')
  quantity!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice!: number;
}
