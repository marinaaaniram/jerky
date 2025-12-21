import { MovementReason } from '../entities/stock-movement.entity';
export declare class AdjustStockDto {
    newQuantity: number;
    reason: MovementReason;
    reasonText?: string;
}
