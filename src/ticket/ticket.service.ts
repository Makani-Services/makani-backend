import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { getUploadUrl } from 'src/core/common/common';
import { UserEntity } from 'src/user/entities/user.entity';
import { Brackets, Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketAttachmentEntity } from './entities/ticketattachment.entity';
import { TicketEntity } from './entities/ticket.entity';
import { TicketMessageAttachmentEntity } from './entities/ticketmessageattachment.entity';
import { TicketMessageEntity } from './entities/ticketmessage.entity';
import { CreateTicketMessageDto } from 'src/ticket/dto/create-ticket-message.dto';
import { CustomerEntity } from 'src/customer/entities/customer.entity';
import { UserService } from 'src/user/user.service';
import { EmailService } from 'src/email/email.service';
import { default as config } from '../config';
import axios from 'axios';


@Injectable()
export class TicketService extends TypeOrmCrudService<TicketEntity> {
  constructor(
    @InjectRepository(TicketEntity) repo: Repository<TicketEntity>,
    @InjectRepository(TicketAttachmentEntity)
    private readonly attachmentRepo: Repository<TicketAttachmentEntity>,
    @InjectRepository(TicketMessageEntity)
    private readonly messageRepo: Repository<TicketMessageEntity>,
    @InjectRepository(TicketMessageAttachmentEntity)
    private readonly messageAttachmentRepo: Repository<TicketMessageAttachmentEntity>,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {
    super(repo);
  }

  async findAll(query: any, company?: string) {
    let baseQuery = this.repo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.createdByUser', 'createdByUser')
      .leftJoinAndSelect('ticket.createdByCustomer', 'createdByCustomer')
      .leftJoinAndSelect('ticket.requesterUser', 'requesterUser')
      .leftJoinAndSelect('ticket.requesterCustomer', 'requesterCustomer')
      .leftJoinAndSelect('ticket.assignedAgent', 'assignedAgent')
      .leftJoinAndSelect('ticket.messages', 'messages')
      .leftJoinAndSelect('ticket.attachments', 'attachments')
      .leftJoinAndSelect('messages.attachments', 'messageAttachments')
      .leftJoinAndSelect('messages.senderUser', 'messageSenderUser')
      .leftJoinAndSelect('messages.senderCustomer', 'messageSenderCustomer')

    if (company) {
      baseQuery = baseQuery.andWhere('ticket.company = :company', { company });
    }

    if (query.status) {
      baseQuery = baseQuery.andWhere('ticket.status = :status', { status: query.status });
    }
    if (query.createdByUserId) {
      baseQuery = baseQuery.andWhere('ticket.createdByUserId = :createdByUserId', { createdByUserId: query.createdByUserId });
    }
    if (query.createdByCustomerId) {
      baseQuery = baseQuery.andWhere('ticket.createdByCustomerId = :createdByCustomerId', { createdByCustomerId: query.createdByCustomerId });
    }
    if (query.requesterUserId) {
      baseQuery = baseQuery.andWhere('ticket.requesterUserId = :requesterUserId', { requesterUserId: query.requesterUserId });
    }
    if (query.requesterCustomerId) {
      baseQuery = baseQuery.andWhere('ticket.requesterCustomerId = :requesterCustomerId', { requesterCustomerId: query.requesterCustomerId });
    }
    if (query.assignedAgentId) {
      baseQuery = baseQuery.andWhere('ticket.assignedAgentId = :assignedAgentId', { assignedAgentId: query.assignedAgentId });
    }

    baseQuery = baseQuery
      .orderBy('CASE WHEN ticket.status = 100 THEN 1 ELSE 0 END', 'ASC')
      .addOrderBy('ticket.createdAt', 'DESC')
      .addOrderBy('messages.createdAt', 'ASC');

    return await baseQuery.getMany();
  }

  async getById(ticketId: number, company?: string) {
    const where: any = { id: ticketId };
    if (company) where.company = company;

    const ticket = await this.repo.findOne({
      where,
      relations: [
        'createdByUser',
        'createdByCustomer',
        'requesterUser',
        'requesterCustomer',
        'assignedAgent',
        'attachments',
        'messages',
        'messages.attachments',
        'messages.senderUser',
        'messages.senderCustomer',
        'messages.ticket.requesterUser',
        'messages.ticket.requesterCustomer',
      ],
    });

    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async save(data: CreateTicketDto, company?: string): Promise<TicketEntity> {
    const ticketNumber = await this.generateTicketNumber();
    const newTicket = new TicketEntity({
      number: ticketNumber,
      subject: data.subject,
      description: data.description,
      woNumber: data.woNumber,
      poNumber: data.poNumber,
      status: data.status,
      company: company,
      appVersion: data.appVersion,
      platform: data.platform,
      deviceModel: data.deviceModel,
      deviceOS: data.deviceOS,
      createdByUser: ({ id: data.createdByUserId } as UserEntity),
      createdByCustomer: ({ id: data.createdByCustomerId } as CustomerEntity),
      requesterUser: ({ id: data.requesterUserId } as UserEntity),
      requesterCustomer: ({ id: data.requesterCustomerId } as CustomerEntity),
      assignedAgent: ({ id: data.assignedAgentId } as UserEntity),
    });

    let result = await this.repo.save(newTicket);
    result = await this.getById(result.id, company);

    await this.sendTicketCreatedEmail(result.id, company);

    return result;
  }

  async updateTicket(data: UpdateTicketDto): Promise<TicketEntity> {
    const updated = new TicketEntity({
      id: data.id,
      subject: data.subject,
      description: data.description,
      status: data.status,
      woNumber: data.woNumber,
      poNumber: data.poNumber,
      company: data.company,
      appVersion: data.appVersion,
      platform: data.platform,
      deviceModel: data.deviceModel,
      deviceOS: data.deviceOS,
      createdByUser: ({ id: data.createdByUserId } as UserEntity),
      createdByCustomer: ({ id: data.createdByCustomerId } as CustomerEntity),
      requesterUser: ({ id: data.requesterUserId } as UserEntity),
      requesterCustomer: ({ id: data.requesterCustomerId } as CustomerEntity),
      assignedAgent: ({ id: data.assignedAgentId } as UserEntity),
    });

    return await this.repo.save(updated);
  }

  private async buildImageAttachments(attachments: TicketAttachmentEntity[]) {
    if (!attachments || attachments.length === 0) return [];

    const imageAttachments = attachments.filter((attachment) => attachment?.url);
    if (imageAttachments.length === 0) return [];

    const fetched = await Promise.all(
      imageAttachments.map(async (attachment, index) => {
        try {
          const response = await axios.get(attachment.url, {
            responseType: 'arraybuffer',
          });
          const contentType =
            attachment.mimeType ||
            response.headers?.['content-type'] ||
            'application/octet-stream';

          return {
            content: Buffer.from(response.data).toString('base64'),
            filename:
              attachment.fileName || `ticket-attachment-${attachment.id ?? index}`,
            type: contentType,
            disposition: 'attachment',
          };
        } catch (error) {
          console.log('Error fetching attachment for email:', {
            url: attachment.url,
            error,
          });
          return null;
        }
      }),
    );

    return fetched.filter(Boolean);
  }

  private async sendTicketCreatedEmail(
    ticketId: number,
    company?: string,
  ): Promise<void> {
    //send email notification to the super users
    try {
      const ticket = await this.getById(ticketId, company);
      const superUsers = await this.userService.getUsersWithRole(
        'Super Admin',
        0,
        company,
      );

      const createdByName =
        ticket.createdByUser?.name ||
        ticket.createdByCustomer?.companyName ||
        '';

      const emailLines = [
        `Subject: ${ticket.subject ?? ''}`,
        `Ticket Number: ${ticket.number ?? ''}`,
        `Description: ${ticket.description ?? ''}`,
        `WO Number: ${ticket.woNumber ?? ''}`,
        `PO Number: ${ticket.poNumber ?? ''}`,
        `Platform: ${ticket.platform ?? ''}`,
      ];

      if (ticket.platform === 'Tech app') {
        emailLines.push(
          `App Version: ${ticket.appVersion ?? ''}`,
          `Device Model: ${ticket.deviceModel ?? ''}`,
          `Device OS: ${ticket.deviceOS ?? ''}`,
        );
      }

      emailLines.push(`Created By: ${createdByName ?? ''}`);

      const emailHtml = emailLines.join('<br/>');

      const toEmailArray = superUsers.map((user) => user.email);
      const mailOptions: any = {
        from: config.mail.supportEmail,
        to: toEmailArray,
        subject: 'New ticket created',
        text: 'New ticket created - ticket number: ' + ticket.number,
        html: emailHtml,
      };
      const emailAttachments = await this.buildImageAttachments(
        ticket.attachments ?? [],
      );
      if (emailAttachments.length > 0) {
        mailOptions.attachments = emailAttachments;
      }

      await this.emailService.sendEmail(mailOptions);
    } catch (error) {
      console.log('Error sending email notification to super users:', error);
    }
  }

  async delete(ticketId: number): Promise<boolean> {
    const { affected } = await this.repo.delete(ticketId);
    if (affected && affected > 0) return true;
    throw new NotFoundException('Ticket not found');
  }

  async uploadAttachments(
    ticketId: number,
    files: Array<Express.Multer.File>,
    company?: string,
  ): Promise<TicketAttachmentEntity[]> {
    const where: any = { id: ticketId };
    if (company) where.company = company;

    const ticket = await this.repo.findOne({ where });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const attachments = files.map(
      (file) =>
        new TicketAttachmentEntity({
          ticket,
          fileName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          url: company ? getUploadUrl(company, file.filename) : undefined,
        }),
    );

    const savedAttachments = await this.attachmentRepo.save(attachments);
    return savedAttachments;
  }

  async createMessage(
    data: CreateTicketMessageDto,
    company?: string,
  ): Promise<TicketMessageEntity> {
    try {
      console.log("🚀 ~ TicketService ~ createMessage ~ data:", data)
      const where: any = { id: data.ticketId };
      if (company) where.company = company;

      const ticket = await this.repo.findOne({ where });
      if (!ticket) throw new NotFoundException('Ticket not found');

      const messageEntity = new TicketMessageEntity({
        ticket,
        message: data.message,
        senderUser: data.senderUserId ? ({ id: data.senderUserId } as UserEntity) : undefined,
        senderCustomer: data.senderCustomerId
          ? ({ id: data.senderCustomerId } as CustomerEntity)
          : undefined,
      });

      let message = await this.messageRepo.save(messageEntity);
      message = await this.messageRepo.findOne({ where: { id: message.id }, relations: ['ticket', 'ticket.requesterUser', 'ticket.requesterCustomer', 'senderUser', 'senderUser.roles', 'senderCustomer'] });

      //send email notification to the assigned agent/user/customer

      const superUsers = await this.userService.getUsersWithRole('Super Admin', 0, company);
      const superUsersEmailArray = superUsers.map(user => user.email);

      let senderName = '';
      let toEmailArray = null;
      if (message.senderCustomer) {
        senderName = message.senderCustomer.companyName;
      } else if (message.senderUser) {
        if (message.senderUser.roles[0].name === 'Super Admin') {
          toEmailArray = message.ticket.requesterUser ? message.ticket.requesterUser.email : message.ticket.requesterCustomer ? message.ticket.requesterCustomer.companyName : null;
        } else {
          toEmailArray = superUsersEmailArray;
        }
        senderName = message.senderUser.name;
      }
      console.log("🚀 ~ TicketService ~ createMessage ~ toEmailArray:", toEmailArray)

      const emailHtml = [
        `Subject: ${message.ticket.subject ?? ''}`,
        `Ticket Number: ${message.ticket.number ?? ''}`,
        `Description: ${message.ticket.description ?? ''}`,
        `WO Number: ${message.ticket.woNumber ?? ''}`,
        `PO Number: ${message.ticket.poNumber ?? ''}`,
        `App Version: ${message.ticket.appVersion ?? ''}`,
        `Sender: ${senderName ?? ''}`,
        `Message: ${message.message ?? ''}`,
      ].join('<br/>');

      const mailOptions = {
        from: config.mail.supportEmail,
        to: toEmailArray,
        subject: 'New ticket message',
        text: 'New ticket message - ticket number: ' + message.ticket.number,
        html: emailHtml,
      };
      this.emailService.sendEmail(mailOptions);

      return message
    } catch (error) {
      console.log('Error sending email notification to assigned agent/user/customer:', error);
    }
  }

  async uploadMessageAttachments(
    messageId: number,
    files: Array<Express.Multer.File>,
    company?: string,
  ): Promise<TicketMessageAttachmentEntity[]> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
      relations: ['ticket'],
    });

    if (!message) throw new NotFoundException('Ticket message not found');
    if (company && message.ticket?.company !== company) {
      throw new NotFoundException('Ticket message not found');
    }

    const attachments = files.map(
      (file) =>
        new TicketMessageAttachmentEntity({
          message,
          fileName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          url: company ? getUploadUrl(company, file.filename) : undefined,
        }),
    );

    return await this.messageAttachmentRepo.save(attachments);
  }


  private async generateTicketNumber(): Promise<string> {
    const lastTicket = await this.repo
      .createQueryBuilder('ticket')
      .select('ticket.number', 'number')
      .orderBy('CAST(ticket.number AS BIGINT)', 'DESC')
      .getRawOne<{ number?: string }>();

    if (!lastTicket?.number) {
      return '0000000000';
    }

    const nextNumber = (BigInt(lastTicket.number) + 1n).toString();
    return nextNumber.padStart(10, '0');
  }
}
