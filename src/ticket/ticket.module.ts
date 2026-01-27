import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from 'src/role/entities/role.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { TicketEntity } from './entities/ticket.entity';
import { TicketMessageEntity } from './entities/ticketmessage.entity';
import { TicketAttachmentEntity } from './entities/ticketattachment.entity';
import { TicketMessageAttachmentEntity } from './entities/ticketmessageattachment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TicketEntity,
      TicketMessageEntity,
      TicketAttachmentEntity,
      TicketMessageAttachmentEntity,
      UserEntity,
      RoleEntity,
    ]),
  ],
  controllers: [TicketController],
  providers: [TicketService, JwtService],
})
export class TicketModule { }
