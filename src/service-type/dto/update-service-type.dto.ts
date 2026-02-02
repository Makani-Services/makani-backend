import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateServiceTypeDto {
  @IsNotEmpty()
  @IsNumber()
  readonly id: number;

  @IsNotEmpty()
  @IsString()
  readonly serviceType: string;

  @IsNotEmpty()
  @IsString()
  readonly backgroundColor: string;

  @IsNotEmpty()
  @IsBoolean()
  readonly isArchived: boolean;

  @IsOptional()
  @IsString()
  readonly company?: string;
}
