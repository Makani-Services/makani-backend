import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { TechnicianEntity } from 'src/technician/entities/technician.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
export class CreateTimesheetDto {
  // @ApiProperty({
  //   type: String,
  // })

  technician: TechnicianEntity;

  @IsNumber()
  regularTime: number;

  @IsNumber()
  overTime: number;
}
