import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerLocationService } from './customer-location.service';
import { CustomerLocationController } from './customer-location.controller';
import { CustomerLocationEntity } from './entities/customer-location.entity';
import { CustomerEntity } from 'src/customer/entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerLocationEntity, CustomerEntity])],
  controllers: [CustomerLocationController],
  providers: [CustomerLocationService],
})
export class CustomerLocationModule {}
