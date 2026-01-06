import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CustomerSignupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly company: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  readonly customerId?: number;
}
