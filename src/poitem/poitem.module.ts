import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoleEntity } from 'src/role/entities/role.entity';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/user/entities/user.entity';
import { PoItemEntity } from './entities/poitem.entity';
import { PoItemController } from './poitem.controller';
import { PoItemService } from './poitem.service';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { PoEntity } from 'src/po/entities/po.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PoItemEntity,
      RoleEntity,
      UserEntity,
      WoEntity,
      PoEntity,
    ]),
  ],
  controllers: [PoItemController],
  providers: [PoItemService, JwtService],
})
export class PoItemModule {}
