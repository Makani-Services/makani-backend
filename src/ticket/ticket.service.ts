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

@Injectable()
export class TicketService extends TypeOrmCrudService<TicketEntity> {
  constructor(
    @InjectRepository(TicketEntity) repo: Repository<TicketEntity>,
    @InjectRepository(TicketAttachmentEntity)
    private readonly attachmentRepo: Repository<TicketAttachmentEntity>,
  ) {
    super(repo);
  }

  async findAll(status?: number, createdById?: number, company?: string) {
    let query = this.repo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.createdBy', 'createdBy')
      .leftJoinAndSelect('ticket.messages', 'messages')
      .leftJoinAndSelect('ticket.attachments', 'attachments');

    if (company) {
      query = query.andWhere('ticket.company = :company', { company });
    }

    if (status) {
      query = query.andWhere('ticket.status = :status', { status });
    }
    if (createdById) {
      query = query.andWhere('ticket.createdById = :createdById', { createdById });
    }

    query = query.orderBy('ticket.createdAt', 'DESC');

    return await query.getMany();
  }

  async getById(ticketId: number, company?: string) {
    const where: any = { id: ticketId };
    if (company) where.company = company;

    const ticket = await this.repo.findOne({
      where,
      relations: ['createdBy', 'messages', 'attachments'],
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
      createdBy: ({ id: data.createdById } as UserEntity)
    });

    return await this.repo.save(newTicket);
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
      createdBy:
        data.createdById != null
          ? ({ id: data.createdById } as UserEntity)
          : undefined,
    });

    return await this.repo.save(updated);
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

    return await this.attachmentRepo.save(attachments);
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
