import { IsEnum, IsOptional, IsDateString, IsInt, Min, Max } from 'class-validator';

export enum PeriodType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  ALL = 'all',
  CUSTOM = 'custom',
}

export class TimeFilterDto {
  @IsEnum(PeriodType)
  period: PeriodType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  page?: number = 0;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}
