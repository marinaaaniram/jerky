import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

export enum MovementReason {
  ARRIVAL = 'приход',
  SALE = 'продажа',
  WRITEOFF = 'списание',
  INVENTORY = 'инвентаризация',
  CORRECTION = 'коррекция',
  ADJUSTMENT = 'уточнение'
}

@Entity('stock_movements')
@Index(['movementDate'])
@Index(['userId'])
@Index(['isActive'])
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id' })
  productId: number;

  @ManyToOne(() => Product, product => product.stockMovements)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'quantity_change', type: 'int' })
  quantityChange: number;

  @Column({
    type: 'enum',
    enum: MovementReason
  })
  reason: MovementReason;

  @Column({ name: 'reason_text', nullable: true })
  reasonText?: string;

  @Column({ name: 'movement_date', type: 'date' })
  movementDate: Date;

  @Column({ name: 'user_id', nullable: true })
  userId?: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'cancelled_by', nullable: true })
  cancelledBy?: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'cancelled_by' })
  cancelledByUser?: User;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
