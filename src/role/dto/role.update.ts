import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RoleUpdateDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty({
    type: String,
    uniqueItems: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsArray()
  permissions: number[];
}
