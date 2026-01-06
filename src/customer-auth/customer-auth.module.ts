import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerUserEntity } from 'src/customer-user/entities/customer-user.entity';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { CustomerRoleEntity } from 'src/customer-role/entities/customer-role.entity';
import { CustomerLocationEntity } from 'src/customer-location/entities/customer-location.entity';
import { CustomerForgottenPasswordEntity } from './entities/customer-forgotten-password.entity';
import { CustomerRefreshSessionEntity } from './entities/customer-refresh-session.entity';
import { CustomerJWTService } from './customer-jwt.service';
import { CustomerUserService } from 'src/customer-user/customer-user.service';
import { EmailService } from 'src/email/email.service';
import { CustomerJwtAuthGuard } from './guards/customer-jwt-auth.guard';
import { default as config } from 'src/config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: config.jwt.secretOrKey,
      }),
    }),
    TypeOrmModule.forFeature([
      CustomerUserEntity,
      CustomerEntity,
      CustomerRoleEntity,
      CustomerLocationEntity,
      CustomerForgottenPasswordEntity,
      CustomerRefreshSessionEntity,
    ]),
  ],
  controllers: [CustomerAuthController],
  providers: [
    CustomerAuthService,
    CustomerJWTService,
    CustomerUserService,
    EmailService,
    CustomerJwtAuthGuard,
  ],
  exports: [CustomerAuthService, CustomerJWTService, CustomerJwtAuthGuard],
})
export class CustomerAuthModule {}
