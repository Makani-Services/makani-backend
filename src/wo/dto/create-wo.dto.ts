import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { CustomerUserEntity } from 'src/customer-user/entities/customer-user.entity';
import { UserEntity } from 'src/user/entities/user.entity';
export class CreateWoDto {
  // @ApiProperty({
  //   type: String,
  // })
  requestedCustomerUser: CustomerUserEntity;
  requestedUser: UserEntity;
  openUser: UserEntity;
  customer: CustomerEntity;
  closedUser: UserEntity;

  @IsString()
  company: string;

  @IsString()
  number: string;

  @IsString()
  asset: string;

  @IsString()
  customerPONumber: string;

  @IsString()
  servicesProvided: string;

  @IsString()
  signerName: string;

  @IsDate()
  stSignedDate: Date;

  @IsDate()
  stSentDate: Date;

  @IsNumber()
  status: number;

  @IsNumber()
  type: number;

  @IsNumber()
  NTE: number;

  @IsString()
  description: string;

  techArray: JSON[];

  //service ticket

  // @IsBoolean()
  // isServiceTicketSubmitted: boolean;

  @IsBoolean()
  isServiceTicketEdited: boolean;

  // @IsBoolean()
  // isServiceTicketSent: boolean;

  @IsString()
  recommendations: string;

  @IsString()
  materials: string;

  @IsString()
  ticketReceipients: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  targetDate: Date;

  @IsDate()
  requestedDate: Date;

  // @IsString()
  // timesheetData: string;

  // @IsString()
  // timesheetTotalData: string;

  @IsDate()
  openDate: Date;

  @IsDate()
  closedDate: Date;
}
