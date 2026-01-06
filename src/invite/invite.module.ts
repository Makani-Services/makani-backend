import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { InviteEntity } from './entities/invite.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from 'src/email/email.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { ReportEntity } from 'src/report/entities/report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InviteEntity, UserEntity, ReportEntity]),
    UserModule,
  ],
  controllers: [InviteController],
  providers: [InviteService, EmailService],
})
export class InviteModule {}
