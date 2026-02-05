import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateTicketMessageDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  readonly ticketId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  readonly senderId?: number;
}
