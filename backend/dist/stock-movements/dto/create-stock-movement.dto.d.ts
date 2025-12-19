import { MovementReason } from '../entities/stock-movement.entity';
export declare class CreateStockMovementDto {
    productId: number;
    quantity: number;
    reason: MovementReason;
    notes?: string;
}
