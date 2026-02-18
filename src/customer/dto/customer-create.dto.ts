import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly companyName: string;

  @ApiProperty()
  @IsOptional()
  readonly phone: string;

  @ApiProperty()
  @IsOptional()
  readonly address: string;

  @ApiProperty()
  @IsOptional()
  readonly contact: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsOptional()
  readonly branch: { id: number };

  @ApiProperty()
  @IsOptional()
  readonly company: string;
}
