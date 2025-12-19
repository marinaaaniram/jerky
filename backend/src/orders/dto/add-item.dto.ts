import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AddItemDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}
