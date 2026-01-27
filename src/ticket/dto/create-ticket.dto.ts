import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly subject: string;

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
  readonly createdById?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly company?: string;
}
