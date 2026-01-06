import { Module } from '@nestjs/common';
import { CustomerNotificationService } from './customer-notification.service';
import { CustomerNotificationController } from './customer-notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerNotificationEntity } from './entities/customer-notification.entity';
import { CustomerLocationService } from '../customer-location/customer-location.service';
import { CustomerLocationEntity } from '../customer-location/entities/customer-location.entity';
import { CustomerEntity } from '../customer/entities/customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerNotificationEntity,
      CustomerLocationEntity,
      CustomerEntity,
    ]),
  ],
  controllers: [CustomerNotificationController],
  providers: [CustomerNotificationService, CustomerLocationService],
  exports: [CustomerNotificationService],
})
export class CustomerNotificationModule {}
