import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { WoEntity } from 'src/wo/entities/wo.entity';
import { ReportEntity } from './entities/report.entity';
import { WoService } from 'src/wo/wo.service';
import { UserService } from 'src/user/user.service';
import { RoleEntity } from 'src/role/entities/role.entity';
import { TechnicianService } from 'src/technician/technician.service';
import { EmailService } from 'src/email/email.service';
import { TechnicianEntity } from 'src/technician/entities/technician.entity';
import { PusherService } from 'src/pusher/pusher.service';
import { NotificationService } from 'src/notification/notification.service';
import { HistoryService } from 'src/history/history.service';
import { PoEntity } from 'src/po/entities/po.entity';
import { PoItemEntity } from 'src/poitem/entities/poitem.entity';
import { HistoryEntity } from 'src/history/entities/history.entity';
import { BranchService } from 'src/branch/branch.service';
import { CompanyService } from 'src/company/company.service';
import { NotificationEntity } from 'src/notification/entities/notification.entity';
import { BranchEntity } from 'src/branch/entities/branch.entity';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { CustomerNoteEntity } from 'src/customer-note/entities/customer-note.entity';
import { CustomerNoteService } from 'src/customer-note/customer-note.service';
import { CustomerNotificationModule } from 'src/customer-notification/customer-notification.module';
import { CustomerUserModule } from 'src/customer-user/customer-user.module';
import { WoModule } from 'src/wo/wo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WoEntity,
      ReportEntity,
      UserEntity,
      RoleEntity,
      TechnicianEntity,
      PoEntity,
      PoItemEntity,
      HistoryEntity,
      NotificationEntity,
      BranchEntity,
      CompanyEntity,
      CustomerNoteEntity,
    ]),
    CustomerNotificationModule,
    CustomerUserModule,
    WoModule,
  ],
  controllers: [ReportController],
  providers: [
    ReportService,
    UserService,
    CompanyService,
    TechnicianService,
    EmailService,
    PusherService,
    NotificationService,
    HistoryService,
    BranchService,
    CustomerNoteService,
  ],
})
export class ReportModule {}
