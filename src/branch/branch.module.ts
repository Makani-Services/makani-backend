import { Module } from '@nestjs/common';
import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchEntity } from './entities/branch.entity';
import { PoService } from 'src/po/po.service';
import { PoEntity } from 'src/po/entities/po.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { PoItemService } from 'src/poitem/poitem.service';
import { PoItemEntity } from 'src/poitem/entities/poitem.entity';
import { UserService } from 'src/user/user.service';
import { EmailService } from 'src/email/email.service';
import { NotificationService } from 'src/notification/notification.service';
import { PusherService } from 'src/pusher/pusher.service';
import { WoService } from 'src/wo/wo.service';
import { CompanyService } from 'src/company/company.service';
import { HistoryService } from 'src/history/history.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { RoleEntity } from 'src/role/entities/role.entity';
import { NotificationEntity } from 'src/notification/entities/notification.entity';
import { TechnicianEntity } from 'src/technician/entities/technician.entity';
import { HistoryEntity } from 'src/history/entities/history.entity';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { CustomerNoteEntity } from 'src/customer-note/entities/customer-note.entity';
import { CustomerNoteService } from 'src/customer-note/customer-note.service';
import { CustomerNotificationModule } from 'src/customer-notification/customer-notification.module';
import { CustomerUserModule } from 'src/customer-user/customer-user.module';
import { WoModule } from 'src/wo/wo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BranchEntity,
      PoEntity,
      WoEntity,
      PoItemEntity,
      UserEntity,
      RoleEntity,
      NotificationEntity,
      TechnicianEntity,
      HistoryEntity,
      CompanyEntity,
      CustomerNoteEntity,
    ]),
    CustomerNotificationModule,
    CustomerUserModule,
    WoModule,
  ],
  controllers: [BranchController],
  providers: [
    BranchService,
    PoService,
    PoItemService,
    UserService,
    EmailService,
    NotificationService,
    PusherService,
    CompanyService,
    HistoryService,
    CustomerNoteService,
  ],
})
export class BranchModule {}
