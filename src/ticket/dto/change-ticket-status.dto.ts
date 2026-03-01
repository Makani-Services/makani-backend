import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ChangeTicketStatusDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  readonly ticketId: number;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  readonly status: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly changedByUserId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly changedByCustomerUserId?: number;
}
