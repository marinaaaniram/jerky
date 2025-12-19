import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity('delivery_surveys')
export class DeliverySurvey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id', unique: true })
  orderId: number;

  @OneToOne(() => Order, order => order.deliverySurvey)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'photo_url', type: 'text', nullable: true })
  photoUrl: string;

  @Column({ name: 'stock_check_notes', type: 'text' })
  stockCheckNotes: string;

  @Column({ name: 'layout_notes', type: 'text' })
  layoutNotes: string;

  @Column({ name: 'other_notes', type: 'text', nullable: true })
  otherNotes: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
