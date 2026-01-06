import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { CreateNotificationDto } from './create-notification.dto';
export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  // @ApiProperty({
  //   type: String,
  // })
  @IsNumber()
  flow: number;

  @IsNumber()
  event: number;

  @IsString()
  recipientList: string;
}
