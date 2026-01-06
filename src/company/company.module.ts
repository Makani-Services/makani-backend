import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { CompanyEntity } from './entities/company.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/user/entities/user.entity';
import { RoleEntity } from 'src/role/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEntity, UserEntity, RoleEntity])],
  controllers: [CompanyController],
  providers: [CompanyService, JwtService],
})
export class CompanyModule {}
