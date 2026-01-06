import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateVendorDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly company?: string;
}
