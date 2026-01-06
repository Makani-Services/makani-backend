import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
} from 'class-validator';

export class UpdateCustomerDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly id: number;

  @ApiProperty()
  @IsOptional()
  readonly companyName: string;

  @ApiProperty()
  @IsOptional()
  readonly phone: string;

  @ApiProperty()
  @IsOptional()
  readonly address: string;

  @ApiProperty()
  @IsOptional()
  readonly company: string;
}
