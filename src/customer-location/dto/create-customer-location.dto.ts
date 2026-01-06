import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerLocationDto {
  @ApiProperty({ description: 'Location name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Location address', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'Location phone number', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Location timezone', required: false })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiProperty({ description: 'Customer ID', required: true })
  @IsNumber()
  customerId: number;
}
