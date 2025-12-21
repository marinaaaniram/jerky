import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { User } from '../../users/entities/user.entity';

export enum CustomerInteractionType {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  CUSTOMER_DATA_UPDATED = 'CUSTOMER_DATA_UPDATED',
  ARCHIVED = 'ARCHIVED',
  UNARCHIVED = 'UNARCHIVED',
}

@Entity('customer_interaction')
@Index(['customerId', 'type', 'createdAt'])
@Index(['customerId', 'createdAt'])
export class CustomerInteraction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerId: number;

  @ManyToOne(() => Customer, (customer) => customer.interactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ nullable: true })
  userId?: number;

  @ManyToOne(() => User, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column('enum', { enum: CustomerInteractionType })
  type: CustomerInteractionType;

  @Column('text')
  description: string;

  @Column('json', { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
