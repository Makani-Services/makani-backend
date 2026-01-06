import { PartialType } from '@nestjs/swagger';
import { CreatePoDto } from './create-po.dto';
import { IsNumber, IsString, IsDate } from 'class-validator';
import { UserEntity } from 'src/user/entities/user.entity';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { PoItemEntity } from 'src/poitem/entities/poitem.entity';

export class UpdatePoDto extends PartialType(CreatePoDto) {
  wo: WoEntity;
  poItems: PoItemEntity;

  @IsString()
  number: string;

  @IsNumber()
  status: number;

  @IsString()
  description: string;

  @IsString()
  vendor: string;

  @IsNumber()
  paymentType: number;

  @IsString()
  attachment: string;
}
