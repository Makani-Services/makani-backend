import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from 'src/role/entities/role.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailVerificationEntity } from './entities/email-verification.entity';
import { ForgottenPasswordEntity } from './entities/forgotten-password.entity';
import { JWTService } from './jwt.service';
import { JwtModule } from '@nestjs/jwt';
import { default as config } from 'src/config';
import { RefreshSessionEntity } from './entities/refreshSession.entity';
import { EmailService } from 'src/email/email.service';
import { CompanyService } from 'src/company/company.service';
import { CompanyEntity } from 'src/company/entities/company.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: config.jwt.secretOrKey,
        // signOptions: { expiresIn: config.get('JWT_EXPIRES') },
      }),
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      EmailVerificationEntity,
      ForgottenPasswordEntity,
      RefreshSessionEntity,
      CompanyEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JWTService,
    UserService,
    EmailService,
    CompanyService,
  ],
})
export class AuthModule {}
