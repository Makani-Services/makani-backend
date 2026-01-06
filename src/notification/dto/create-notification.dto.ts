import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString, IsOptional } from 'class-validator';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
export class CreateNotificationDto {
  // @ApiProperty({
  //   type: String,
  // })

  @IsNumber()
  flow: number;

  @IsNumber()
  event: number;

  @IsString()
  recipientList: string;

  @IsOptional()
  @IsString()
  company?: string;
}
