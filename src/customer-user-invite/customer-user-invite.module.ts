import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerUserInviteService } from './customer-user-invite.service';
import { CustomerUserInviteController } from './customer-user-invite.controller';
import { CustomerUserInviteEntity } from './entities/customer-user-invite.entity';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { CustomerUserEntity } from 'src/customer-user/entities/customer-user.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { CustomerRoleEntity } from 'src/customer-role/entities/customer-role.entity';
import { CustomerLocationEntity } from 'src/customer-location/entities/customer-location.entity';
import { EmailModule } from 'src/email/email.module';
import { CustomerUserModule } from 'src/customer-user/customer-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerUserInviteEntity,
      CustomerEntity,
      CustomerUserEntity,
      UserEntity,
      CustomerRoleEntity,
      CustomerLocationEntity,
    ]),
    EmailModule,
    CustomerUserModule,
  ],
  controllers: [CustomerUserInviteController],
  providers: [CustomerUserInviteService],
  exports: [CustomerUserInviteService],
})
export class CustomerUserInviteModule {}
