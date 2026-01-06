import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// import { WoService } from './wo.service';
// import { WoController } from './wo.controller';
// import { WOEntity } from './entities/wo.entity';

import { RoleEntity } from 'src/role/entities/role.entity';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/user/entities/user.entity';
import { PoEntity } from './entities/po.entity';
import { PoController } from './po.controller';
import { PoService } from './po.service';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { PoItemEntity } from 'src/poitem/entities/poitem.entity';
import { PoItemService } from 'src/poitem/poitem.service';
import { UserService } from 'src/user/user.service';
import { EmailService } from 'src/email/email.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationHistorySuccessResponse } from '@onesignal/node-onesignal';
import { NotificationEntity } from 'src/notification/entities/notification.entity';
import { PusherService } from 'src/pusher/pusher.service';
import { TechnicianEntity } from 'src/technician/entities/technician.entity';
import { CompanyService } from 'src/company/company.service';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { UserModule } from 'src/user/user.module';
import { WoModule } from 'src/wo/wo.module';

import { HistoryEntity } from 'src/history/entities/history.entity';
import { HistoryService } from 'src/history/history.service';
import { BranchService } from 'src/branch/branch.service';
import { BranchEntity } from 'src/branch/entities/branch.entity';
import { CustomerNoteEntity } from 'src/customer-note/entities/customer-note.entity';
import { CustomerNoteService } from 'src/customer-note/customer-note.service';
import { CustomerNotificationModule } from 'src/customer-notification/customer-notification.module';
import { CustomerUserModule } from 'src/customer-user/customer-user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PoEntity,
      RoleEntity,
      UserEntity,
      WoEntity,
      PoItemEntity,
      NotificationEntity,
      TechnicianEntity,
      CompanyEntity,
      HistoryEntity,
      BranchEntity,
      CustomerNoteEntity,
    ]),
    CustomerNotificationModule,
    CustomerUserModule,
    WoModule,
  ],
  controllers: [PoController],
  providers: [
    PoService,
    JwtService,
    PoItemService,
    UserService,
    EmailService,
    NotificationService,
    PusherService,
    CompanyService,
    HistoryService,
    BranchService,
    CustomerNoteService,
  ],
})
export class PoModule {}
