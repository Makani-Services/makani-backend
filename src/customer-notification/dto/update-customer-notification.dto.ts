import { PartialType } from '@nestjs/swagger';
import { CreateCustomerNotificationDto } from './create-customer-notification.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateCustomerNotificationDto extends PartialType(
  CreateCustomerNotificationDto,
) {
  @ApiProperty({ required: false, description: 'Location ID for update' })
  @IsOptional()
  @IsNumber()
  readonly locationId?: number;
}
