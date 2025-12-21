import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { User } from '../../users/entities/user.entity';

@Entity('customer_comment')
@Index(['customerId', 'createdAt'])
export class CustomerComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerId: number;

  @ManyToOne(() => Customer, (customer) => customer.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column()
  userId: number;

  @ManyToOne(() => User, {
    eager: true,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
