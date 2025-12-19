import { OrderItem } from '../../orders/entities/order-item.entity';
import { StockMovement } from '../../stock-movements/entities/stock-movement.entity';
import { PriceRule } from '../../price-rules/entities/price-rule.entity';
export declare class Product {
    id: number;
    name: string;
    price: number;
    stockQuantity: number;
    orderItems: OrderItem[];
    stockMovements: StockMovement[];
    priceRules: PriceRule[];
    createdAt: Date;
    updatedAt: Date;
}
