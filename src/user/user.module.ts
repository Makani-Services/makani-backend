import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleEntity } from 'src/role/entities/role.entity';
import { UserEntity } from './entities/user.entity';
import { TechnicianEntity } from 'src/technician/entities/technician.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RefreshSessionEntity } from 'src/auth/entities/refreshSession.entity';
import { JwtService } from '@nestjs/jwt';
import { CompanyService } from 'src/company/company.service';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { ReportEntity } from 'src/report/entities/report.entity';
import { PusherModule } from 'src/pusher/pusher.module';

@Module({
  imports: [
    PusherModule,
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      RefreshSessionEntity,
      TechnicianEntity,
      ReportEntity,
      CompanyEntity,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, JwtService, CompanyService],
  exports: [UserService],
})
export class UserModule { }
