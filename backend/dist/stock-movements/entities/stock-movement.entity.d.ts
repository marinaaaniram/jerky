import { Product } from '../../products/entities/product.entity';
export declare enum MovementReason {
    ARRIVAL = "\u043F\u0440\u0438\u0445\u043E\u0434",
    SALE = "\u043F\u0440\u043E\u0434\u0430\u0436\u0430",
    WRITEOFF = "\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435"
}
export declare class StockMovement {
    id: number;
    productId: number;
    product: Product;
    quantityChange: number;
    reason: MovementReason;
    movementDate: Date;
    createdAt: Date;
}
