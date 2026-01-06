import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CustomerRoleUpdateDto {
  @ApiProperty({
    type: Number,
    description: 'ID of the customer role to update',
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    type: String,
    description: 'Name/identifier of the customer role',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
