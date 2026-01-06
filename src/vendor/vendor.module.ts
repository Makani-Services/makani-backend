import { Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { VendorEntity } from './entities/vendor.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/user/entities/user.entity';
import { RoleEntity } from 'src/role/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VendorEntity, UserEntity, RoleEntity])],
  controllers: [VendorController],
  providers: [VendorService, JwtService],
})
export class VendorModule {}
