import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PermissionCreateDto {
  @ApiProperty({
    type: String,
    uniqueItems: true
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
