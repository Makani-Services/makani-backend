import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from 'src/permission/entities/permission.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleEntity, PermissionEntity, UserEntity]),
  ],
  providers: [RoleService, JwtService],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RoleModule {}
