import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { MaterialCategoryEntity } from './entities/material-category.entity';
import { MaterialTypeEntity } from './entities/material-type.entity';
import { WoMaterialEntity } from './entities/wo-material.entity';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaterialCategoryEntity,
      MaterialTypeEntity,
      WoMaterialEntity,
      WoEntity,
    ]),
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MaterialService],
})
export class MaterialModule {}
