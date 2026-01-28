import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WoService } from './wo.service';
import { WoController } from './wo.controller';
import { WoEntity } from './entities/wo.entity';
import { RoleEntity } from 'src/role/entities/role.entity';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { PusherService } from 'src/pusher/pusher.service';
import { EmailService } from 'src/email/email.service';
import { NotificationModule } from 'src/notification/notification.module';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationEntity } from 'src/notification/entities/notification.entity';
import { TechnicianEntity } from 'src/technician/entities/technician.entity';
import { TechnicianService } from 'src/technician/technician.service';
import { PoEntity } from 'src/po/entities/po.entity';
import { CompanyService } from 'src/company/company.service';
import { CompanyEntity } from 'src/company/entities/company.entity';
import { UserModule } from 'src/user/user.module';
import { PoItemEntity } from 'src/poitem/entities/poitem.entity';
import { PoService } from 'src/po/po.service';
import { PoItemService } from 'src/poitem/poitem.service';
import { RoleService } from 'src/role/role.service';
import { TimesheetEntity } from 'src/timesheet/entities/timesheet.entity';
import { TimesheetService } from 'src/timesheet/timesheet.service';
import { PermissionEntity } from 'src/permission/entities/permission.entity';
import { PermissionService } from 'src/permission/permission.service';
import { HistoryEntity } from 'src/history/entities/history.entity';
import { HistoryService } from 'src/history/history.service';
import { BranchEntity } from 'src/branch/entities/branch.entity';
import { BranchService } from 'src/branch/branch.service';
import { CustomerNoteEntity } from 'src/customer-note/entities/customer-note.entity';
import { CustomerNoteService } from 'src/customer-note/customer-note.service';
import { CustomerNotificationModule } from 'src/customer-notification/customer-notification.module';
import { CustomerUserModule } from 'src/customer-user/customer-user.module';
import { MaterialModule } from 'src/material/material.module';
import { WoAttachmentEntity } from './entities/woattachment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WoEntity,
      WoAttachmentEntity,
      RoleEntity,
      PermissionEntity,
      UserEntity,
      TechnicianEntity,
      CompanyEntity,
      NotificationEntity,
      PoEntity,
      HistoryEntity,
      BranchEntity,
      PoItemEntity,
      TimesheetEntity,
      CustomerNoteEntity,
    ]),
    CustomerNotificationModule,
    CustomerUserModule,
    MaterialModule,
  ],
  controllers: [WoController],
  providers: [
    WoService,
    JwtService,
    UserService,
    RoleService,
    PermissionService,
    PusherService,
    EmailService,
    NotificationService,
    PoItemService,
    TechnicianService,
    CompanyService,
    HistoryService,
    BranchService,
    PoService,
    TimesheetService,
    CustomerNoteService,
  ],
  exports: [WoService],
})
export class WoModule {}
