import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreatePriceRuleDto {
  @IsInt()
  @IsNotEmpty()
  customerId: number;

  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @Min(0)
  specialPrice: number;
}
