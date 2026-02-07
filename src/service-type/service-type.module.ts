import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceTypeController } from './service-type.controller';
import { ServiceTypeService } from './service-type.service';
import { ServiceTypeEntity } from './entities/service-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceTypeEntity])],
  controllers: [ServiceTypeController],
  providers: [ServiceTypeService],
})
export class ServiceTypeModule {}
