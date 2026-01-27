import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { Brackets, Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketEntity } from './entities/ticket.entity';

@Injectable()
export class TicketService extends TypeOrmCrudService<TicketEntity> {
  constructor(@InjectRepository(TicketEntity) repo: Repository<TicketEntity>) {
    super(repo);
  }

  async findAll(keyword?: string, company?: string) {
    let query = this.repo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.createdBy', 'createdBy')
      .leftJoinAndSelect('ticket.messages', 'messages')
      .leftJoinAndSelect('ticket.attachments', 'attachments');

    if (company) {
      query = query.andWhere('ticket.company = :company', { company });
    }

    if (keyword) {
      query = query.andWhere(
        new Brackets((qb) => {
          qb.where('ticket.subject ILike :searchString', {
            searchString: `%${keyword}%`,
          }).orWhere('ticket.description ILike :searchString', {
            searchString: `%${keyword}%`,
          });
        }),
      );
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

  async save(data: CreateTicketDto): Promise<TicketEntity> {
    const newTicket = new TicketEntity({
      subject: data.subject,
      description: data.description,
      woNumber: data.woNumber,
      poNumber: data.poNumber,
      status: data.status,
      company: data.company,
      createdBy: data.createdById
        ? ({ id: data.createdById } as UserEntity)
        : undefined,
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
      createdBy: data.createdById
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
}
