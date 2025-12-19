import { IsNumber, Min, IsOptional } from 'class-validator';

export class UpdatePriceRuleDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  specialPrice?: number;
}
