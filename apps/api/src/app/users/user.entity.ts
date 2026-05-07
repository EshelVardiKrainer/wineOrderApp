import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { CartItem } from '../cart/cart-item.entity';
import { GroupOrderParticipant } from '../group-orders/entities/group-order-participant.entity';

export type UserRole = 'CUSTOMER' | 'RETAIL' | 'ADMIN' | 'SUPER_ADMIN';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  googleId!: string | null;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl!: string | null;

  @Column({ type: 'varchar', default: 'CUSTOMER' })
  role!: UserRole;

  @Column({ type: 'timestamptz', nullable: true })
  lastActiveAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => CartItem, (cartItem) => cartItem.user)
  cartItems!: CartItem[];

  @OneToMany(() => GroupOrderParticipant, (p) => p.user)
  groupOrderParticipations!: GroupOrderParticipant[];
}
