import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteCustomerDto {
  @ApiProperty({ description: 'The ID of the customer to delete' })
  @IsNotEmpty()
  @IsNumber()
  readonly customerId: number;
}
