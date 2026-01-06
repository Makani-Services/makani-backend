import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CustomerRoleController } from './customer-role.controller';
import { CustomerRoleService } from './customer-role.service';
import { CustomerRoleEntity } from './entities/customer-role.entity';
import { default as config } from 'src/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerRoleEntity]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: config.jwt.secretOrKey,
      }),
    }),
  ],
  controllers: [CustomerRoleController],
  providers: [CustomerRoleService],
  exports: [CustomerRoleService],
})
export class CustomerRoleModule {}
