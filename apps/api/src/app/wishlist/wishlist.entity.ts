import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Wine } from '../wines/wine.entity';

@Entity('wishlist_items')
@Unique(['userId', 'wineId'])
export class WishlistItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  wineId!: string;

  @ManyToOne(() => Wine, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'wineId' })
  wine!: Wine;

  @CreateDateColumn()
  createdAt!: Date;
}
