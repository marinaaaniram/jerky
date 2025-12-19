import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { PaymentType } from '../entities/customer.entity';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsEnum(PaymentType)
  @IsNotEmpty()
  paymentType: PaymentType;

  @IsString()
  @IsOptional()
  notes?: string;
}
