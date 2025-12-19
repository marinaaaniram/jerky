import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';

@Entity('payments')
@Index(['paymentDate'])
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'customer_id' })
  customerId: number;

  @ManyToOne(() => Customer, customer => customer.payments)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => parseFloat(String(value)),
    },
  })
  amount: number;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
