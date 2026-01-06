import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
export class CreateTechnicianDto {
  // @ApiProperty({
  //   type: String,
  // })
  technician: UserEntity;
  wo: WoEntity;
  user: UserEntity;

  @IsNumber()
  status: number;

  @IsNumber()
  techStatus: number;

  @IsNumber()
  roldId: number;

  @IsString()
  timesheet: string;

  @IsString()
  totalTimesheet: string;

  @IsDate()
  acceptedDate: Date;

  @IsDate()
  rejectedDate: Date;
}
