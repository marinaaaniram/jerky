import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

export enum MovementReason {
  ARRIVAL = 'приход',
  SALE = 'продажа',
  WRITEOFF = 'списание'
}

@Entity('stock_movements')
@Index(['movementDate'])
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

  @Column({ name: 'movement_date', type: 'date' })
  movementDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
