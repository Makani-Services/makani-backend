import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty()
  @IsDefined()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  readonly password: string;

  @IsString()
  readonly company: string;
}
