import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTicketDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  readonly id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly subject?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly woNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly poNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly status?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly createdByUserId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly createdByCustomerId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly requesterUserId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly requesterCustomerId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly assignedAgentId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly company?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly appVersion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly platform?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly deviceModel?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly deviceOS?: string;
}
