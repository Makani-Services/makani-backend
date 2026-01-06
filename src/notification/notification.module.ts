import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { TechnicianService } from 'src/technician/technician.service';
import { TechnicianEntity } from 'src/technician/entities/technician.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { WoService } from 'src/wo/wo.service';
import { PusherService } from 'src/pusher/pusher.service';
import { EmailService } from 'src/email/email.service';
import { RoleEntity } from 'src/role/entities/role.entity';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { CompanyService } from 'src/company/company.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
    // TypeOrmModule.forFeature([
    //   NotificationEntity,
    // ], 'rscs'),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
