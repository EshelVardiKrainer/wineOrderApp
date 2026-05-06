import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Group } from './group.entity';
import { User } from '../../users/user.entity';
import { GroupMemberRole, GroupMemberStatus } from '@wine-order-app/shared-types';

@Entity('group_members')
@Unique(['groupId', 'userId'])
export class GroupMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  groupId!: string;

  @ManyToOne(() => Group, (group) => group.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'groupId' })
  group!: Group;

  @Column()
  userId!: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar', default: 'MEMBER' })
  role!: GroupMemberRole;

  @Column({ type: 'varchar', default: 'PENDING' })
  status!: GroupMemberStatus;

  @CreateDateColumn()
  joinedAt!: Date;
}