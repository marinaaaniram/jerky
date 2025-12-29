import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignCourierDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;
}

