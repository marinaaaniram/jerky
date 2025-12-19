import { IsInt, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';
import { MovementReason } from '../entities/stock-movement.entity';

export class CreateStockMovementDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsEnum(MovementReason)
  @IsNotEmpty()
  reason: MovementReason;

  @IsString()
  @IsOptional()
  notes?: string;
}
