import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('wines')
export class Wine {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl!: string | null;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column()
  region!: string;

  @Column('int')
  vintage!: number;

  @Column('int', { default: 0 })
  stock!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
