import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CustomerRoleDeleteDto {
  @ApiProperty({
    type: Number,
    description: 'ID of the customer role to delete',
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
