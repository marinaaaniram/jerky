import { IsEmail, IsOptional, IsString, MinLength, IsInt, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsInt()
  @IsOptional()
  roleId?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
