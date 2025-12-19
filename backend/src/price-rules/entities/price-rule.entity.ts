import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('price_rules')
@Unique(['customerId', 'productId'])
export class PriceRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'customer_id' })
  customerId: number;

  @ManyToOne(() => Customer, customer => customer.priceRules)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'product_id' })
  productId: number;

  @ManyToOne(() => Product, product => product.priceRules, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'special_price', type: 'decimal', precision: 10, scale: 2 })
  specialPrice: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
