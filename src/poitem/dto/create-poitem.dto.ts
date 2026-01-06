import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { PoEntity } from 'src/po/entities/po.entity';
import { UserEntity } from 'src/user/entities/user.entity';
export class CreatePoItemDto {
  // po: PoEntity;

  @IsString()
  number: string;

  @IsString()
  description: string;

  @IsString()
  attachment: string;
}
