import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Wine } from '../wines/wine.entity';

@Entity('wine_reviews')
@Unique(['userId', 'wineId'])
export class WineReview {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  wineId!: string;

  @ManyToOne(() => Wine, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wineId' })
  wine!: Wine;

  @Column('smallint')
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
