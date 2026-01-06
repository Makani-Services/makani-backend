import { Module } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { TechnicianController } from './technician.controller';
import { UserEntity } from 'src/user/entities/user.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechnicianEntity } from './entities/technician.entity';
import { JwtService } from '@nestjs/jwt';
import { RoleEntity } from 'src/role/entities/role.entity';
import { WoService } from 'src/wo/wo.service';
import { UserService } from 'src/user/user.service';
import { PusherService } from 'src/pusher/pusher.service';
import { EmailService } from 'src/email/email.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationEntity } from 'src/notification/entities/notification.entity';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { CompanyService } from 'src/company/company.service';
import { UserModule } from 'src/user/user.module';

import { PoEntity } from 'src/po/entities/po.entity';
import { PoItemEntity } from 'src/poitem/entities/poitem.entity';
import { HistoryEntity } from 'src/history/entities/history.entity';
import { HistoryService } from 'src/history/history.service';
import { BranchService } from 'src/branch/branch.service';
import { BranchEntity } from 'src/branch/entities/branch.entity';
import { CustomerNoteEntity } from 'src/customer-note/entities/customer-note.entity';
import { CustomerNoteService } from 'src/customer-note/customer-note.service';
import { CustomerNotificationModule } from 'src/customer-notification/customer-notification.module';
import { CustomerUserModule } from 'src/customer-user/customer-user.module';
import { WoModule } from 'src/wo/wo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TechnicianEntity,
      UserEntity,
      WoEntity,
      RoleEntity,
      NotificationEntity,
      CompanyEntity,
      PoEntity,
      PoItemEntity,
      HistoryEntity,
      BranchEntity,
      CustomerNoteEntity,
    ]),
    CustomerNotificationModule,
    CustomerUserModule,
    WoModule,
  ],
  controllers: [TechnicianController],
  providers: [
    TechnicianService,
    JwtService,
    UserService,
    PusherService,
    EmailService,
    NotificationService,
    CompanyService,
    HistoryService,
    BranchService,
    CustomerNoteService,
  ],
})
export class TechnicianModule {}
