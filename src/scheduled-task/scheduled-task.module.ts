import { Module } from '@nestjs/common';
import { ScheduledTaskService } from './scheduled-task.service';
import { ScheduledTaskController } from './scheduled-task.controller';
import { WoService } from 'src/wo/wo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { RoleEntity } from 'src/role/entities/role.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { NotificationEntity } from 'src/notification/entities/notification.entity';
import { TechnicianEntity } from 'src/technician/entities/technician.entity';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { PusherService } from 'src/pusher/pusher.service';
import { EmailService } from 'src/email/email.service';
import { NotificationService } from 'src/notification/notification.service';
import { CompanyService } from 'src/company/company.service';
import { UserService } from 'src/user/user.service';
import { PoService } from 'src/po/po.service';
import { PoEntity } from 'src/po/entities/po.entity';
import { PoItemEntity } from 'src/poitem/entities/poitem.entity';
import { PoItemService } from 'src/poitem/poitem.service';
import { HistoryService } from 'src/history/history.service';
import { HistoryEntity } from 'src/history/entities/history.entity';
import { BranchService } from 'src/branch/branch.service';
import { BranchEntity } from 'src/branch/entities/branch.entity';
import { ReportService } from 'src/report/report.service';
import { ReportEntity } from 'src/report/entities/report.entity';
import { TechnicianService } from 'src/technician/technician.service';
import { CustomerNoteEntity } from 'src/customer-note/entities/customer-note.entity';
import { CustomerNoteService } from 'src/customer-note/customer-note.service';
import { CustomerNotificationModule } from 'src/customer-notification/customer-notification.module';
import { CustomerUserModule } from 'src/customer-user/customer-user.module';
import { WoModule } from 'src/wo/wo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WoEntity,
      RoleEntity,
      UserEntity,
      NotificationEntity,
      TechnicianEntity,
      CompanyEntity,
      PoEntity,
      PoItemEntity,
      HistoryEntity,
      BranchEntity,
      ReportEntity,
      CustomerNoteEntity,
    ]),
    CustomerNotificationModule,
    CustomerUserModule,
    WoModule,
  ],
  controllers: [ScheduledTaskController],
  providers: [
    ScheduledTaskService,
    PusherService,
    EmailService,
    NotificationService,
    CompanyService,
    UserService,
    PoService,
    PoItemService,
    HistoryService,
    BranchService,
    ReportService,
    TechnicianService,
    CustomerNoteService,
  ],
})
export class ScheduledTaskModule {}
