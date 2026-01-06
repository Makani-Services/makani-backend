import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerUserService } from './customer-user.service';
import { CustomerUserController } from './customer-user.controller';
import { CustomerUserEntity } from './entities/customer-user.entity';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { CustomerRoleEntity } from 'src/customer-role/entities/customer-role.entity';
import { CustomerLocationEntity } from 'src/customer-location/entities/customer-location.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerUserEntity,
      CustomerEntity,
      CustomerRoleEntity,
      CustomerLocationEntity,
    ]),
  ],
  controllers: [CustomerUserController],
  providers: [CustomerUserService],
  exports: [CustomerUserService],
})
export class CustomerUserModule {}
