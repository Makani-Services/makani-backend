import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { CustomerEntity } from './entities/customer.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/user/entities/user.entity';
import { RoleEntity } from 'src/role/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity, UserEntity, RoleEntity])],
  controllers: [CustomerController],
  providers: [CustomerService, JwtService],
})
export class CustomerModule {}
