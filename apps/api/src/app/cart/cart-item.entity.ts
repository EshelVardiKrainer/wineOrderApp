import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Wine } from '../wines/wine.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User, (user) => user.cartItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  wineId!: string;

  @ManyToOne(() => Wine, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wineId' })
  wine!: Wine;

  @Column('int')
  quantity!: number;
}
