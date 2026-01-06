import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCustomerNotificationDto {
  @ApiProperty({ required: false, description: 'Notification status' })
  @IsOptional()
  @IsNumber()
  readonly status?: number;
  // 0: Work Order is issued
  // 1: Work Order is completed
  // 2: Work Order is billed
  // 10: New Work Order Note

  @ApiProperty({ description: 'Notification type' })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  readonly type: number;
  // 0: Email Notification
  // 1: Web APP Notification
  // 2: Mobile App Notification
  // 3: SMS notification

  @ApiProperty({ required: false, description: 'List of recipients' })
  @IsOptional()
  @IsString()
  readonly recipientList?: string;

  @ApiProperty({ required: false, description: 'Company identifier' })
  @IsOptional()
  @IsString()
  readonly company?: string;

  @ApiProperty({ required: false, description: 'Customer location ID' })
  @IsOptional()
  @IsNumber()
  readonly customerLocationId?: number;

  @ApiProperty({ required: false, description: 'Customer location entity' })
  @IsOptional()
  readonly customerLocation?: any;
}
