import { PartialType } from '@nestjs/swagger';
import { CreateWoDto } from './create-wo.dto';
import { IsNumber, IsString, IsDate, IsBoolean } from 'class-validator';
import { UserEntity } from 'src/user/entities/user.entity';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { CustomerUserEntity } from 'src/customer-user/entities/customer-user.entity';
export class UpdateWoDto extends PartialType(CreateWoDto) {
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
  customerPONumber: string;

  @IsString()
  asset: string;

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

  @IsDate()
  enrouteDate: Date;

  @IsDate()
  arrivedDate: Date;

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
