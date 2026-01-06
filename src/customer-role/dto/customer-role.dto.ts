import { ApiProperty } from '@nestjs/swagger';

export class CustomerRoleDto {
  @ApiProperty({
    type: Number,
    description: 'ID of the customer role',
  })
  id: number;

  @ApiProperty({
    type: String,
    description: 'Name/identifier of the customer role',
  })
  name: string;

  @ApiProperty({
    type: Array,
    description: 'Customer users associated with this role',
  })
  customerUsers: any[];

  @ApiProperty({
    type: Array,
    description: 'Customer invites associated with this role',
  })
  customerInvites: any[];

  @ApiProperty({
    type: Date,
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
