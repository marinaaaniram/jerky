import { Customer } from '../../customers/entities/customer.entity';
import { Product } from '../../products/entities/product.entity';
export declare class PriceRule {
    id: number;
    customerId: number;
    customer: Customer;
    productId: number;
    product: Product;
    specialPrice: number;
    createdAt: Date;
    updatedAt: Date;
}
