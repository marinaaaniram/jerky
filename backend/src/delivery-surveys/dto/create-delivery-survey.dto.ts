import { IsInt, IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateDeliverySurveyDto {
  @IsInt()
  @IsNotEmpty()
  orderId: number;

  @IsBoolean()
  @IsNotEmpty()
  qualityGood: boolean;

  @IsBoolean()
  @IsNotEmpty()
  packageGood: boolean;

  @IsBoolean()
  @IsNotEmpty()
  deliveryOnTime: boolean;

  @IsString()
  @IsOptional()
  photoUrl?: string; // base64 encoded image

  @IsString()
  @IsOptional()
  comments?: string;
}
