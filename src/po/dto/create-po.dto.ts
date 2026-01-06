import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString, isString } from 'class-validator';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { PoItemEntity } from 'src/poitem/entities/poitem.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
export class CreatePoDto {
  // wo: WoEntity;
  // poItems: PoItemEntity;

  @IsNumber()
  status: number;

  @IsString()
  number: string;

  @IsString()
  description: string;

  @IsString()
  vendor: string;

  @IsNumber()
  paymentType: number;

  @IsString()
  attachment: string;
}
