import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerNoteService } from './customer-note.service';
import { CustomerNoteController } from './customer-note.controller';
import { CustomerNoteEntity } from './entities/customer-note.entity';
import { CustomerNotificationModule } from '../customer-notification/customer-notification.module';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';
import { PusherModule } from '../pusher/pusher.module';
import { CustomerUserModule } from '../customer-user/customer-user.module';
import { WoEntity } from '../wo/entities/wo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerNoteEntity, WoEntity]),
    CustomerNotificationModule,
    UserModule,
    EmailModule,
    PusherModule,
    CustomerUserModule,
  ],
  controllers: [CustomerNoteController],
  providers: [CustomerNoteService],
})
export class CustomerNoteModule {}
