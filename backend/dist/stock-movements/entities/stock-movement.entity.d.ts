import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';
export declare enum MovementReason {
    ARRIVAL = "\u043F\u0440\u0438\u0445\u043E\u0434",
    SALE = "\u043F\u0440\u043E\u0434\u0430\u0436\u0430",
    WRITEOFF = "\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435",
    INVENTORY = "\u0438\u043D\u0432\u0435\u043D\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u044F",
    CORRECTION = "\u043A\u043E\u0440\u0440\u0435\u043A\u0446\u0438\u044F",
    ADJUSTMENT = "\u0443\u0442\u043E\u0447\u043D\u0435\u043D\u0438\u0435"
}
export declare class StockMovement {
    id: number;
    productId: number;
    product: Product;
    quantityChange: number;
    reason: MovementReason;
    reasonText?: string;
    movementDate: Date;
    userId?: number;
    user?: User;
    cancelledBy?: number;
    cancelledByUser?: User;
    isActive: boolean;
    createdAt: Date;
}
