import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly companyName: string;

  @ApiProperty()
  readonly email: string;

  @ApiProperty()
  readonly contact: string;

  @ApiProperty()
  readonly phone: string;

  @ApiProperty()
  readonly address: string;

  @ApiProperty()
  readonly company: string;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;
}
