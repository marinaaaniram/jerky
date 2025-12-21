import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { PriceRule } from '../../price-rules/entities/price-rule.entity';
import { CustomerComment } from './customer-comment.entity';
import { CustomerInteraction } from './customer-interaction.entity';

export enum PaymentType {
  DIRECT = 'прямые',
  CONSIGNMENT = 'реализация'
}

@Entity('customers')
@Index(['isArchived'])
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({
    name: 'payment_type',
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.DIRECT
  })
  paymentType: PaymentType;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => parseFloat(String(value)),
    },
  })
  debt: number;

  @Column({ name: 'is_archived', default: false })
  isArchived: boolean;

  @OneToMany(() => Order, order => order.customer)
  orders: Order[];

  @OneToMany(() => Payment, payment => payment.customer)
  payments: Payment[];

  @OneToMany(() => PriceRule, priceRule => priceRule.customer)
  priceRules: PriceRule[];

  @OneToMany(() => CustomerComment, comment => comment.customer, {
    cascade: true,
  })
  comments: CustomerComment[];

  @OneToMany(() => CustomerInteraction, interaction => interaction.customer, {
    cascade: true,
  })
  interactions: CustomerInteraction[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
