import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateServiceTypeDto {
  @IsNotEmpty()
  @IsString()
  readonly serviceType: string;

  @IsOptional()
  @IsString()
  readonly backgroundColor: string;

  @IsOptional()
  @IsBoolean()
  readonly isArchived: boolean;

  @IsOptional()
  @IsString()
  readonly company?: string;
}
