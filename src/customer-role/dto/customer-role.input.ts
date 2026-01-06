import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CustomerRoleInputDto {
  @ApiProperty({
    type: String,
    description: 'Name/identifier of the customer role',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
