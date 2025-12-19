import { IsString, IsOptional } from 'class-validator';

export class CancelMovementDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
