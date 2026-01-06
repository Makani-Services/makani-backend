import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsEmail, MinLength, IsNumber, isNumber, IsString } from 'class-validator';

export class CreateCompanyDto {

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsString()
  readonly address: string;

  @ApiProperty()
  @IsString()
  readonly phone: string;

  @ApiProperty()
  @IsString()
  readonly fax: string;

  @ApiProperty()
  @IsString()
  readonly website: string;

  @ApiProperty()
  @IsString()
  readonly logo: string;

}
