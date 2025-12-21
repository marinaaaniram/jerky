import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { DeliverySurvey } from '../../delivery-surveys/entities/delivery-survey.entity';

export enum OrderStatus {
  NEW = 'Новый',
  ASSEMBLING = 'В сборке',
  TRANSFERRED = 'Передан курьеру',
  DELIVERED = 'Доставлен'
}

@Entity('orders')
@Index(['status'])
@Index(['orderDate'])
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'customer_id' })
  customerId: number;

  @ManyToOne(() => Customer, customer => customer.orders, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'user_id', nullable: true })
  userId?: number;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'order_date', type: 'date' })
  orderDate: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.NEW
  })
  status: OrderStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  orderItems: OrderItem[];

  @OneToOne(() => DeliverySurvey, survey => survey.order)
  deliverySurvey: DeliverySurvey;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
