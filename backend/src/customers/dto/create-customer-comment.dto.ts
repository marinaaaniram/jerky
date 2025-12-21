import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCustomerCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  content: string;
}
