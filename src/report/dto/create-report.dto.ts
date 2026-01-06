import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateReportDto {
  @IsOptional()
  @IsNumber()
  branch?: number;

  @IsOptional()
  @IsNumber()
  type?: number;

  @IsOptional()
  @IsString()
  technicians?: string;

  @IsOptional()
  @IsString()
  recipients?: string;

  @IsOptional()
  @IsNumber()
  cycle?: number;

  @IsOptional()
  @IsNumber()
  day?: number;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  company?: string;
}
