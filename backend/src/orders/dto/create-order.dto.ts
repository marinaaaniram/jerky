import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  @IsNotEmpty()
  customerId: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
