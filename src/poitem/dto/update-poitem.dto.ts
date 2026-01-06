import { PartialType } from '@nestjs/swagger';
import { IsNumber, IsString, IsDate } from 'class-validator';
import { UserEntity } from 'src/user/entities/user.entity';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { PoEntity } from 'src/po/entities/po.entity';
import { PoItemEntity } from '../entities/poitem.entity';

export class UpdatePoItemDto extends PartialType(PoItemEntity) {
  // po: PoEntity;

  @IsString()
  number: string;

  @IsString()
  description: string;

  @IsString()
  attachment: string;
}
