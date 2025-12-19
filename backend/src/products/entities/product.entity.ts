import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { StockMovement } from '../../stock-movements/entities/stock-movement.entity';
import { PriceRule } from '../../price-rules/entities/price-rule.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'stock_quantity', type: 'int', default: 0 })
  stockQuantity: number;

  @OneToMany(() => OrderItem, orderItem => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => StockMovement, stockMovement => stockMovement.product)
  stockMovements: StockMovement[];

  @OneToMany(() => PriceRule, priceRule => priceRule.product)
  priceRules: PriceRule[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
