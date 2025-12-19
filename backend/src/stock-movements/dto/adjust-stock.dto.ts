import { IsInt, IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { MovementReason } from '../entities/stock-movement.entity';

export class AdjustStockDto {
  @IsInt()
  @IsNotEmpty()
  newQuantity: number;

  @IsEnum(MovementReason)
  @IsNotEmpty()
  reason: MovementReason;

  @IsString()
  @IsOptional()
  reasonText?: string;
}
