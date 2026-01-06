import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class RoleInputDto {
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
