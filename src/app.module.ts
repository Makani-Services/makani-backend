import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { WoModule } from './wo/wo.module';
import { RoleModule } from './role/role.module';
import { CustomerModule } from './customer/customer.module';
import { TechnicianModule } from './technician/technician.module';
import { PoModule } from './po/po.module';
import { PoItemModule } from './poitem/poitem.module';
import { TimesheetModule } from './timesheet/timesheet.module';
import { NotificationModule } from './notification/notification.module';
import { CompanyModule } from './company/company.module';
import { VendorModule } from './vendor/vendor.module';

//datasourceoptions
import { rscsDataSourceOptions } from './datasources/rscs-datasource';
import { ScheduledTaskModule } from './scheduled-task/scheduled-task.module';
import { HistoryModule } from './history/history.module';
import { ReportModule } from './report/report.module';
import { BranchModule } from './branch/branch.module';
import { InviteModule } from './invite/invite.module';
import { KeywordModule } from './keyword/keyword.module';
import { CustomerUserModule } from './customer-user/customer-user.module';
import { CustomerUserInviteModule } from './customer-user-invite/customer-user-invite.module';
import { CustomerAuthModule } from './customer-auth/customer-auth.module';
import { CustomerLocationModule } from './customer-location/customer-location.module';
import { CustomerRoleModule } from './customer-role/customer-role.module';
import { CustomerNoteModule } from './customer-note/customer-note.module';
import { CustomerNotificationModule } from './customer-notification/customer-notification.module';
import { MaterialModule } from './material/material.module';
import { TicketModule } from './ticket/ticket.module';

let publicFolder = {
  rootPath: join(__dirname, '..', 'public'),
};
if (
  process.env.NODE_ENV === 'production' ||
  process.env.NODE_ENV === 'staging'
) {
  publicFolder = {
    rootPath: join(__dirname, '..', 'dist', 'public'),
  };
}

// console.log('publicFolder: ', publicFolder, process.env.NODE_ENV, config.db.pass);

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...rscsDataSourceOptions, autoLoadEntities: true }),
    ServeStaticModule.forRoot(publicFolder),
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    WoModule,
    RoleModule,
    PoModule,
    PoItemModule,
    CustomerModule,
    TechnicianModule,
    TimesheetModule,
    NotificationModule,
    CompanyModule,
    VendorModule,
    ScheduledTaskModule,
    HistoryModule,
    ReportModule,
    BranchModule,
    InviteModule,
    KeywordModule,
    CustomerUserModule,
    CustomerUserInviteModule,
    CustomerAuthModule,
    CustomerLocationModule,
    CustomerRoleModule,
    CustomerNoteModule,
    CustomerNotificationModule,
    MaterialModule,
    TicketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
