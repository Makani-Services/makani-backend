import { PartialType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCustomerLocationDto } from './create-customer-location.dto';

export class UpdateCustomerLocationDto extends PartialType(
  CreateCustomerLocationDto,
) {
  @ApiProperty({ description: 'Location ID to update', required: true })
  @IsNumber()
  id: number;
}
