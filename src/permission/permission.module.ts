import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from 'src/role/entities/role.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { PermissionEntity } from './entities/permission.entity';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    PermissionEntity,
    UserEntity,
    RoleEntity
  ])],
  providers: [PermissionService],
  controllers: [PermissionController],
  exports: [PermissionService]
})
export class PermissionModule { }
